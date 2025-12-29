import {
  Component,
  signal,
  inject,
  effect,
  ViewChild,
  ElementRef,
  AfterViewInit,
  HostListener,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { SpeechService } from "../../services/ai/speech.eleven.service";
import { RecordingTranscriptionService } from "../../services/ai/recording-transcription.service";
import { GeminiChatService } from "#services/ai/gemini-chat.servce";
import { WaitService } from "src/app/ui/dialogs/wait-service/wait-service.component";
import { ChatContext } from "./services/chat-context.service";
import { buildingServiceFactory } from "../building/services/building-service";
import { DbTaskService } from "../tasks/services/task-service";
import { TaskPriority, TaskStatus } from "../tasks/services/task";
import { ActivatedRoute } from "@angular/router";
import { MessagingService } from "src/app/standard/messaging/services/message.service";
import { AuthService } from "#services/auth";
import { DbUserService } from "#services/db";
import { where } from "@angular/fire/firestore";
import { ImageService } from "#services/image.service";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";

type Role = "you" | "ai";

interface ChatReference {
  type?: string;
  id?: string;
}

interface ChatMessage {
  from: Role;
  text: string;
  tldr?: string;
  references?: ChatReference[];
  imageUrl?: string;
  ts: string;
}

interface ReferenceDisplay {
  id: string;
  title: string;
  date: Date;
  description: string;
}

type TopicEntry = { type: string; data: any };
type TaskSuggestion = {
  title: string;
  description?: string;
  referenceId?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
};

type MessageSuggestion = {
  subject: string;
  body?: string;
  recipient: string;
};

@Component({
  standalone: true,
  selector: "ai-chat",
  imports: [CommonModule, TranslatePipe, FormsModule],
  templateUrl: "./ai-chat.component.html",
})
/**
 * TODO refactor this giant monster :-(
 */
export class AIChatComponent implements AfterViewInit {

  @ViewChild("messagesContainer") private messagesContainer?: ElementRef<HTMLDivElement>;

  //TODO wouldn't it be nice to provide news or other facts while waiting
  wait = inject(WaitService)

  imageService = inject(ImageService)

  route = inject(ActivatedRoute)

  buildingService = buildingServiceFactory("DEMO")

  //TODO this building service or building for the user should be got from above and injected.
  contextService = inject(ChatContext)
  messages = signal<ChatMessage[]>([]);
  inputText = "";
  selectedTopic = signal<TopicEntry | null>(null);
  private baseContext = JSON.stringify(this.contextService.buildChatPrompt());
  private readonly historyStorageKeyBase = "gemini-chat-history";
  private lastHistoryKey: string | null = null;

  readonly allTopics: TopicEntry[] = [];

  // voice state
  recording = signal(false);
  uploading = signal(false);
  transcribing = signal(false);
  error = signal<string | null>(null);
  taskSuggestion = signal<TaskSuggestion | null>(null);
  messageSuggestion = signal<MessageSuggestion | null>(null);
  creatingTask = signal(false);
  sendingMessage = signal(false);

  private audioChunks: BlobPart[] = [];
  private mediaRecorder: MediaRecorder | null = null;
  private currentStream: MediaStream | null = null;

  attachmentMenuOpen = signal(false);
  selectedAttachment = signal<File | null>(null);

  @ViewChild("cameraInput") private cameraInput?: ElementRef<HTMLInputElement>;
  @ViewChild("galleryInput") private galleryInput?: ElementRef<HTMLInputElement>;

  //TODO can we 
  private speechService = inject(SpeechService);
  private recordingTranscription = inject(RecordingTranscriptionService);
  speaking = signal(false);
  private translate = inject(TranslateService);

  //messaging 
  messageService = inject(MessagingService)
  auth = inject(AuthService)
  userService = inject(DbUserService)

  //-- lets get to it

  private t(key: string, params?: Record<string, any>): string {
    return this.translate.instant(key, params);
  }

  startNewChat() {
    this.gemini.resetHistory();
    localStorage.removeItem(this.historyStorageKey());
    this.messages.set([]);
    this.selectedTopic.set(null);
    this.taskSuggestion.set(null);
    this.messageSuggestion.set(null);
    this.allTopics.splice(0);
    this.inputText = "";
    this.loadingReply.set(false);
    this.gemini.initialiseContext(this.baseContext);
  }
  
  private gemini = inject(GeminiChatService);
  private taskService = inject(DbTaskService);

  loadingReply = signal(false);

  constructor(){
    this.gemini.initialiseContext(this.baseContext)
    effect(() => {
      const historyKey = this.historyStorageKey();
      if (historyKey === this.lastHistoryKey) return;

      this.lastHistoryKey = historyKey;
      this.messages.set([]);
      this.selectedTopic.set(null);
      this.taskSuggestion.set(null);
      this.messageSuggestion.set(null);
      this.restoreHistory(historyKey);
    });
    effect(() => {
      this.messages();
      queueMicrotask(() => this.scrollToBottom());
    });
  }

  ngOnInit(){
    const id = this.route.snapshot.paramMap.get("id");
    if(id){
      const item = this.buildingService.getTopic(id);
      if (item) {
        const type = this.detectTopicType(item);
        if(type === "resident"){
          return;
        }else{
        const title =
          (type !== "resident" && "title" in item ? item.title : undefined) ||
          ("name" in item ? item.name : undefined) ||
          ("message" in item ? item.message : undefined) ||
          ("description" in item ? item.description : undefined) ||
          "ce sujet";
        const label =
          type === "issue"
            ? "l'incident"
            : type === "announcement"
              ? "l'annonce"
              : type === "document"
                ? "le document"
                : type === "work"
                  ? "les travaux"
                  : "le sujet";
        const question = `Peux-tu me résumer ${label} "${title}" ?`;
        queueMicrotask(() => this.addUserAndLlmReply(question));
        }
      }
    }
  }

  ngAfterViewInit() {

  }

  private historyStorageKey(): string {
    const user = this.auth.user();
    const identifier = user?.uid ?? user?.email ?? "anonymous";
    return `${this.historyStorageKeyBase}-${identifier}`;
  }

  private restoreHistory(historyKey: string) {
    const cached = localStorage.getItem(historyKey);
    if (!cached) return;

    try {
      const history = JSON.parse(cached);
      if (!Array.isArray(history)) return;

      const parseAiPayload = (raw: any) => {
        if (typeof raw !== "string") return null;

        const cleaned = raw
          .replace(/^```json\s*/i, "")
          .replace(/```[\s\r\n]*$/i, "")
          .trim();

        try {
          const parsed = JSON.parse(cleaned);
          if (!parsed || typeof parsed !== "object") return null;

          const references =
            Array.isArray(parsed.references) && parsed.references.length
              ? parsed.references
                  .map((ref: any) => ({
                    type: ref?.type ? String(ref.type) : "",
                    id: ref?.id ? String(ref.id) : "",
                  }))
                  .filter((ref: ChatReference) => ref.type !== "" || ref.id !== "")
              : undefined;

          return {
            text:
              typeof parsed.answer === "string" ? parsed.answer : String(raw ?? ""),
            tldr: typeof parsed.tldr === "string" ? parsed.tldr : undefined,
            references,
          };
        } catch {
          return null;
        }
      };

      const restored: ChatMessage[] = history
        .filter(
          (entry: any) =>
            (entry?.role === "user" || entry?.role === "model") &&
            typeof entry?.text === "string"
        )
        .map((entry: any) => {
          const ts = new Date().toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          });

          if (entry.role === "model") {
            const parsed = parseAiPayload(entry.text);
            return {
              from: "ai",
              text: parsed?.text ?? entry.text,
              tldr: parsed?.tldr,
              references: parsed?.references,
              ts,
            };
          }

          return {
            from: "you",
            text: entry.text,
            ts,
          };
        });

      if (restored.length) {
        this.messages.set(restored);
      }
    } catch (err) {
      console.error("Failed to restore chat history", err);
      localStorage.removeItem(historyKey);
    }
  }

  // ---------- methods for interacting with results ----------- //

  getReference(ref){
    
    const reference = this.buildingService.getTopic(ref.id)
    if (!reference) {
      this.selectedTopic.set(null);
      return;
    }

    const type = ref?.type || this.detectTopicType(reference);
    this.selectedTopic.set({ type, data: reference });
    
  }

  /**
   * 
   * @param aiMsg 
   * @returns 
   */
  private buildTopics(aiMsg): TopicEntry[] {
    if (!this.buildingService) return [];
    if(!aiMsg?.references){
      this.allTopics.splice(0);
      return [];
    }
    
    const buildingId = this.buildingService.getBuilding(aiMsg.buildingId)?.id;
    const topics = aiMsg.references.reduce((list: TopicEntry[], ref: ChatReference) => {
      if (!ref?.id) return list;
      if (ref.type === "building") return list;
      if (buildingId && ref.id === buildingId) return list;

      const data = this.buildingService.getTopic(ref.id);
      if (!data) return list;

      const type = ref.type || this.detectTopicType(data);
      list.push({ type, data });
      return list;
    }, []);

    this.allTopics.splice(0, this.allTopics.length, ...topics);
    return this.allTopics;
  }

  /**
   * 
   * @param reference 
   * @returns 
   */
  getDisplayModel(reference: any): ReferenceDisplay {
    if (!reference) {
      return {
        id: "",
        title: this.t("ai_chat.display.topic"),
        date: new Date(),
        description: "",
      };
    }

    const type = this.detectTopicType(reference);

    if (type === "resident") {
      const ownership = reference.owner
        ? this.t("ai_chat.resident.owner")
        : this.t("ai_chat.resident.tenant");
      const lot = reference.lot
        ? this.t("ai_chat.resident.lot", { value: reference.lot })
        : "";
      const thousandths = reference.thousandths
        ? this.t("ai_chat.resident.thousandths", { value: reference.thousandths })
        : "";
      const parts = [lot, ownership, thousandths].filter(Boolean).join(" · ");
      return {
        id: reference.id ?? "",
        title: reference.name ?? this.t("ai_chat.display.resident"),
        date: new Date(),
        description: parts,
      };
    }

    if (type === "issue") {
      return {
        id: reference.id ?? "",
        title: reference.title ?? this.t("ai_chat.display.issue"),
        date: new Date(reference.date ?? Date.now()),
        description:
          reference.description ??
          reference.resolution ??
          reference.category ??
          "",
      };
    }

    if (type === "announcement") {
      return {
        id: reference.id ?? "",
        title: reference.title ?? this.t("ai_chat.display.announcement"),
        date: new Date(reference.date ?? Date.now()),
        description: reference.message ?? "",
      };
    }

    if (type === "work") {
      const contractor = reference.contractor
        ? this.t("ai_chat.work.contractor", { contractor: reference.contractor })
        : "";
      const budget = reference.budget
        ? this.t("ai_chat.work.budget", { budget: reference.budget })
        : "";
      const status = reference.status
        ? this.t("ai_chat.work.status", { status: reference.status })
        : "";
      const parts = [status, contractor, budget].filter(Boolean).join(" · ");
      return {
        id: reference.id ?? "",
        title: reference.title ?? this.t("ai_chat.display.work"),
        date: new Date(reference.startDate ?? reference.endDate ?? Date.now()),
        description: parts,
      };
    }

    if (type === "document") {
      const date =
        reference.date instanceof Date
          ? reference.date
          : new Date(reference.date ?? Date.now());
      const tagText = Array.isArray(reference.tags)
        ? reference.tags.join(", ")
        : "";
      return {
        id: reference.id ?? "",
        title: reference.title ?? this.t("ai_chat.display.document"),
        date,
        description: reference.type ?? tagText ?? "",
      };
    }

    return {
      id: reference.id ?? "",
      title: reference.title ?? reference.name ?? this.t("ai_chat.display.topic"),
      date: new Date(),
      description:
        reference.description ??
        reference.message ??
        reference.content ??
        reference.type ??
        "",
    };
  }

  // ---- text chat ----

  @HostListener("document:click")
  closeAttachmentMenu() {
    this.attachmentMenuOpen.set(false);
  }

  toggleAttachmentMenu(event?: Event) {
    event?.stopPropagation();
    this.attachmentMenuOpen.update((open) => !open);
  }

  triggerCameraCapture(event?: Event) {
    event?.stopPropagation();
    this.attachmentMenuOpen.set(false);
    this.cameraInput?.nativeElement.click();
  }

  triggerGalleryPicker(event?: Event) {
    event?.stopPropagation();
    this.attachmentMenuOpen.set(false);
    this.galleryInput?.nativeElement.click();
  }

  /**
   * There has to be a better way ... I keep copying this
   * code over and over.
   * @param image
   */
  imageFile(image: File | null) {
    if (!image) return;

    this.wait.show();
    this.imageService.handleFile(
      image,
      "tickets",
      (imageURL) => {
        const prompt = `Analyse cette image et suggère la prochaine action : ${imageURL}`;
        this.selectedAttachment.set(null);
        this.wait.hide();
        this.addUserAndLlmReply(prompt, imageURL);
      },
      () => {
        this.wait.hide();
      }
    );
  }

  onAttachmentSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedAttachment.set(file);
    input.value = "";
    this.imageFile(file)
  }

  clearAttachment(event?: Event) {
    event?.stopPropagation();
    this.selectedAttachment.set(null);
  }

  sendMessage() {
    const text = this.inputText.trim();
    if (!text || this.recording() || this.uploading() || this.transcribing())
      return;
    this.addUserAndLlmReply(text)
    this.inputText = "";
  }

  // ---- voice recording ----

  /**
   * 
   * @returns 
   */
  startRecording() {
    if (this.recording() || this.uploading() || this.transcribing()) return;

    this.error.set(null);
    this.audioChunks = [];

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        this.currentStream = stream;
        this.mediaRecorder = new MediaRecorder(stream);

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };

        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.audioChunks, { type: "audio/webm" });
          this.stopStream();
          this.recording.set(false);
          if (blob.size > 0) {
            this.uploadAndTranscribe(blob);
          }
        };

        this.mediaRecorder.start();
        this.recording.set(true);
      })
      .catch((err) => {
        console.error(err);
        this.error.set(this.t("ai_chat.errors.microphoneAccess"));
        this.stopStream();
        this.recording.set(false);
      });
  }

  // user cancels (X)
  cancelRecording() {
    this.error.set(null);
    if (this.mediaRecorder && this.recording()) {
      this.mediaRecorder.stop();
    } else {
      this.stopStream();
    }
    this.recording.set(false);
    this.audioChunks = [];
  }

  // user validates (✓) -> stop recorder & send
  confirmRecording() {
    if (!this.mediaRecorder || !this.recording()) return;
    this.mediaRecorder.stop(); // onstop will call uploadAndTranscribe
  }

  private stopStream() {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach((t) => t.stop());
      this.currentStream = null;
    }
  }

  private detectTopicType(reference: any): string {
    if (!reference) return "topic";
    if ("lot" in reference) return "resident";
    if ("resolution" in reference) return "issue";
    if ("message" in reference) return "announcement";
    if ("contractor" in reference) return "work";
    if ("url" in reference || "content" in reference) return "document";
    return "topic";
  }

  private uploadAndTranscribe(blob: Blob) {
    this.uploading.set(true);
    this.transcribing.set(true);
    this.error.set(null);

    this.recordingTranscription
      .transcribeRecording(blob)
      .then((transcript) => {
        if (!transcript) {
          console.warn("No transcript returned from speech service.");
          this.error.set(this.t("ai_chat.errors.transcriptionFailed"));
          return;
        }

        this.addUserAndLlmReply(transcript);
      })
      .catch((err) => {
        console.error(err);
        this.error.set(this.t("ai_chat.errors.recordingFailed"));
      })
      .finally(() => {
        this.uploading.set(false);
        this.transcribing.set(false);
      });
  }

  //---try getting the voice out now

  /**
   * voice part
   * @param tldr 
   * @returns 
   */
   speak(tldr){
    if (!tldr || this.speaking()) return;
    this.speaking.set(true);

    try {
      this.speechService.textToSpeech(tldr, results => {
        console.log(results)
        const url = results?.data?.url;
        if (!url) {
          this.speaking.set(false);
          return;
        }
        const audio = new Audio(url);
        const reset = () => this.speaking.set(false);
        audio.addEventListener("ended", reset, { once: true });
        audio.addEventListener("error", reset, { once: true });
        audio.play().catch(err => {
          console.error(err);
          reset();
        });
      });
    } catch (err) {
      console.error(err);
      this.speaking.set(false);
    }
   }

  //-----here we add in the context for gemma
  private addUserAndLlmReply(text: string, imageUrl?: string) {
    const ts = new Date().toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const current = this.messages();

    const userMsg: ChatMessage = {
      from: "you",
      text,
      imageUrl,
      ts,
    };

    // optimistic: add user message immediately
    this.messages.set([...current, userMsg]);
    this.loadingReply.set(true);

    //const prompt = this.contextService.buildChatPrompt();

    this.wait
      .wrap(this.gemini.ask(text), this.t("ai_chat.wait.generatingReply"))
      .then((answer: any) => {
        console.log(answer)

        let normalizedAnswer: any = answer;
        if (typeof normalizedAnswer === "string") {
          const parsed = this.tryParseJsonFromText(normalizedAnswer);
          if (parsed !== null) {
            normalizedAnswer = parsed;
          }
        }

        const structured = normalizedAnswer && typeof normalizedAnswer === "object";
        const references = structured && Array.isArray(normalizedAnswer.references)
          ? normalizedAnswer.references
              .map((ref: any) => ({
                type: ref?.type ? String(ref.type) : "",
                id: ref?.id ? String(ref.id) : "",
              }))
              .filter((ref: ChatReference) => ref.type !== "" || ref.id !== "")
          : [];

        const aiText =
          structured && typeof normalizedAnswer.answer === "string"
            ? normalizedAnswer.answer
            : structured
              ? JSON.stringify(normalizedAnswer)
              : String(normalizedAnswer ?? "");

        const aiMsg: ChatMessage = {
          from: "ai",
          text: aiText,
          tldr: structured ? normalizedAnswer.tldr : undefined,
          references: references.length ? references : undefined,
          ts: new Date().toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        const now = this.messages();
        this.messages.set([...now, aiMsg]);

        this.taskSuggestion.set(structured ? this.extractTaskSuggestion(normalizedAnswer) : null);

        this.messageSuggestion.set(this.extractMessageSuggestion(normalizedAnswer));
        this.buildTopics(aiMsg)
      })
      .catch((err) => {
        console.error("Gemini error", err);
        const aiMsg: ChatMessage = {
          from: "ai",
          text: this.t("ai_chat.errors.assistantUnavailable"),
          ts: new Date().toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        const now = this.messages();
        this.messages.set([...now, aiMsg]);
      })
      .finally(() => {
        this.loadingReply.set(false);
      });
  }

  private extractTaskSuggestion(answer: any): TaskSuggestion | null {
    const suggestion = answer?.task;
    if (!suggestion) return null;

    if (typeof suggestion === "string") {
      return { title: suggestion };
    }

    if (typeof suggestion === "object") {
      const title =
        suggestion.title ||
        suggestion.name ||
        suggestion.summary ||
        suggestion.task;
      if (!title) return null;

      const priorityRaw =
        typeof suggestion.priority === "string"
          ? suggestion.priority.toLowerCase()
          : "";
      const statusRaw =
        typeof suggestion.status === "string"
          ? suggestion.status.toLowerCase()
          : "";

      const priority: TaskPriority | undefined =
        priorityRaw === "low" || priorityRaw === "normal" || priorityRaw === "high"
          ? (priorityRaw as TaskPriority)
          : undefined;
      const status: TaskStatus | undefined =
        statusRaw === "todo" || statusRaw === "in-progress" || statusRaw === "done"
          ? (statusRaw as TaskStatus)
          : undefined;

      return {
        title,
        description:
          suggestion.description ||
          suggestion.details ||
          suggestion.detail ||
          "",
        referenceId:
          suggestion.referenceId ||
          suggestion.reference ||
          suggestion.topicId ||
          suggestion.id ||
          "",
        priority,
        status,
      };
    }

    return null;
  }

  /**
   * todo this is often failing
   * @param answer 
   * @returns 
   */
  private extractMessageSuggestion(answer: any): MessageSuggestion | null {
    
    if (!answer) return null;

    if (typeof answer === "string") {
      const parsed = this.tryParseJsonFromText(answer);
      if (parsed !== null) return this.extractMessageSuggestion(parsed);
      return null;
    }

    const suggestion =
      answer?.message ??
      answer?.email ??
      answer?.mail ??
      answer?.messageSuggestion ??
      answer?.emailSuggestion ??
      answer?.suggestedMessage;

    if (!suggestion) return null;

    if (typeof suggestion === "string") {
      const recipient =
        answer?.recipient ||
        answer?.to ||
        answer?.toEmail ||
        answer?.recipientEmail ||
        answer?.email ||
        answer?.to_address ||
        answer?.toAddress ||
        "";

      if (!recipient) return null;
      const subjectRaw = answer?.subject || "";

      return {
        recipient: String(recipient),
        body: suggestion,
        subject: typeof subjectRaw === "string" ? subjectRaw : String(subjectRaw ?? ""),
      };
    }

    if (typeof suggestion === "object") {
      const recipientValue =
        suggestion.recipient ??
        suggestion.to ??
        suggestion.email ??
        suggestion.toEmail ??
        suggestion.recipientEmail ??
        suggestion.userId ??
        suggestion.user ??
        answer?.recipient ??
        answer?.to ??
        answer?.toEmail ??
        answer?.recipientEmail ??
        answer?.email ??
        "";
      const recipient =
        typeof recipientValue === "string"
          ? recipientValue
          : typeof recipientValue?.email === "string"
            ? recipientValue.email
            : typeof recipientValue?.id === "string"
              ? recipientValue.id
              : "";
      const body =
        typeof suggestion.body === "string"
          ? suggestion.body
          : typeof suggestion.message === "string"
            ? suggestion.message
            : typeof suggestion.content === "string"
              ? suggestion.content
            : typeof suggestion.text === "string"
              ? suggestion.text
              : typeof answer?.answer === "string"
                ? answer.answer
                : "";

      if (!recipient || !body) return null;

      const subjectRaw =
        suggestion.subject ||
        suggestion.title ||
        suggestion.topic ||
        suggestion.objet ||
        "";

      return {
        recipient: String(recipient),
        body,
        subject:
          typeof subjectRaw === "string" ? subjectRaw : String(subjectRaw ?? ""),
      };
    }

    return null;
  }

  private extractFirstJsonValue(text: string): string | null {
    const trimmed = text.trim();
    if (!trimmed) return null;

    const firstChar = trimmed[0];
    if (firstChar !== "{" && firstChar !== "[") return null;

    const stack: string[] = [];
    let inString = false;
    let escaped = false;

    for (let i = 0; i < trimmed.length; i++) {
      const ch = trimmed[i];

      if (inString) {
        if (escaped) {
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (ch === '"') {
          inString = false;
        }
        continue;
      }

      if (ch === '"') {
        inString = true;
        continue;
      }

      if (ch === "{" || ch === "[") {
        stack.push(ch);
        continue;
      }

      if (ch === "}" || ch === "]") {
        const last = stack.pop();
        const matches =
          (last === "{" && ch === "}") || (last === "[" && ch === "]");
        if (!matches) return null;
        if (stack.length === 0) return trimmed.slice(0, i + 1);
      }
    }

    return null;
  }

  private tryParseJsonFromText(text: string): unknown | null {
    const tryParse = (candidate: string): unknown | null => {
      try {
        return JSON.parse(candidate);
      } catch {
        return null;
      }
    };

    const trimmed = text.trim();
    if (!trimmed) return null;

    const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fencedMatch?.[1]) {
      const parsed = tryParse(fencedMatch[1].trim());
      if (parsed !== null) return parsed;
    }

    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      const parsed = tryParse(trimmed);
      if (parsed !== null) return parsed;

      const jsonValue = this.extractFirstJsonValue(trimmed);
      if (jsonValue) {
        const extracted = tryParse(jsonValue);
        if (extracted !== null) return extracted;
      }
    }

    const firstJsonStart = trimmed.search(/[\[{]/);
    if (firstJsonStart >= 0) {
      const remainder = trimmed.slice(firstJsonStart);
      const jsonValue = this.extractFirstJsonValue(remainder);
      if (jsonValue) {
        const extracted = tryParse(jsonValue);
        if (extracted !== null) return extracted;
      }
    }

    return null;
  }

  cancelTaskSuggestion() {
    this.taskSuggestion.set(null);
  }

  async createTaskFromSuggestion() {
    const suggestion = this.taskSuggestion();
    if (!suggestion) return;

    const user = this.taskService.user();
    if (!user) {
      this.error.set(this.t("ai_chat.errors.authRequiredTask"));
      return;
    }

    this.creatingTask.set(true);
    this.error.set(null);

    try {
      await this.taskService.create({
        title: suggestion.title,
        description: suggestion.description,
        referenceId: suggestion.referenceId,
        status: suggestion.status ?? "todo",
        priority: suggestion.priority ?? "normal",
        createdBy: "ai",
      });
      this.taskSuggestion.set(null);
    } catch (err) {
      console.error("Task creation failed", err);
      this.error.set(this.t("ai_chat.errors.taskCreationFailed"));
    } finally {
      this.creatingTask.set(false);
    }
  }

  cancelMessageSuggestion() {
    this.messageSuggestion.set(null);
  }

  private async resolveRecipientId(recipient: string): Promise<string | null> {
    const target = recipient?.trim();
    if (!target) return null;

    if (target.includes("@")) {
      const [profile] = await this.userService.runQuery({
        where: where("email", "==", target),
      });
      if (profile) {
        return (profile as any).id || (profile as any).userId || null;
      }
      return null;
    }

    try {
      const profile = await this.userService.getById(target);
      return (profile as any)?.id || (profile as any)?.userId || target;
    } catch {
      return target;
    }
  }

  async sendSuggestedMessage() {
    const suggestion = this.messageSuggestion();
    if (!suggestion) return;

    const user = this.auth.user();
    if (!user) {
      this.error.set(this.t("ai_chat.errors.authRequiredMessage"));
      return;
    }

    const recipientId = await this.resolveRecipientId(suggestion.recipient);
    if (!recipientId) {
      this.error.set(this.t("ai_chat.errors.recipientNotFound"));
      return;
    }

    this.sendingMessage.set(true);
    this.error.set(null);

    try {
      const conversation = await this.messageService.createNewConversation(
        user.uid,
        recipientId
      );
      await this.messageService.sendMessage(conversation.id, {
        from: user.uid,
        date: new Date(),
        read: false,
        message: suggestion.body ?? "",
        subject: suggestion.subject,
      });
      this.messageSuggestion.set(null);
    } catch (err) {
      console.error("Failed to send suggested message", err);
      this.error.set(this.t("ai_chat.errors.messageSendFailed"));
    } finally {
      this.sendingMessage.set(false);
    }
  }

  private scrollToBottom() {
    const el = this.messagesContainer?.nativeElement;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }

}

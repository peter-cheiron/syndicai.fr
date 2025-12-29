import { AuthService } from "#services/auth";
import { CommonModule } from "@angular/common";
import { Component, computed, effect, inject, signal } from "@angular/core";
import { CoproBuilding } from "../building/building-models";
import { buildingServiceFactory } from "../building/services/building-service";
import { Task } from "../tasks/services/task";
import { DbTaskService } from "../tasks/services/task-service";
import { Router } from "@angular/router";
import { DashboardItem, DashboardItemType } from "./item/dashboard-item.model";
import { DashboardItemCardComponent } from "./item/dashboard-item-card.component";
import { TranslatePipe } from "@ngx-translate/core";

@Component({
  selector: "app-dashboard",
  imports: [
    TranslatePipe,
    CommonModule, DashboardItemCardComponent],
  templateUrl: "./dashboard.component.html",
  standalone: true,
})
export class DashboardComponent {
  router = inject(Router);

  auth = inject(AuthService);
  user = computed(() => this.auth.user());

  taskService = inject(DbTaskService);
  tasks = signal<Task[]>([]);

  buildingService = buildingServiceFactory("DEMO");
  building: CoproBuilding | null =
    this.buildingService?.getBuilding("") ?? null;

  items = computed<DashboardItem[]>(() => {
    const aggregated: DashboardItem[] = [];

    if (this.building) {
      aggregated.push(
        ...this.building.announcements.map((announcement) => ({
          id: `${announcement.id}`,
          type: "bulletin" as const,
          title: announcement.title,
          detail: announcement.message,
          date: announcement.date,
          image: announcement.image
        })),
        ...this.building.history.map((issue) => ({
          id: `${issue.id}`,
          type: "issue" as const,
          title: issue.title,
          detail: issue.description,
          status: issue.status,
          date: issue.date,
          image: issue.image
        }))
      );
    }

    aggregated.push(
      ...this.tasks().map((task) => ({
        id: `${task.id}`,
        type: "task" as const,
        title: task.title,
        detail: task.description,
        status: task.status,
        date: task.createdAt,
      }))
    );

    return aggregated
      .filter((item) => item.date)
      .sort((a, b) => this.parseDate(b.date) - this.parseDate(a.date))
      .slice(0, 12);
  });

  bulletins = computed(() => this.items().filter((i) => i.type === "bulletin"));

  openIssues = computed(() =>
    this.items().filter((i) => i.type === "issue" && i.status === "open")
  );

  taskItems = computed<DashboardItem[]>(() =>
    this.tasks().map((task) => ({
      id: `${task.id}`,
      type: "task" as const,
      title: task.title,
      detail: task.description,
      status: task.status,
      date: task.createdAt,
    }))
  );

  visibleItemCount = computed(
    () =>
      this.bulletins().length + this.openIssues().length + this.taskItems().length
  );

  constructor() {
    effect(() => {
      if (this.user()) {
        this.taskService.listYours(this.user().uid).then((docs) => {
          this.tasks.set(docs);
        });
      }
    });
  }

  getItemLabel(type: DashboardItemType): string {
    if (type === "bulletin") return "dashboard.labels.bulletin";
    if (type === "issue") return "dashboard.labels.issue";
    return "dashboard.labels.task";
  }

  onTileAction(
    action: "ai" | "open",
    type: DashboardItemType,
    id: string
  ): void {
    console.info("Tile action triggered", { action, type, id });

    if (action === "ai") {
      this.router.navigateByUrl("ai-chat/" + id);
    } else {
      if (type === "task") {
        this.router.navigateByUrl("tasks/" + id);
      }
      if (type === "bulletin") {
        this.router.navigateByUrl("bulletin/" + id);
      }
      if (type === "issue") {
        this.router.navigateByUrl("tickets/" + id);
      }
    }
  }

  private parseDate(value?: string): number {
    const parsed = value ? Date.parse(value) : NaN;
    return Number.isNaN(parsed) ? 0 : parsed;
  }
}

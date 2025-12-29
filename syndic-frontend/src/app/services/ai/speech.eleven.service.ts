import { inject, Injectable } from "@angular/core";
import { getApp } from "@angular/fire/app";
import { getFunctions, httpsCallable } from "@firebase/functions";

@Injectable({
  providedIn: "root",
})
export class SpeechService { //version elevenlabs
  
  functions: any;

  constructor() {
    this.functions = getFunctions(getApp(), "europe-west1");
  }

  speechToText(url: string, callback?: (text: string) => void): Promise<string> {
    console.log("speech service", url);
    const addMessage = httpsCallable(this.functions, "speechToText");
    return addMessage({ url })
      .then((result: any) => {
        const text = result?.data?.results?.text ?? "";
        callback?.(text);
        return text;
      })
      .catch((error: any) => {
        console.error("Error calling speechToText:", error);
        throw error;
      });
  }

  textToSpeech(text, results) {
    const addMessage = httpsCallable(this.functions, "textToSpeech");
    addMessage({ text: text })
      .then((result: any) => {
        //here is hoping that its valid
        results(result)
      })
      .catch((error: any) => {
        console.error("Error calling function:", error);
      });
  }

}

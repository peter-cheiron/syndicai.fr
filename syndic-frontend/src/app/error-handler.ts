import { ErrorHandler, Injectable } from "@angular/core";

@Injectable()
export class CustomErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    const message = error?.toString?.() ?? '';

    if (!message.includes('Firebase API called outside injection context')) {
      console.error("why", error);
    }
  }

  
}

import { Routes } from "@angular/router";
import { AIChatComponent } from "./ai-chat.component";
import { AuthGuard } from "src/app/auth.guard";

export const aichatRoutes: Routes = [
      { path: 'ai-chat', component: AIChatComponent, pathMatch: 'full', canActivate: [AuthGuard]   },
      { path: 'ai-chat/:id', component: AIChatComponent, pathMatch: 'full', canActivate: [AuthGuard]   }
]
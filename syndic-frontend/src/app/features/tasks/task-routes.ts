import { Routes } from "@angular/router";
import { AuthGuard } from "src/app/auth.guard";
import { TasksComponent } from "./tasks.component";


export const taskRoutes: Routes = [
      { path: 'tasks', component: TasksComponent, pathMatch: 'full', canActivate: [AuthGuard]   },
      { path: 'tasks/:id', component: TasksComponent, pathMatch: 'full', canActivate: [AuthGuard]   }

]
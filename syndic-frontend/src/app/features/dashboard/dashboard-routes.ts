import { Routes } from "@angular/router";
import { AuthGuard } from "src/app/auth.guard";
import { DashboardComponent } from "./dashboard.component";

export const dashboardRoutes: Routes = [
      { path: 'dashboard', 
      component: DashboardComponent, 
      pathMatch: 'full', 
      canActivate: [AuthGuard]   }
]
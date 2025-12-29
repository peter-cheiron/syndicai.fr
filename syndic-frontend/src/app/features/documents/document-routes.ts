import { Routes } from "@angular/router";
import { AuthGuard } from "src/app/auth.guard";
import { DocumentsComponent } from "./documents.component";

export const documentRoutes: Routes = [
      { path: 'documents', 
      component: DocumentsComponent, 
      pathMatch: 'full', 
      canActivate: [AuthGuard]   }
]
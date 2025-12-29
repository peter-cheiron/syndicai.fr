import { Routes } from "@angular/router";
import { BulletinBoardComponent } from "./bulletin-board.component";
import { AuthGuard } from "src/app/auth.guard";

export const bulletinRoutes: Routes = [
      { path: 'bulletin', 
            component: BulletinBoardComponent, 
            pathMatch: 'full', 
            canActivate: [AuthGuard]   },
      { path: 'bulletin/:id', 
            component: BulletinBoardComponent, 
            pathMatch: 'full', 
            canActivate: [AuthGuard]   }
]
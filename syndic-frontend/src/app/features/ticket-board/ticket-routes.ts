import { Routes } from "@angular/router";
import { AuthGuard } from "src/app/auth.guard";
import { TicketBoardComponent } from "./ticket-board.component";

export const ticketRoutes: Routes = [
      { path: 'tickets', 
      component: TicketBoardComponent, 
      pathMatch: 'full', 
      canActivate: [AuthGuard]   },
      { path: 'tickets/:id', 
      component: TicketBoardComponent, 
      pathMatch: 'full', 
      canActivate: [AuthGuard]   }
]
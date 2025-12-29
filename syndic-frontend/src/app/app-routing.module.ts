import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './standard/landing-page/landing-page.component';
import { blogRoutes } from './standard/blog-feature/blog-routes';
import { userRoutes } from './standard/user/user-routes';
import { contactRoutes } from './standard/contact/contactRoutes';
import { messageRoutes } from './standard/messaging/message-routes';
import { bulletinRoutes } from './features/bulletin-board/bulletin-routes';
import { ticketRoutes } from './features/ticket-board/ticket-routes';
import { aichatRoutes } from './features/ai-chat/ai-chat-routes';
import { SyndicMapComponent } from './features/data/syndic-map/syndic-map.component';
import { FaqComponent } from './standard/faq/faq.component';
import { AccessDeniedComponent } from './standard/access-denied/access-denied.component';
import { documentRoutes } from './features/documents/document-routes';
import { dashboardRoutes } from './features/dashboard/dashboard-routes';
import { taskRoutes } from './features/tasks/task-routes';

const routes: Routes = [
  
  { path: '', component: LandingPageComponent, pathMatch: 'full' },
  { path: 'paris', component: SyndicMapComponent, pathMatch: 'full' },
  { path: 'faq', component: FaqComponent, pathMatch: 'full' },
  { path: 'access-denied', component: AccessDeniedComponent, pathMatch: 'full' },

  //I guess these are all really part of one giant feature ...
  ...aichatRoutes,
  ...bulletinRoutes,
  ...ticketRoutes,
  ...documentRoutes,
  ...dashboardRoutes,
  ...taskRoutes,

  ...messageRoutes,


  ...userRoutes,
  ...contactRoutes,
  ...blogRoutes,
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      enableViewTransitions: true,
      scrollPositionRestoration: 'enabled'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}

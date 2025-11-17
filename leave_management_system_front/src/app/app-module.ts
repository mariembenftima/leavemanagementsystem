import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { login } from './auth/components/login/login';
import { RegisterComponent } from './public/register/register';
import { LandingPage } from './public/components/landing-page/landing-page';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { UserDashboard } from './private/components/users/dashboard/user-dashboard';
import { UserProfile } from './private/components/users/profile/user-profile';
import { UserSideBar } from './layout/user/user-side-bar/user-side-bar';
import { UserNavBar } from './layout/user/user-nav-bar/user-nav-bar';
import { RouterModule } from '@angular/router';
import { UserCalender } from './private/components/users/calender/user-calender';
import { LeaveRequestComponent } from './private/components/users/leave-requests/user-leave-requests';
import { UserApproves } from './private/components/users/approves/user-approves';
import { AdminDashboard } from './private/components/admin/dashboard/admin-dashboard';
import { AdminSideBar } from './layout/admin/admin-side-bar/admin-side-bar';
import { AdminNavBar } from './layout/admin/admin-nav-bar/admin-nav-bar';
import { LeaveAnalytics } from './private/components/analytics/leave-analytics/leave-analytics';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container';
import { ApiService } from './private/services/api.service';
import { AuthService } from './private/services/auth.service';
import { BaseChartDirective } from 'ng2-charts';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { UsersComponent } from './private/components/admin/users/users.component';
import { CreateProfileModalComponent } from './private/components/admin/users/users/modals/create-profile-modal/create-profile-modal.component';
import { DeleteConfirmModalComponent } from './private/components/admin/users/users/modals/delete-confirm-modal/delete-confirm-modal.component';
import { RoleModalComponent } from './private/components/admin/users/users/modals/role-modal/role-modal.component';
import { CommonModule } from '@angular/common';
import { ADMIN_ROUTES } from './private/components/admin/admin.route';


@NgModule({
  declarations: [
    App,
    login,
    LandingPage,
    UserProfile,
    UserSideBar,
    UserNavBar,
    UserCalender,
    LeaveRequestComponent,
    UserApproves,
    AdminDashboard,
    AdminSideBar,
    AdminNavBar,
    LeaveAnalytics,
    ToastContainerComponent,
    UserDashboard,
    RoleModalComponent,
    DeleteConfirmModalComponent,
    CreateProfileModalComponent,
    UsersComponent
  ],
  imports: [
    RouterModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    BaseChartDirective,
    RegisterComponent,
    FormsModule,
    CommonModule,
    RouterModule.forRoot(ADMIN_ROUTES)
    
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    ApiService,
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [App],
})
export class AppModule { }

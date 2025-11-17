import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { login } from './auth/components/login/login';
import { RegisterComponent } from './public/register/register';

import { LandingPage } from './public/components/landing-page/landing-page';
import { UserDashboard } from './private/components/users/dashboard/user-dashboard';

import { UserProfile } from './private/components/users/profile/user-profile';
import { UserCalender } from './private/components/users/calender/user-calender';
import { LeaveRequestComponent } from './private/components/users/leave-requests/user-leave-requests';
import { UserApproves } from './private/components/users/approves/user-approves';
// Analytics Components
import { LeaveAnalytics } from './private/components/analytics/leave-analytics/leave-analytics';
// Guards
import { AuthGuard, RoleGuard } from './guards/auth.guard';
import { UsersComponent } from './private/components/admin/users/users.component';
import { AdminDashboard } from './private/components/admin/dashboard/admin-dashboard';

const routes: Routes = [
  { path: 'login', component: login },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: UserProfile, canActivate: [AuthGuard] },
  { path: 'dashboard', component: UserDashboard, canActivate: [AuthGuard] },
  { path: 'calendar', component: UserCalender, canActivate: [AuthGuard] },
  { path: 'leaverequests', component: LeaveRequestComponent, canActivate: [AuthGuard] },
  { path: 'analytics', component: LeaveAnalytics, canActivate: [AuthGuard] },
  { path: 'approves', component: UserApproves, canActivate: [RoleGuard], data: { roles: ['ADMIN', 'HR_MANAGER'] } },
  
  { 
    path: 'admin', 
    canActivate: [RoleGuard], 
    data: { roles: ['ADMIN', 'HR'] },
    children: [
      {
          path: '',
          redirectTo: 'dashboard',
          pathMatch: 'full'
        },
        {
          path: 'dashboard',
          component:AdminDashboard
        },
        {
          path: 'users',
          children: [
            {
              path: '',
              redirectTo: 'users',
              pathMatch: 'full'
            },
            {
              path: 'users',
              component: UsersComponent
            }
          ]
        },
    ]
  },
  
  { path: 'settings', redirectTo: '/profile', pathMatch: 'full' },
  { path: 'help', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '', component: LandingPage },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
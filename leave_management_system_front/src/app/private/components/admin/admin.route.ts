import { Routes } from '@angular/router';
import { UsersComponent } from './users/users.component';
import { AdminDashboard } from './dashboard/admin-dashboard';

export const ADMIN_ROUTES: Routes = [
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
  {
    path: '**',
    redirectTo: 'dashboard'
  }
]
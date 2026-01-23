import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../private/services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { EmployeeProfile } from '../../../types/employee-profile.model';

interface NavItem {
  label: string;
  route: string;
  active?: boolean;
}

interface UserInfo {
  name: string;
  email: string;
  avatar: string;
  role: string;
}

interface HRContact {
  name: string;
  title: string;
  email: string;
  department: string;
}

@Component({
  selector: 'app-user-nav-bar',
  standalone: false,
  templateUrl: './user-nav-bar.html',
  styleUrls: ['./user-nav-bar.css'],
})
export class UserNavBar implements OnInit, OnDestroy {
  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Profile', route: '/profile' },
    { label: 'Calendar', route: '/calendar' },
    { label: 'Leave Requests', route: '/leaverequests' },
    { label: 'Approvals', route: '/approves' },
  ];

  currentUser: UserInfo = {
    name: 'Loading...',
    email: 'loading...',
    avatar: 'L',
    role: 'employee',
  };

  hrContacts: HRContact[] = [
    {
      name: 'Sarah Johnson',
      title: 'HR Manager',
      email: 'sarah.johnson@company.com',
      department: 'Human Resources'
    },
    {
      name: 'Michael Chen',
      title: 'Department Manager',
      email: 'michael.chen@company.com',
      department: 'Operations'
    },
    {
      name: 'Lisa Williams',
      title: 'HR Specialist',
      email: 'lisa.williams@company.com',
      department: 'Human Resources'
    }
  ];

  showNotificationDropdown = false;
  showUserDropdown = false;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.updateUserInfo(user);
        }
      });

    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.updateUserInfo(currentUser);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get userName(): string {
    return this.currentUser.name;
  }

  get userEmail(): string {
    return this.currentUser.email;
  }

  get userAvatar(): string {
    return this.currentUser.avatar || this.getInitials(this.currentUser.name);
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase();
  }

  navigateTo(route: string): void {
    this.navItems.forEach((item) => (item.active = item.route === route));
    this.router.navigate([route]);
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.showUserDropdown = !this.showUserDropdown;
    this.showNotificationDropdown = false;
  }

  showNotifications(): void {
    this.showNotificationDropdown = !this.showNotificationDropdown;
  }

  closeDropdowns(): void {
    this.showNotificationDropdown = false;
    this.showUserDropdown = false;
  }

  sendEmailToContact(email: string, name: string): void {
    const subject = 'Leave Request Inquiry';
    const body = `Dear ${name},%0D%0A%0D%0AI would like to discuss my leave request.%0D%0A%0D%0AThank you,%0D%0A${this.currentUser.name}`;
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
  }

  showSettings(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    this.closeDropdowns();
    this.router.navigate(['/login']);
  }

  updateUserInfo(userInfo: EmployeeProfile): void {
    if (userInfo) {
      this.currentUser = {
        name: userInfo.firstName && userInfo.lastName
          ? `${userInfo.firstName} ${userInfo.lastName}`
          : userInfo.fullname || 'User',
        email: userInfo.email || 'No email',
        avatar: this.generateAvatar(userInfo),
        role: Array.isArray(userInfo.roles) && userInfo.roles.length > 0
          ? userInfo.roles[0]
          : 'employee',
      };
    }
  }

  private generateAvatar(user: EmployeeProfile): string {
    if (user.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    } else if (user.fullname) {
      return user.fullname.charAt(0).toUpperCase();
    } else if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeDropdowns();
    }
  }
}
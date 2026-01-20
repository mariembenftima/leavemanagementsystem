import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../private/services/auth.service';
import { Subject, takeUntil } from 'rxjs';  

interface NavItem {
  label: string;
  route: string;
  active?: boolean;
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

  currentUser = {
    name: 'Loading...',
    email: 'loading...',
    avatar: 'L',
    role: 'employee',
  };

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

  private destroy$ = new Subject<void>();  


  showNotificationDropdown = false;
  showUserDropdown = false;

  hrContacts = [
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

  private showUserOptions(): void {

    const options = [
      'View Profile',
      'Account Settings',
      'Change Password',
      'Logout',
    ];


    console.log('User menu options:', options);
  }

  showNotifications(): void {
    console.log('Notifications clicked');
    this.showNotificationDropdown = !this.showNotificationDropdown;
  }

  closeDropdowns(): void {
    this.showNotificationDropdown = false;
    this.showUserDropdown = false;
  }

  sendEmailToContact(email: string, name: string): void {
    console.log(`Opening email to: ${name} (${email})`);

    window.open(`mailto:${email}?subject=Leave Request Inquiry&body=Dear ${name},%0D%0A%0D%0AI would like to discuss my leave request.%0D%0A%0D%0AThank you,%0D%0A${this.currentUser.name}`, '_blank');
  }

  showSettings(): void {
    console.log('Settings clicked');

    this.router.navigate(['/profile']);
  }

  logout(): void {

    console.log('Logging out...');

    localStorage.removeItem('authToken');
    sessionStorage.clear();


    this.closeDropdowns();


    this.router.navigate(['/login']);
  }


  updateUserInfo(userInfo: any): void {
    if (userInfo) {
      this.currentUser = {
        name: userInfo.firstName && userInfo.lastName 
          ? `${userInfo.firstName} ${userInfo.lastName}` 
          : userInfo.fullname || userInfo.name || 'User',
        email: userInfo.email || 'No email',
        avatar: this.generateAvatar(userInfo),
        role: userInfo.roles?.[0] || userInfo.role || 'employee',
      };
    }
  }

  private generateAvatar(user: any): string {
    if (user.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    } else if (user.fullname) {
      return user.fullname.charAt(0).toUpperCase();
    } else if (user.name) {
      return user.name.charAt(0).toUpperCase();
    } else if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  }


  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      // Close any open dropdowns
      console.log('Escape pressed - closing dropdowns');
    }
  }
}
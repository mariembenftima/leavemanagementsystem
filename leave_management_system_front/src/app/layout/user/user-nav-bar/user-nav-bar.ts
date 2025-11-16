import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../private/services/auth.service';
import { Subscription } from 'rxjs';

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

  private userSubscription?: Subscription;

  // Dropdown states
  showNotificationDropdown = false;
  showUserDropdown = false;
  
  // HR and Manager contact information
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
    // Subscribe to current user changes
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.updateUserInfo(user);
      }
    });

    // Load current user if available
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.updateUserInfo(currentUser);
    }
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  // Method to navigate to a specific route
  navigateTo(route: string): void {
    // Update active state
    this.navItems.forEach((item) => (item.active = item.route === route));
    this.router.navigate([route]);
  }

  // Method to check if a route is active
  isActive(route: string): boolean {
    return this.router.url === route;
  }

  // User menu methods
  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.showUserDropdown = !this.showUserDropdown;
    // Close other dropdowns
    this.showNotificationDropdown = false;
  }

  private showUserOptions(): void {
    // Example of user menu options
    const options = [
      'View Profile',
      'Account Settings',
      'Change Password',
      'Logout',
    ];

    // You can implement a proper dropdown component here
    console.log('User menu options:', options);
  }

  // Action button methods
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
    // Open the user's default email client
    window.open(`mailto:${email}?subject=Leave Request Inquiry&body=Dear ${name},%0D%0A%0D%0AI would like to discuss my leave request.%0D%0A%0D%0AThank you,%0D%0A${this.currentUser.name}`, '_blank');
  }

  showSettings(): void {
    console.log('Settings clicked');
    // Show settings dropdown instead of navigating
    // You can implement settings panel/dropdown here
    // For now, let's just navigate to profile instead of non-existent settings
    this.router.navigate(['/profile']);
  }

  // Method to logout user
  logout(): void {
    // Implement logout logic here
    console.log('Logging out...');
    // Clear any stored authentication tokens
    localStorage.removeItem('authToken');
    sessionStorage.clear();

    // Close any dropdowns
    this.closeDropdowns();

    // Redirect to login page
    this.router.navigate(['/login']);
  }

  // Method to update user info
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

  // ...existing code...

  // Method to handle keyboard navigation
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      // Close any open dropdowns
      console.log('Escape pressed - closing dropdowns');
    }
  }
}

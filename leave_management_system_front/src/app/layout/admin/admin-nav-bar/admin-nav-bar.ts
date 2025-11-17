import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface NavItem {
  label: string;
  route: string;
  active?: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: Date;
  read: boolean;
}

interface SettingsItem {
  label: string;
  icon: string;
  action: string;
}

@Component({
  selector: 'app-admin-nav-bar',
  standalone: false,  // ✅ Changed to false
  templateUrl: './admin-nav-bar.html',
  styleUrls: ['./admin-nav-bar.css'],
})
export class AdminNavBar {
  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard' },
    { label: 'User Management', route: '/admin/users' },
    { label: 'Leave Management', route: '/admin/leaves' },
    { label: 'Reports', route: '/admin/reports' },
    { label: 'System Settings', route: '/admin/settings' },
  ];

  currentUser = {
    name: 'Admin',
    email: 'admin@company.com',
    avatar: 'A',
    role: 'System Administrator',
  };

  notifications: Notification[] = [
    {
      id: '1',
      title: 'New Leave Request',
      message: 'John Doe submitted a vacation request for next week',
      type: 'info',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      read: false
    },
    {
      id: '2',
      title: 'System Update',
      message: 'Leave management system updated successfully',
      type: 'success',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false
    },
    {
      id: '3',
      title: 'Approval Required',
      message: '5 leave requests pending your approval',
      type: 'warning',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: true
    }
  ];

  settingsItems: SettingsItem[] = [
    { label: 'Account Settings', icon: '⚙️', action: 'account' },
    { label: 'System Preferences', icon: '🛠️', action: 'preferences' },
    { label: 'User Management', icon: '👥', action: 'users' },
    { label: 'Security Settings', icon: '🔒', action: 'security' },
    { label: 'Backup & Export', icon: '💾', action: 'backup' },
    { label: 'Help & Support', icon: '❓', action: 'help' }
  ];

  showNotificationDropdown = false;
  showSettingsDropdown = false;
  showUserDropdown = false;

  constructor(private router: Router) { }

  navigateTo(route: string): void {
    this.navItems.forEach(item => item.active = false);
    const navItem = this.navItems.find(item => item.route === route);
    if (navItem) navItem.active = true;
    this.router.navigate([route]);
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  toggleNotifications(): void {
    this.showNotificationDropdown = !this.showNotificationDropdown;
    this.showSettingsDropdown = false;
    this.showUserDropdown = false;
  }

  markNotificationAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  markAllNotificationsAsRead(): void {
    this.notifications.forEach(n => n.read = true);
  }

  deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
  }

  getUnreadNotificationsCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  toggleSettings(): void {
    this.showSettingsDropdown = !this.showSettingsDropdown;
    this.showNotificationDropdown = false;
    this.showUserDropdown = false;
  }

  handleSettingsAction(action: string): void {
    this.showSettingsDropdown = false;

    switch (action) {
      case 'account':
        this.router.navigate(['/admin/account']);
        break;
      case 'preferences':
        this.router.navigate(['/admin/preferences']);
        break;
      case 'users':
        this.router.navigate(['/admin/users']);
        break;
      case 'security':
        this.router.navigate(['/admin/security']);
        break;
      case 'backup':
        this.router.navigate(['/admin/backup']);
        break;
      case 'help':
        this.showHelp();
        break;
      default:
        console.log('Settings action:', action);
    }
  }

  toggleUserMenu(): void {
    this.showUserDropdown = !this.showUserDropdown;
    this.showNotificationDropdown = false;
    this.showSettingsDropdown = false;
  }

  showHelp(): void {
    window.open('/help', '_blank');
  }

  logout(): void {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '📋';
    }
  }

  closeDropdowns(): void {
    this.showNotificationDropdown = false;
    this.showSettingsDropdown = false;
    this.showUserDropdown = false;
  }
}
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  active?: boolean;
}

@Component({
  selector: 'app-admin-side-bar',
  standalone: false,  
  templateUrl: './admin-side-bar.html',
  styleUrls: ['./admin-side-bar.css'],
})
export class AdminSideBar implements OnInit {
  menuItems: MenuItem[] = [
    { icon: '📊', label: 'Dashboard', route: '/admin/dashboard' },
    { icon: '👥', label: 'Users', route: '/admin/users' },
    { icon: '📝', label: 'Leave Requests', route: '/admin/leaves' },
    { icon: '🗓️', label: 'Holidays', route: '/admin/holidays' },
    { icon: '📋', label: 'Leave Types', route: '/admin/leave-types' },
    { icon: '📊', label: 'Reports', route: '/admin/reports' },
    { icon: '⚙️', label: 'Settings', route: '/admin/settings' },
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.updateActiveState();
    this.router.events.subscribe(() => {
      this.updateActiveState();
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  private updateActiveState(): void {
    const currentUrl = this.router.url;
    this.menuItems.forEach(item => {
      item.active = currentUrl.startsWith(item.route);
    });
  }
}
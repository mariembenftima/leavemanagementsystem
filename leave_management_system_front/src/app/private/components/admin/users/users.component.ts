import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from './services/users.service';
import { User } from '../../../../types/user.model';

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Component({
  selector: 'app-users',
  standalone: false,
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  Math = Math; // ✅ Expose Math to template

  loading = false;
  selectedUser: User | null = null;

  pagination: PaginationData = {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  };

  searchQuery = '';
  roleFilter = '';
  profileFilter = '';
  showFilters = false;

  showRoleModal = false;
  showDeleteModal = false;
  showCreateProfileModal = false;

  availableRoles = ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'];

  constructor(
    private usersService: UsersService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.loading = true;
    const params = {
      page: this.pagination.page,
      limit: this.pagination.limit,
      search: this.searchQuery || undefined,
      role: this.roleFilter || undefined,
      hasProfile: this.profileFilter || undefined
    };

    this.usersService.getAllUsers(params).subscribe({
      next: (response) => {
        console.log('✅ Received response:', response);

        if (Array.isArray(response.data)) {
          this.users = response.data;
        } else {
          console.error('Expected array but got:', typeof response.data);
          this.users = [];
        }

        // ✅ Ensure pagination exists before assigning
        if (response.pagination) {
          this.pagination = response.pagination;
        } else {
          // ✅ Fallback pagination if not provided
          this.pagination = {
            total: this.users.length,
            page: 1,
            limit: 10,
            totalPages: Math.ceil(this.users.length / 10)
          };
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error fetching users:', error);
        alert('Failed to fetch users. Please check your connection.');
        this.users = [];
        
        // ✅ Reset pagination on error
        this.pagination = {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        };
        
        this.loading = false;
      }
    });
  }

  // ✅ Statistics Helper Methods
  getActiveUsersCount(): number {
    return this.users.filter(user => user.isActive).length;
  }

  getInactiveUsersCount(): number {
    return this.users.filter(user => !user.isActive).length;
  }

  getUsersWithProfileCount(): number {
    return this.users.filter(user => user.hasProfile).length;
  }

  // Search and Filter Methods
  onSearch(): void {
    this.pagination.page = 1;
    this.fetchUsers();
  }

  onFilterChange(): void {
    this.pagination.page = 1;
    this.fetchUsers();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.roleFilter = '';
    this.profileFilter = '';
    this.pagination.page = 1;
    this.fetchUsers();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  // User Actions
  activateUser(userId: string, activate: boolean): void {
    const action = activate ? 'activate' : 'deactivate';
    
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    this.usersService.updateUserStatus(userId, activate).subscribe({
      next: () => {
        alert(`User ${activate ? 'activated' : 'deactivated'} successfully`);
        this.fetchUsers();
      },
      error: (error) => {
        console.error('Error updating user status:', error);
        alert('Failed to update user status');
      }
    });
  }

  deleteUser(): void {
    if (!this.selectedUser) return;

    this.usersService.deleteUser(this.selectedUser.id).subscribe({
      next: () => {
        alert('User deleted successfully');
        this.closeDeleteModal();
        this.fetchUsers();
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    });
  }

  // Modal Management
  openRoleModal(user: User): void {
    this.selectedUser = user;
    this.showRoleModal = true;
  }

  closeRoleModal(): void {
    this.showRoleModal = false;
    this.selectedUser = null;
  }

  openDeleteModal(user: User): void {
    this.selectedUser = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedUser = null;
  }

  openCreateProfileModal(user: User): void {
    this.selectedUser = user;
    this.showCreateProfileModal = true;
  }

  closeCreateProfileModal(): void {
    this.showCreateProfileModal = false;
    this.selectedUser = null;
  }

  onProfileCreated(): void {
    this.fetchUsers();
    this.closeCreateProfileModal();
  }

  // Pagination Methods
  goToPage(page: number): void {
    this.pagination.page = page;
    this.fetchUsers();
  }

  nextPage(): void {
    if (this.pagination.page < this.pagination.totalPages) {
      this.pagination.page++;
      this.fetchUsers();
    }
  }

  previousPage(): void {
    if (this.pagination.page > 1) {
      this.pagination.page--;
      this.fetchUsers();
    }
  }

  getPaginationArray(): number[] {
    const maxPages = 5;
    const currentPage = this.pagination?.page || 1;
    const totalPages = this.pagination?.totalPages || 1;
    
    if (totalPages <= maxPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    return Array.from(
      { length: endPage - startPage + 1 }, 
      (_, i) => startPage + i
    );
  }

  // UI Helper Methods
  getRoleBadgeClass(role: string): string {
    const classes: { [key: string]: string } = {
      'ADMIN': 'badge-danger',
      'HR': 'badge-purple',
      'MANAGER': 'badge-primary',
      'EMPLOYEE': 'badge-success'
    };
    return classes[role] || 'badge-secondary';
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  // Navigation (if needed)
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
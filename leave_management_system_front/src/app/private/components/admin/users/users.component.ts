import { Component, OnInit } from '@angular/core';
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

  loading = false;
  electedUser: User | null = null;

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

  selectedUser: User | null = null;
  showRoleModal = false;
  showDeleteModal = false;
  showCreateProfileModal = false;

  availableRoles = ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'];

  constructor(private usersService: UsersService) { }

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
        console.log('Received response:', response);  // ✅ Debug log

        if (Array.isArray(response.data)) {
          this.users = response.data;
        } else {
          console.error('Expected array but got:', typeof response.data);
          this.users = [];
        }

        this.pagination = response.pagination;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching users:', error);
        alert('Failed to fetch users');
        this.users = [];  // ✅ Set to empty array on error
        this.loading = false;
      }
    });
  }

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

  activateUser(userId: string, activate: boolean): void {
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
    return name.charAt(0).toUpperCase();
  }

  getPaginationArray(): number[] {
    return Array.from({ length: this.pagination.totalPages }, (_, i) => i + 1);
  }
}
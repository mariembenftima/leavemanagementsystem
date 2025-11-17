import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User } from '../../../../../../../types/user.model';
import { UsersService } from '../../../services/users.service';


@Component({
  selector: 'app-role-modal',
  standalone: false,
  templateUrl: './role-modal.component.html',
  styleUrls: ['./role-modal.component.css']
})
export class RoleModalComponent {
  @Input() user!: User;
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  selectedRoles: string[] = [];
  loading = false;

  availableRoles = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'HR', label: 'HR' },
    { value: 'MANAGER', label: 'Manager' },
    { value: 'EMPLOYEE', label: 'Employee' }
  ];

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.selectedRoles = [...this.user.roles];
  }

  toggleRole(role: string): void {
    const index = this.selectedRoles.indexOf(role);
    if (index > -1) {
      this.selectedRoles.splice(index, 1);
    } else {
      this.selectedRoles.push(role);
    }
  }

  isRoleSelected(role: string): boolean {
    return this.selectedRoles.includes(role);
  }

  onClose(): void {
    this.close.emit();
  }

  onSave(): void {
    if (this.selectedRoles.length === 0) {
      alert('User must have at least one role');
      return;
    }

    this.loading = true;

    this.usersService.updateUserRoles(this.user.id, this.selectedRoles).subscribe({
      next: () => {
        alert('Roles updated successfully');
        this.success.emit();
      },
      error: (error) => {
        console.error('Error updating roles:', error);
        alert('Failed to update roles');
        this.loading = false;
      }
    });
  }
}

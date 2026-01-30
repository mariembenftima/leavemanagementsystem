import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { AdminLeaveRequestsService, LeaveRequestFilter } from './admin-leave-requests.service';

import { Router } from '@angular/router';
import { LeaveRequest } from '../../../../types/leave-request.model';

interface StatusFilter {
    label: string;
    value: string;
    count: number;
    color: string;
}

@Component({
    selector: 'app-admin-leave-requests',
    standalone: false,
    templateUrl: './admin-leave-requests.component.html',
    styleUrls: ['./admin-leave-requests.component.css'],
})
export class AdminLeaveRequestsComponent implements OnInit, OnDestroy {
    leaveRequests: LeaveRequest[] = [];
    loading = false;

    pagination = {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    };


    statistics = {
        totalRequests: 0,
        monthlyRequests: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
        cancelledCount: 0,
    };

    statusFilters: StatusFilter[] = [
        { label: 'All Requests', value: '', count: 0, color: '#6c757d' },
        { label: 'Pending', value: 'PENDING', count: 0, color: '#ffc107' },
        { label: 'Approved', value: 'APPROVED', count: 0, color: '#28a745' },
        { label: 'Rejected', value: 'REJECTED', count: 0, color: '#dc3545' },
        { label: 'Cancelled', value: 'CANCELLED', count: 0, color: '#6c757d' },
    ];

    activeStatusFilter = '';
    searchQuery = '';
    startDateFilter = '';
    endDateFilter = '';
    sortBy = 'createdAt';
    sortOrder: 'ASC' | 'DESC' = 'DESC';

    selectedRequest: LeaveRequest | null = null;
    showApproveModal = false;
    showRejectModal = false;
    showDetailsModal = false;

    approvalComments = '';
    rejectionReason = '';

    private destroy$ = new Subject<void>();
    Math = Math; 

    constructor(
        private adminLeaveRequestsService: AdminLeaveRequestsService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadData(): void {
        this.loading = true;

        forkJoin({
            requests: this.adminLeaveRequestsService.getAllLeaveRequests(this.buildFilter()),
            statistics: this.adminLeaveRequestsService.getLeaveRequestStatistics(),
        })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: ({ requests, statistics }) => {
                    this.leaveRequests = requests.data;
                    this.pagination = requests.pagination;

                    this.statistics = {
                        totalRequests: statistics.totalRequests,
                        monthlyRequests: statistics.monthlyRequests,
                        pendingCount: statistics.statusBreakdown?.PENDING || 0,
                        approvedCount: statistics.statusBreakdown?.APPROVED || 0,
                        rejectedCount: statistics.statusBreakdown?.REJECTED || 0,
                        cancelledCount: statistics.statusBreakdown?.CANCELLED || 0,
                    };

                    this.updateFilterCounts();
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Error loading data:', error);
                    this.loading = false;
                },
            });
    }

    private buildFilter(): LeaveRequestFilter {
        const filter: LeaveRequestFilter = {
            page: this.pagination.page,
            limit: this.pagination.limit,
            sortBy: this.sortBy,
            sortOrder: this.sortOrder,
        };

        if (this.activeStatusFilter) {
            filter.status = this.activeStatusFilter;
        }

        if (this.startDateFilter) {
            filter.startDate = this.startDateFilter;
        }

        if (this.endDateFilter) {
            filter.endDate = this.endDateFilter;
        }

        return filter;
    }

    private updateFilterCounts(): void {
        this.statusFilters[0].count = this.statistics.totalRequests;
        this.statusFilters[1].count = this.statistics.pendingCount;
        this.statusFilters[2].count = this.statistics.approvedCount;
        this.statusFilters[3].count = this.statistics.rejectedCount;
        this.statusFilters[4].count = this.statistics.cancelledCount;
    }

    onStatusFilterChange(status: string): void {
        this.activeStatusFilter = status;
        this.pagination.page = 1;
        this.loadData();
    }

    onPageChange(page: number): void {
        this.pagination.page = page;
        this.loadData();
    }

    onSearch(): void {
        this.pagination.page = 1;
        this.loadData();
    }

    onDateFilterChange(): void {
        this.pagination.page = 1;
        this.loadData();
    }

    clearFilters(): void {
        this.activeStatusFilter = '';
        this.searchQuery = '';
        this.startDateFilter = '';
        this.endDateFilter = '';
        this.pagination.page = 1;
        this.loadData();
    }

    openApproveModal(request: LeaveRequest): void {
        this.selectedRequest = request;
        this.approvalComments = '';
        this.showApproveModal = true;
    }

    openRejectModal(request: LeaveRequest): void {
        this.selectedRequest = request;
        this.rejectionReason = '';
        this.showRejectModal = true;
    }

    openDetailsModal(request: LeaveRequest): void {
        this.selectedRequest = request;
        this.showDetailsModal = true;
    }

    closeModals(): void {
        this.showApproveModal = false;
        this.showRejectModal = false;
        this.showDetailsModal = false;
        this.selectedRequest = null;
        this.approvalComments = '';
        this.rejectionReason = '';
    }

    confirmApprove(): void {
        if (!this.selectedRequest) return;

        this.loading = true;
        this.adminLeaveRequestsService
            .approveLeaveRequest(this.selectedRequest.id, this.approvalComments)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.closeModals();
                    this.loadData();
                    this.showSuccessMessage('Leave request approved successfully');
                },
                error: (error) => {
                    console.error('Error approving request:', error);
                    this.loading = false;
                    this.showErrorMessage('Failed to approve leave request');
                },
            });
    }

    confirmReject(): void {
        if (!this.selectedRequest || !this.rejectionReason.trim()) {
            this.showErrorMessage('Please provide a rejection reason');
            return;
        }

        if (this.rejectionReason.trim().length < 10) {
            this.showErrorMessage('Rejection reason must be at least 10 characters');
            return;
        }

        this.loading = true;
        this.adminLeaveRequestsService
            .rejectLeaveRequest(this.selectedRequest.id, this.rejectionReason)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.closeModals();
                    this.loadData();
                    this.showSuccessMessage('Leave request rejected successfully');
                },
                error: (error) => {
                    console.error('Error rejecting request:', error);
                    this.loading = false;
                    this.showErrorMessage('Failed to reject leave request');
                },
            });
    }

    cancelRequest(request: LeaveRequest): void {
        if (!confirm('Are you sure you want to cancel this leave request?')) {
            return;
        }

        this.loading = true;
        this.adminLeaveRequestsService
            .cancelLeaveRequest(request.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.loadData();
                    this.showSuccessMessage('Leave request cancelled successfully');
                },
                error: (error) => {
                    console.error('Error cancelling request:', error);
                    this.loading = false;
                    this.showErrorMessage('Failed to cancel leave request');
                },
            });
    }

    getStatusClass(status: string): string {
        switch (status?.toUpperCase()) {
            case 'PENDING':
                return 'status-pending';
            case 'APPROVED':
                return 'status-approved';
            case 'REJECTED':
                return 'status-rejected';
            case 'CANCELLED':
                return 'status-cancelled';
            default:
                return '';
        }
    }

    getStatusIcon(status: string): string {
        switch (status?.toUpperCase()) {
            case 'PENDING':
                return '⏳';
            case 'APPROVED':
                return '✅';
            case 'REJECTED':
                return '❌';
            case 'CANCELLED':
                return '🚫';
            default:
                return '📋';
        }
    }

    formatDate(date: string | Date): string {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }

    getPaginationPages(): number[] {
        const pages: number[] = [];
        const totalPages = this.pagination.totalPages;
        const currentPage = this.pagination.page;

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 4) {
                for (let i = 1; i <= 5; i++) {
                    pages.push(i);
                }
                pages.push(-1);
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1);
                pages.push(-1);
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push(-1);
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push(-1);
                pages.push(totalPages);
            }
        }

        return pages;
    }

    private showSuccessMessage(message: string): void {
        // Implement toast notification or use your existing notification system
        alert(message);
    }

    private showErrorMessage(message: string): void {
        // Implement toast notification or use your existing notification system
        alert(message);
    }
}
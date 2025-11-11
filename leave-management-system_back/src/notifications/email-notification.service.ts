import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import {
  LeaveRequest,
  LeaveRequestStatus,
} from '../leave-requests/entities/leave-request.entity';
import { User } from '../users/entities/users.entity';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

@Injectable()
export class EmailNotificationService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendLeaveRequestNotification(
    leaveRequest: LeaveRequest,
    recipient: User,
    type: 'submitted' | LeaveRequestStatus,
  ): Promise<void> {
    const template = this.getEmailTemplate(leaveRequest, recipient, type);

    try {
      await this.transporter.sendMail({
        from: `"Leave Management System" <${this.configService.get('SMTP_USER')}>`,
        to: recipient.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      console.log(
        `Email notification sent to ${recipient.email} for leave request ${leaveRequest.id}`,
      );
    } catch (error) {
      console.error('Failed to send email notification:', error);
      throw error;
    }
  }

  async sendBulkNotifications(
    leaveRequests: LeaveRequest[],
    recipients: User[],
    type: 'submitted' | LeaveRequestStatus,
  ): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const leaveRequest of leaveRequests) {
      for (const recipient of recipients) {
        promises.push(
          this.sendLeaveRequestNotification(leaveRequest, recipient, type),
        );
      }
    }

    await Promise.all(promises);
  }

  private getEmailTemplate(
    leaveRequest: LeaveRequest,
    recipient: User,
    type: 'submitted' | LeaveRequestStatus,
  ): EmailTemplate {
    const employee = leaveRequest.user;
    const startDate = new Date(leaveRequest.startDate).toLocaleDateString();
    const endDate = new Date(leaveRequest.endDate).toLocaleDateString();
    const leaveType = leaveRequest.leaveType?.name || 'Leave';

    let subject: string;
    let statusColor: string;
    let statusText: string;
    let actionText: string;

    switch (type) {
      case 'submitted':
        subject = `New Leave Request - ${employee.fullname}`;
        statusColor = '#3b82f6';
        statusText = 'New Leave Request Submitted';
        actionText = 'Please review and approve this leave request.';
        break;
      case LeaveRequestStatus.APPROVED:
        subject = `Leave Request Approved - ${employee.fullname}`;
        statusColor = '#10b981';
        statusText = 'Leave Request Approved';
        actionText = 'Your leave request has been approved.';
        break;
      case LeaveRequestStatus.REJECTED:
        subject = `Leave Request Rejected - ${employee.fullname}`;
        statusColor = '#ef4444';
        statusText = 'Leave Request Rejected';
        actionText = 'Your leave request has been rejected.';
        break;
      case LeaveRequestStatus.CANCELLED:
        subject = `Leave Request Cancelled - ${employee.fullname}`;
        statusColor = '#f59e0b';
        statusText = 'Leave Request Cancelled';
        actionText = 'Your leave request has been cancelled.';
        break;
      default:
        subject = `Leave Request Update - ${employee.fullname}`;
        statusColor = '#6b7280';
        statusText = 'Leave Request Update';
        actionText = 'Your leave request status has been updated.';
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
          }
          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            background: ${statusColor};
            color: white;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-top: 10px;
          }
          .content {
            padding: 30px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
          }
          .info-item {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid ${statusColor};
          }
          .info-label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 5px;
          }
          .info-value {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
          }
          .reason-section {
            background: #f1f5f9;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .reason-label {
            font-size: 14px;
            color: #64748b;
            font-weight: 600;
            margin-bottom: 10px;
          }
          .reason-text {
            font-size: 15px;
            color: #1e293b;
            line-height: 1.5;
          }
          .footer {
            background: #f8fafc;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          .footer p {
            margin: 0;
            font-size: 14px;
            color: #64748b;
          }
          .action-button {
            display: inline-block;
            padding: 12px 24px;
            background: ${statusColor};
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
          }
          @media (max-width: 600px) {
            .info-grid {
              grid-template-columns: 1fr;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Leave Management System</h1>
            <div class="status-badge">${statusText}</div>
          </div>
          
          <div class="content">
            <p>Hello ${recipient.fullname},</p>
            
            <p>${actionText}</p>
            
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Employee</div>
                <div class="info-value">${employee.fullname}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Leave Type</div>
                <div class="info-value">${leaveType}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Start Date</div>
                <div class="info-value">${startDate}</div>
              </div>
              <div class="info-item">
                <div class="info-label">End Date</div>
                <div class="info-value">${endDate}</div>
              </div>
            </div>
            
            ${
              leaveRequest.reason
                ? `
              <div class="reason-section">
                <div class="reason-label">Reason for Leave</div>
                <div class="reason-text">${leaveRequest.reason}</div>
              </div>
            `
                : ''
            }
            
            ${
              type === 'submitted'
                ? `
              <div style="text-align: center;">
                <a href="${this.configService.get('FRONTEND_URL', 'http://localhost:4200')}/approves" class="action-button">
                  Review Request
                </a>
              </div>
            `
                : ''
            }
          </div>
          
          <div class="footer">
            <p>This is an automated message from the Leave Management System.</p>
            <p>Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      ${statusText}
      
      Hello ${recipient.fullname},
      
      ${actionText}
      
      Employee: ${employee.fullname}
      Leave Type: ${leaveType}
      Start Date: ${startDate}
      End Date: ${endDate}
      ${leaveRequest.reason ? `Reason: ${leaveRequest.reason}` : ''}
      
      This is an automated message from the Leave Management System.
    `;

    return { subject, html, text };
  }

  async sendTestEmail(to: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Leave Management System" <${this.configService.get('SMTP_USER')}>`,
        to,
        subject: 'Test Email - Leave Management System',
        html: `
          <h1>Test Email</h1>
          <p>This is a test email from the Leave Management System.</p>
          <p>If you received this email, the email service is working correctly.</p>
        `,
        text: 'Test Email - This is a test email from the Leave Management System.',
      });

      console.log(`Test email sent to ${to}`);
    } catch (error) {
      console.error('Failed to send test email:', error);
      throw error;
    }
  }
}

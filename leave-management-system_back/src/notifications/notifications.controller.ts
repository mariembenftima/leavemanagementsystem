import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EmailNotificationService } from './email-notification.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly emailNotificationService: EmailNotificationService,
  ) {}

  @Post('test-email')
  async sendTestEmail(@Body() body: { email: string }, @Request() req) {
    try {
      await this.emailNotificationService.sendTestEmail(body.email);
      return {
        success: true,
        message: 'Test email sent successfully',
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: 'Failed to send test email',
        error: errorMessage,
      };
    }
  }
}

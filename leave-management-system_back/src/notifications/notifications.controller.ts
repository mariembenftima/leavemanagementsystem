import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EmailNotificationService } from './email-notification.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly emailNotificationService: EmailNotificationService,
  ) {}

  @Post('test-email')
  @ApiOperation({ summary: 'Send a test email' })
  @ApiResponse({ status: 200, description: 'Test email sent successfully' })
  @ApiResponse({ status: 500, description: 'Failed to send test email' })
  async sendTestEmail(@Body() body: { email: string }) {
    // ✅ Paramètre req retiré car non utilisé
    try {
      await this.emailNotificationService.sendTestEmail(body.email);
      return {
        success: true,
        message: 'Test email sent successfully',
      };
    } catch (error: unknown) {
      // ✅ Typage correct du catch
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

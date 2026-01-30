import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { SharedModule } from './shared/shared.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TeamsModule } from './teams/teams.module';
import { HolidaysModule } from './holidays/holidays.module';
import { ProfileModule } from './profile/profile.module';
import { LeaveBalancesModule } from './leave-balances/leave-balances.module';
import { LeaveTypesModule } from './leave-types/leave-types.module';
import { CalendarModule } from './calendar/calendar.module';
import { LeaveRequestsModule } from './leave-requests/leave-requests.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { AdminModule } from './admin/admin.module';
import { AdminLeaveRequestsModule } from './admin-leave-requests/admin-leave-requests.module';
import { AdminHolidaysModule } from './admin-holidays/admin-holidays.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize:
          process.env.NODE_ENV !== 'production' &&
          configService.get('DB_SYNCHRONIZE') === 'true',
      }),
      inject: [ConfigService],
    }),
    SharedModule,
    UsersModule,
    AuthModule,
    TeamsModule,
    HolidaysModule,
    ProfileModule,
    LeaveBalancesModule,
    LeaveTypesModule,
    CalendarModule,
    LeaveRequestsModule,
    NotificationsModule,
    TerminusModule,
    HttpModule,
    AdminModule,
    AdminLeaveRequestsModule,
    AdminHolidaysModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

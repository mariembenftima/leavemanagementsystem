import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';

import { SharedModule } from './shared/shared.module';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

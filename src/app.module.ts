import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from './config/config.module';
import { UsersModule } from './users/users.module';
import { TicketsModule } from './tickets/tickets.module';
import { MessagesModule } from './messages/messages.module';
import { ChatModule } from './chat/chat.module';
import { ParserModule } from './parser/parser.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RemovePasswordInterceptor } from './interceptors/remove-password.interceptor';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService ) => configService.get('database'),
    }),
    UsersModule,
    TicketsModule,
    MessagesModule,
    ChatModule,
    ParserModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RemovePasswordInterceptor
    }
  ],
})
export class AppModule {}

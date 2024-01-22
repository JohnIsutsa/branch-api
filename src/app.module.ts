import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { ChatModule } from './chat/chat.module';
import { ConfigModule } from './config/config.module';
import { RemovePasswordInterceptor } from './interceptors/remove-password.interceptor';
import { MessagesModule } from './messages/messages.module';
import { ParserModule } from './parser/parser.module';
import { TicketsModule } from './tickets/tickets.module';
import { UsersModule } from './users/users.module';

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
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RemovePasswordInterceptor
    }
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ParserService } from './parser.service';
import { ParserController } from './parser.controller';
import { UsersModule } from '../users/users.module';
import { MessagesModule } from '../messages/messages.module';
import { TicketsModule } from '../tickets/tickets.module';

@Module({
  imports: [
    UsersModule,
    MessagesModule,
    TicketsModule
  ],
  controllers: [ParserController],
  providers: [ParserService],
})
export class ParserModule { }

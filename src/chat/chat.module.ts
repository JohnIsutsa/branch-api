import { Module } from '@nestjs/common';
import { MessagesModule } from '../messages/messages.module';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { NotificationService } from './notification.service';

@Module({
  imports: [MessagesModule],
  providers: [ChatGateway, ChatService, NotificationService],
  exports: [ChatService, NotificationService]
})
export class ChatModule { }

import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from '../messages/dto/create-message.dto';
import { MessagesService } from '../messages/messages.service';

@Injectable()
export class ChatService {
  constructor(private messageService: MessagesService) { }

  sendMessage(createMessageDto: CreateMessageDto) {
    return this.messageService.create(createMessageDto);
  }
  
}

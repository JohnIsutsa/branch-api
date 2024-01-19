import { Injectable } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { EventType } from './notification.enums';

@Injectable()
export class NotificationService {
    constructor(private chatGateway: ChatGateway) { }

    sendNotification(ticket_uuid: string, message: string) {
        this.chatGateway.server.to(ticket_uuid).emit('notification', message);
    }

    emit(event: EventType, message: any) {
        this.chatGateway.server.emit(event, message);
    }
}

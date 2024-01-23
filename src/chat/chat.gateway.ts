import { OnModuleInit } from '@nestjs/common';
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateMessageDto } from '../messages/dto/create-message.dto';
import { ChatService } from './chat.service';
import { JoinChatDto } from './dto/create-chat.dto';
import { EventType } from './notification.enums';
import { CreateTicketDto } from 'src/tickets/dto/create-ticket.dto';
import { Ticket } from '../tickets/entities/ticket.entity';

@WebSocketGateway({ pingTimeout: 60000, pingInterval: 25000,cors: {origin: 'http://localhost:3000'}, namespace: 'chat'})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  constructor(private readonly chatService: ChatService) { }

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log('Socket connected: ' + socket.id);
    });
  }

  afterInit(server: Server) {
    // server.use((socket, next) => {
    //   console.log('Socket middleware');
    //   next();
    // });
    // console.log('Socket initialized');

  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log('Client connected: ' + client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected: ' + client.id);
  }

  @SubscribeMessage('onJoinChat')
  handleJoinChat(client: Socket, joinChatDto: JoinChatDto) {
    console.log('joinChat', joinChatDto);
    const { ticket_uuid } = joinChatDto;
    client.join(ticket_uuid);
    console.log(`Client ${client.id} joined private chat room ${ticket_uuid}`);
  }

  @SubscribeMessage('onNewMessage')
  async sendPrivateMessage(@MessageBody() createMessageDto: CreateMessageDto) {
    console.log('sendPrivateMessage', createMessageDto);
    const message = await this.chatService.sendMessage(createMessageDto);

    const { ticket_uuid } = createMessageDto;
    this.server.to(ticket_uuid).emit(EventType.PRIVATE_MESSAGE, message, (error: any) => {
      if (error) {
        console.log(`Error sending private message to room ${ticket_uuid}`, error);
      }
    });
  }

  @SubscribeMessage('onNewTicket')
  handleNewTicket(@MessageBody() ticket: Ticket) {
    console.log('newTicket', ticket);
    
    //Add the client to a room with the ticket uuid
    // Broadcast an event to all agents saying that a new ticket has been created
    this.server.emit(EventType.NEW_TICKET, ticket);
  }
}

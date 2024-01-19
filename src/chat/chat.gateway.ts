import { OnModuleInit } from '@nestjs/common';
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateMessageDto } from '../messages/dto/create-message.dto';
import { ChatService } from './chat.service';
import { JoinChatDto } from './dto/create-chat.dto';

@WebSocketGateway(parseInt(process.env.CHAT_PORT))
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer() 
  server: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log('Socket connected: ' + socket.id);
      socket.on('joinPrivateChat', (data) => {
        console.log('joinPrivateChat', data);
        socket.join(data);
      });
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

  @SubscribeMessage('joinChat')
  handleJoinChat(client: Socket, joinChatDto: JoinChatDto) {
    console.log('joinChat', joinChatDto);
    const { ticket_uuid } = joinChatDto;
    client.join(ticket_uuid);
    console.log(`Client ${client.id} joined private chat room ${ticket_uuid}`);
  }

  @SubscribeMessage(`sendPrivateMessage`)
  sendPrivateMessage(@MessageBody() createMessageDto: CreateMessageDto) {
    console.log('sendPrivateMessage', createMessageDto);
    this.chatService.sendMessage(createMessageDto);

    const { ticket_uuid } = createMessageDto;
    this.server.to(ticket_uuid).emit('privateMessage', createMessageDto);
  }
  
}

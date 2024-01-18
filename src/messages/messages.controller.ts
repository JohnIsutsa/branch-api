import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessagesService } from './messages.service';

@ApiTags('Messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  create(@Body() createMessageDto: CreateMessageDto) {
    const message = this.messagesService.create(createMessageDto);
    return { status: 'success', data: message }
  }

  @Get()
  async findAll() {
    const messages = await this.messagesService.findAll();
    return { status: 'success', data: messages }
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    const message = this.messagesService.findOne(uuid);
    return { status: 'success', data: message }
  }

  @Get('ticket/:ticket_uuid')
  async findMessagesByTicket(@Param('ticket_uuid') ticket_uuid: string) {
    const messages = await this.messagesService.findByTicket(ticket_uuid);
    return { status: 'success', data: messages }
  }

  @Get('user/:user_uuid')
  async findMessagesByUser(@Param('user_uuid') user_uuid: string) {
    const messages = await this.messagesService.findByUser(user_uuid);
    return { status: 'success', data: messages }
  }

  @Patch(':uuid')
  async update(@Param('uuid') uuid: string, @Body() updateMessageDto: UpdateMessageDto) {
    const message = await this.messagesService.update(uuid, updateMessageDto);
    return { status: 'success', data: message }
  }

}
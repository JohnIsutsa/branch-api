import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../common/enums';
import { TicketsService } from '../tickets/tickets.service';
import { UsersService } from '../users/users.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';
import { Ticket } from '../tickets/entities/ticket.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message) private messageRepository: Repository<Message>,
    @InjectRepository(Ticket) private ticketRepository: Repository<Ticket>,
    private usersService: UsersService,
    private ticketsService: TicketsService
  ) { }

  /**
   * Creates a new message.
   * @param createMessageDto - The data for creating the message.
   * @returns A promise that resolves to the created message.
   */
  async create(createMessageDto: CreateMessageDto) {
    const { sender_uuid, ticket_uuid } = createMessageDto;
    const user = await this.usersService.findOne(sender_uuid);
    const ticket = await this.ticketsService.findOne(ticket_uuid);

    const message = this.messageRepository.create({
      ...createMessageDto,
      sender: user.role as UserRole,
      user,
      ticket
    });
    return this.messageRepository.save(message);
  }

  /**
   * Retrieves all messages from the message repository.
   * @returns {Promise<Message[]>} A promise that resolves to an array of messages.
   */
  findAll() {
    return this.messageRepository.find();
  }

  /**
   * Finds a message by its UUID.
   * @param uuid - The UUID of the message to find.
   * @returns A Promise that resolves to the found message, or undefined if not found.
   */
  async findOne(uuid: string) {
    return await this.messageRepository.findOne({ where: { uuid } });
  }

  /**
   * Finds messages by ticket UUID.
   * @param ticket_uuid - The UUID of the ticket.
   * @returns A promise that resolves to an array of messages.
   */
  findByTicket(ticket_uuid: string) {
    return this.messageRepository.find({ where: { ticket: { uuid: ticket_uuid } }, order: { timestamp: 'ASC' } });
  }

  /**
   * Finds tickets by user UUID.
   * @param uuid - The UUID of the user.
   * @returns A promise that resolves to an array of objects containing the ticket.
   */
  async findByUser(uuid: string): Promise<{ ticket: Ticket }[]> {
    const tickets = await this.ticketRepository.createQueryBuilder("ticket")
        .leftJoinAndSelect("ticket.messages", "message")
        .where("message.user = :uuid", { uuid })
        .orderBy("message.timestamp", "ASC")
        .getMany();
  
    return tickets.map(ticket => ({ ticket }));
  }

  /**
   * Updates a message with the specified UUID.
   * @param uuid - The UUID of the message to update.
   * @param updateMessageDto - The data to update the message with.
   * @returns A Promise that resolves to the updated message.
   * @throws Error if the message with the specified UUID is not found.
   * @throws NotAcceptableException if editing the message is not allowed after 5 minutes.
   */
  async update(uuid: string, updateMessageDto: UpdateMessageDto): Promise<Message> {
    const message = await this.messageRepository.findOne({ where: { uuid } });
    if (!message) {
      throw new Error(`Message with id ${uuid} not found`);
    }

    const currentTime = new Date();
    const messageTime = new Date(message.timestamp);
    const timeDifference = currentTime.getTime() - messageTime.getTime();
    const timeDifferenceInMinutes = Math.floor(timeDifference / (1000 * 60));

    if (timeDifferenceInMinutes > 5) {
      throw new NotAcceptableException(`Editing the message is not allowed after 5 minutes.`);
    }

    const updatedMessage = {
      ...message,
      ...updateMessageDto,
    };

    return await this.messageRepository.save(updatedMessage);
  }

}

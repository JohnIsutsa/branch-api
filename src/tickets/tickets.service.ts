import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { paginate } from '../common/pagination/paginate';
import { Message } from '../messages/entities/message.entity';
import { UsersService } from '../users/users.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { GetTicketDto, TicketPaginator } from './dto/get-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket } from './entities/ticket.entity';
import { callOpenAI } from '../utils/ticket-classifier.utils';
const Fuse = require('fuse.js');

const fuseOptions = {
  keys: ['title', 'description'],
  threshold: 0.3,
}

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket) private ticketRepository: Repository<Ticket>,
    @InjectRepository(Message) private messageRepository: Repository<Message>,
    private usersService: UsersService,
  ) { }

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const { customer_uuid } = createTicketDto;
    const customer = await this.usersService.findOneCustomer(customer_uuid);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    createTicketDto['customer'] = customer;
    const ticket = this.ticketRepository.create(createTicketDto);
    await this.ticketRepository.save(ticket);

    // Asynchronously classify the ticket
    this.classifyTicket(ticket);

    //create a message from the description of the ticket
    const message = this.messageRepository.create({
      content: createTicketDto.description,
      sender: customer.role,
      user: customer,
      ticket
    });
    this.messageRepository.save(message);

    return ticket;
  }

  /**
   * Retrieves a paginated list of tickets based on the provided criteria.
   * @param getTicketDto - The DTO containing the search criteria.
   * @returns A Promise that resolves to a TicketPaginator object.
   */
  async findAll(getTicketDto: GetTicketDto): Promise<TicketPaginator> {
    let { status, search, limit, page, ticket_type } = getTicketDto;

    if (!page || page < 1) page = 1;
    if (!limit || limit < 1) limit = 15;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const options: FindManyOptions<Ticket> = {
      relations: ['customer'],
      // skip: startIndex,
      // take: limit,
      order: { created_at: 'DESC' },
      where: { status: status, ticket_type: ticket_type },
    };

    let data = await this.ticketRepository.find(options);

    if (search) {
      const fuse = new Fuse(data, fuseOptions);
      data = fuse.search(search)?.map(({ item }) => item);
    }

    const results = data.slice(startIndex, endIndex);
    const url = `/tickets/?limit=${limit}`

    return {
      ...paginate(data.length, page, limit, results.length, url),
      data: results,
    }
  }

  /**
   * Finds a ticket by its UUID.
   * @param uuid - The UUID of the ticket to find.
   * @returns The found ticket.
   * @throws NotFoundException if the ticket is not found.
   */
  async findOne(uuid: string) {
    const ticket = await this.ticketRepository.findOne({ where: { uuid }, relations: ['customer'] });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  /**
   * Finds tickets by customer UUID.
   * Function is used internally by the service and its dependencies.
   * @param uuid - The UUID of the customer.
   * @returns A promise that resolves to an array of tickets.
   * @throws NotFoundException if the customer is not found.
   */
  async findByCustomerInternal(uuid: string) {
    const customer = await this.usersService.findOneCustomer(uuid);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    
    const tickets = await this.ticketRepository.find({ relations: ['customer'], where: { customer: { uuid: customer.uuid } } });
    return tickets;
  }

  /**
   * Finds tickets by customer UUID.
   * 
   * @param uuid - The UUID of the customer.
   * @param getTicketDto - Optional DTO for filtering and pagination.
   * @returns A promise that resolves to a TicketPaginator object.
   * @throws NotFoundException if the customer is not found.
   */
  async findByCustomer(uuid: string, getTicketDto?: GetTicketDto): Promise<TicketPaginator> {
    const customer = await this.usersService.findOneCustomer(uuid);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    let { limit, page } = getTicketDto;
    if (!page || page < 1) page = 1;
    if (!limit || limit < 1) limit = 15;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const options: FindManyOptions<Ticket> = {
      relations: ['customer'],
      where: { customer: { uuid: customer.uuid } },
      order: { created_at: 'DESC' },
    };

    let data = await this.ticketRepository.find(options);

    const results = data.slice(startIndex, endIndex);
    const url = `/tickets/customer/${uuid}?limit=${limit}`;

    return {
      ...paginate(data.length, page, limit, results.length, url),
      data: results,
    };
  }

  /**
   * Finds tickets by agent UUID.
   * 
   * @param uuid - The UUID of the agent.
   * @param getTicketDto - Optional DTO for filtering tickets.
   * @returns A promise that resolves to a TicketPaginator object.
   * @throws NotFoundException if the agent is not found.
   */
  async findByAgent(uuid: string, getTicketDto?: GetTicketDto): Promise<TicketPaginator> {
    const agent = await this.usersService.findOneAgent(uuid);
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    let { limit, page } = getTicketDto;
    if (!page || page < 1) page = 1;
    if (!limit || limit < 1) limit = 15;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const findOptions: FindManyOptions<Ticket> = {
      relations: ['agents', 'customer'],
      where: { agents: { uuid } },
      order: { created_at: 'DESC' },
    };

    const data = await this.ticketRepository.find(findOptions);

    const results = data.slice(startIndex, endIndex);
    const url = `/tickets/agent/${uuid}?limit=${limit}`;

    return {
      ...paginate(data.length, page, limit, results.length, url),
      data: results,
    };
  }

  /**
   * Adds an agent to a ticket.
   * @param uuid - The UUID of the ticket.
   * @param agentUuid - The UUID of the agent.
   * @returns A Promise that resolves to the updated ticket.
   * @throws NotFoundException if the ticket or agent is not found.
   * @throws BadRequestException if the ticket already has an agent.
   */
  async addAgentToTicket(uuid: string, agentUuid: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({ where: { uuid }, relations: ['agents'] });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    if (ticket.agents.length > 0) {
      throw new BadRequestException('Ticket already has an agent');
    }
    const agent = await this.usersService.findOneAgent(agentUuid);
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    ticket.agents = [...ticket.agents, agent];
    return await this.ticketRepository.save(ticket);
  }

  /**
   * Removes an agent from a ticket.
   * @param uuid - The UUID of the ticket.
   * @param agentUuid - The UUID of the agent to be removed.
   * @returns A Promise that resolves to the updated ticket.
   * @throws NotFoundException if the ticket or agent is not found.
   */
  async removeAgentFromTicket(uuid: string, agentUuid: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({ where: { uuid }, relations: ['agents'] });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    const agent = await this.usersService.findOneAgent(agentUuid);
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    ticket.agents = ticket.agents.filter(agent => agent.uuid !== agentUuid);
    return this.ticketRepository.save(ticket);
  }

  /**
   * Updates a ticket with the specified UUID.
   * @param uuid - The UUID of the ticket to update.
   * @param updateTicketDto - The data to update the ticket with.
   * @returns The updated ticket.
   * @throws NotFoundException if the ticket with the specified UUID is not found.
   */
  async update(uuid: string, updateTicketDto: UpdateTicketDto) {
    const ticket = await this.ticketRepository.findOne({ where: { uuid }, relations: ['customer'] });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    Object.assign(ticket, updateTicketDto);
    return this.ticketRepository.save(ticket);
    // return this.ticketRepository.save({ ...ticket, ...updateTicketDto });
  }

  /**
   * Classifies a ticket by calling the OpenAI API and updates the ticket with the classified ticket type.
   * @param ticket - The ticket to be classified.
   * @throws Error if ticket classification fails.
   */
  async classifyTicket(ticket: Ticket) {
    try {
      const { } = ticket;
      const completion = await callOpenAI(ticket);
      const jsonString = completion.choices[0].text.trim();
      const jsonObject = JSON.parse(jsonString);

      if (this.isValidTicketObject(jsonObject)) {
        const updatedTicket: Ticket = {
          ...ticket,
          ticket_type: jsonObject.ticket_type,
        };

        await this.ticketRepository.save(updatedTicket);
      } else {
        console.error('Invalid JSON object structure.');
      }
    } catch (error) {
      console.error('An error occurred while classifying the ticket:', error);
      throw new Error('Ticket classification failed.');
    }
  }

  /**
   * Checks if the given object is a valid ticket object.
   * 
   * @param obj - The object to be checked.
   * @returns True if the object is a valid ticket object, false otherwise.
   */
  isValidTicketObject(obj: any) {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'title' in obj &&
      'description' in obj &&
      'ticket_type' in obj
    );
  }

}

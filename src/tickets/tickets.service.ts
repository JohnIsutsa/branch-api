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

  async findOne(uuid: string) {
    const ticket = await this.ticketRepository.findOne({ where: { uuid }, relations: ['customer'] });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  async findByCustomerInternal(uuid: string) {
    const customer = await this.usersService.findOneCustomer(uuid);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    
    const tickets = await this.ticketRepository.find({ relations: ['customer'], where: { customer: { uuid: customer.uuid } } });
    return tickets;
  }

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

  async update(uuid: string, updateTicketDto: UpdateTicketDto) {
    const ticket = await this.ticketRepository.findOne({ where: { uuid }, relations: ['customer'] });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    Object.assign(ticket, updateTicketDto);
    return this.ticketRepository.save(ticket);
    // return this.ticketRepository.save({ ...ticket, ...updateTicketDto });
  }

  async testClassifier(uuid: string) {
    const ticket = await this.ticketRepository.findOne({ where: { uuid } });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    console.log('Ticket:', ticket);
    this.classifyTicket(ticket);
  }

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

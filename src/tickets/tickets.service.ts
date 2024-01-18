import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { paginate } from '../common/pagination/paginate';
import { UsersService } from '../users/users.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { GetTicketDto, TicketPaginator } from './dto/get-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket } from './entities/ticket.entity';
const Fuse = require('fuse.js');

const fuseOptions = {
  keys: ['title', 'description'],
  threshold: 0.3,
}

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket) private ticketRepository: Repository<Ticket>,
    private usersService: UsersService,
  ) { }

  async create(createTicketDto: CreateTicketDto) {
    const { customer_uuid } = createTicketDto;
    const customer = await this.usersService.findOneCustomer(customer_uuid);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    createTicketDto['customer'] = customer;
    const ticket = this.ticketRepository.create(createTicketDto);
    return this.ticketRepository.save(ticket);
  }

  async findAll(getTicketDto: GetTicketDto): Promise<TicketPaginator> {
    let { status, search, limit, page } = getTicketDto;

    if (!page || page < 1) page = 1;
    if (!limit || limit < 1) limit = 15;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const options: FindManyOptions<Ticket> = {
      relations: ['customer'],
      skip: startIndex,
      take: limit,
      order: { created_at: 'DESC' },
      where: { status: status },
    };

    let data = await this.ticketRepository.find(options);

    if (search) {
      const fuse = new Fuse(data, fuseOptions);
      data = fuse.search(search)?.map(({ item }) => item);
    }

    const results = data.slice(startIndex, endIndex);
    const url = `/tickets/?limit=${limit}`

    return {
      ...paginate(results.length, page, limit, results.length, url),
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

  async findByCustomer(uuid: string) {
    const customer = await this.usersService.findOneCustomer(uuid);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const tickets = await this.ticketRepository.find({ relations: ['customer'], where: { customer: { uuid: customer.uuid } } });
    return tickets;
  }

  async findByAgent(uuid: string) {
    const agent = await this.usersService.findOneAgent(uuid);
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    const findOptions: FindManyOptions<Ticket> = {
      relations: ['agents', 'customer'],
      where: { agents: { uuid } },
    };

    const tickets = await this.ticketRepository.find(findOptions);

    return tickets;
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
    const ticket = await this.ticketRepository.findOne({ where: { uuid } });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    Object.assign(ticket, updateTicketDto);
    return this.ticketRepository.save(ticket);
    // return this.ticketRepository.save({ ...ticket, ...updateTicketDto });
  }
  
}

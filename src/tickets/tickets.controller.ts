import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { GetTicketDto } from './dto/get-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketsService } from './tickets.service';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) { }

  @Post()
  async create(@Body() createTicketDto: CreateTicketDto) {
    const ticket = await this.ticketsService.create(createTicketDto);
    return { status: 'success', data: ticket }
  }

  @Get()
  findAll(@Query() getTicketDto: GetTicketDto) {
    return this.ticketsService.findAll(getTicketDto);
  }

  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string) {
    const ticket = await this.ticketsService.findOne(uuid);
    return { status: 'success', data: ticket }
  }

  @Get('customer/:uuid')
  async findByCustomer(@Param('uuid') uuid: string, @Query() getTicketDto: GetTicketDto) {
    const tickets = await this.ticketsService.findByCustomer(uuid, getTicketDto);
    return tickets;
  }

  @Get('agent/:uuid')
  async findByAgent(@Param('uuid') uuid: string, @Query() getTicketDto: GetTicketDto) {
    const tickets = await this.ticketsService.findByAgent(uuid, getTicketDto);
    return tickets;
  }

  @Patch(':uuid/add-agent')
  async addAgentToTicket(@Param('uuid') uuid: string, @Body('agent_uuid') agent_uuid: string) {
    const ticket = await this.ticketsService.addAgentToTicket(uuid, agent_uuid);
    return { status: 'success', data: ticket };
  }

  @Patch(':uuid/remove-agent')
  async removeAgentFromTicket(@Param('uuid') uuid: string, @Body('agent_uuid') agent_uuid: string) {
    const ticket = await this.ticketsService.removeAgentFromTicket(uuid, agent_uuid);
    return { status: 'success', data: ticket };
  }

  @Patch(':uuid')
  async update(@Param('uuid') uuid: string, @Body() updateTicketDto: UpdateTicketDto) {
    const ticket = await this.ticketsService.update(uuid, updateTicketDto);
    return { status: 'success', data: ticket };
  }
}

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
  create(@Body() createTicketDto: CreateTicketDto) {
    const ticket = this.ticketsService.create(createTicketDto);
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
  async findByCustomer(@Param('uuid') uuid: string) {
    const tickets = await this.ticketsService.findByCustomer(uuid);
    return { status: 'success', data: tickets }
  }

  @Get('agent/:uuid')
  async findByAgent(@Param('uuid') uuid: string) {
    const tickets = await this.ticketsService.findByAgent(uuid);
    return { status: 'success', data: tickets }
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
  update(@Param('uuid') uuid: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketsService.update(uuid, updateTicketDto);
  }
}

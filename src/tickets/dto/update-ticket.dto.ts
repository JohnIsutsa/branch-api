import { ApiProperty, PartialType } from '@nestjs/swagger';
import { TicketStatus } from '../entities/ticket.entity';
import { CreateTicketDto } from './create-ticket.dto';
import { IsEnum } from 'class-validator';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
    @ApiProperty({required: false})
    @IsEnum(TicketStatus)
    status?: TicketStatus
}

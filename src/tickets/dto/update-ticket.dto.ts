import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TicketStatus } from '../../common/enums';
import { CreateTicketDto } from './create-ticket.dto';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
    @ApiProperty({required: false})
    @IsEnum(TicketStatus)
    status?: TicketStatus
}

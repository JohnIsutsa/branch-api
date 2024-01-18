import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { TicketType } from "src/common/enums";

export class CreateTicketDto {
    @ApiProperty({ name: 'customer_uuid', description: 'The uuid of the customer who created the ticket'})
    @IsString()
    customer_uuid: string;

    @ApiProperty({ name: 'title', description: 'The title of the ticket'})  
    @IsString()
    title: string;
    
    @ApiProperty({ name: 'description', description: 'The description of the ticket'})
    @IsString()
    description: string;

    @ApiProperty({ name: 'ticket_type', description: 'The type of the ticket', enum: TicketType, default: TicketType.OTHER})
    @IsEnum(TicketType)
    @IsOptional()
    ticket_type?: TicketType;
}

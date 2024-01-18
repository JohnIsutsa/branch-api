import { TicketStatus } from "../../common/enums";
import { PaginationArgs } from "../../common/dto/pagination-args.dto";
import { Paginator } from "../../common/dto/paginator.dto";
import { Ticket} from "../entities/ticket.entity";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";

export class TicketPaginator extends Paginator<Ticket> {
    data: Ticket[];
}

export class GetTicketDto extends PaginationArgs {
    @ApiProperty({required: false})
    @IsEnum(TicketStatus)
    @IsOptional()
    status?: TicketStatus

    @ApiProperty({required: false})
    @IsOptional()
    search?: string
}
import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID } from "class-validator";

export class CreateMessageDto {

    @ApiProperty()
    @IsUUID(4)
    sender_uuid: string;

    @ApiProperty()
    @IsUUID(4)
    ticket_uuid: string;

    @ApiProperty()
    @IsString()
    content: string;
}

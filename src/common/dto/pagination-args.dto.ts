import { ApiProperty } from "@nestjs/swagger";

export class PaginationArgs {
    @ApiProperty({required: false})
    first?: number;

    @ApiProperty({required: false})
    limit?: number;

    @ApiProperty({required: false})
    page?: number;
}

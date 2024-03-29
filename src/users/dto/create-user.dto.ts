import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";
import { UserRole } from "../../common/enums";

export class CreateUserDto {
    @ApiProperty({name: 'name', description: 'Name of the user', example: 'John Doe', required: true})
    @IsString()
    name: string;

    @ApiProperty({name: 'email', description: 'Email of the user', example: 'john@branch.com', required: true, format: 'email' })
    @IsEmail()
    email: string;

    @ApiProperty({name: 'password', description: 'Password of the user', required: true})
    @IsString()
    password: string;

    @ApiProperty({name: 'role', description: 'Role of the user', enum: UserRole, required: true})
    @IsString()
    role?: UserRole;
}

import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class SigninUserDto {

    @ApiProperty({name: 'email', description: 'Email of the user', example: 'john@branch.com', required: true, format: 'email' })
    @IsEmail()
    email: string;

    @ApiProperty({name: 'password', description: 'Password of the user', required: true})
    @IsString()
    password: string;
}
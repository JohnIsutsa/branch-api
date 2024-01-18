import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserRole } from "../common/enums";

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService
    ) { }

    async userSignUp(createUserDto: CreateUserDto, role: UserRole) {
        const user = await this.usersService.findByEmail(createUserDto.email);
        if (user) {
            throw new BadRequestException('User already exists');
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 12);
        createUserDto.password = hashedPassword;
        createUserDto['role'] = role;

        const createdUser = await this.usersService.create(createUserDto);
        const payload = { email: createdUser.email, sub: createdUser.uuid };
        return {
            user: createdUser,
            access_token: this.jwtService.sign(payload),
        };
    }

    async userSignin(email: string, password: string, role: UserRole) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new BadRequestException('Invalid credentials');
        }

        if (user.role !== role) {
            throw new ForbiddenException('You are not allowed to access this resource');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new BadRequestException('Invalid credentials');
        }

        const payload = { email: user.email, sub: user.uuid };
        return {
            user,
            access_token: this.jwtService.sign(payload),
        };
    }

}
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../common/enums';
import { UsersService } from './users.service';
import { ApiTags } from '@nestjs/swagger';
import { SigninUserDto } from './dto/signin-user.dto';

@Controller('users')
@ApiTags ('Users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService
  ) { }

  @Post('customer/signup')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.userSignUp(createUserDto, UserRole.CUSTOMER);
  }

  @Post('agent/signup')
  createAgent(@Body() createUserDto: CreateUserDto) {
    return this.authService.userSignUp(createUserDto, UserRole.AGENT);
  }

  @Post('customer/signin')
  signInCustomer(@Body() signinUserDto: SigninUserDto) {
    return this.authService.userSignin(signinUserDto.email, signinUserDto.password, UserRole.CUSTOMER);
  }

  @Post('agent/signin')
  signInAgent(@Body() signinUserDto: SigninUserDto) {
    return this.authService.userSignin(signinUserDto.email, signinUserDto.password, UserRole.AGENT);
  }

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return { status: 'success', data: users }
  }

  @Get('customers')
  async findAllCustomers() {
    const users = await this.usersService.findAllCustomers();
    return { status: 'success', data: users }
  }

  @Get('agents')
  async findAllAgents() {
    const users = await this.usersService.findAllAgents();
    return { status: 'success', data: users }
  }

  @Get('customer/:uuid')
  async findOneCustomer(@Param('uuid') uuid: string) {
    const user = await this.usersService.findOneCustomer(uuid);
    return { status: 'success', data: user }
  }

  @Get('agent/:uuid')
  async findOneAgent(@Param('uuid') uuid: string) {
    const user = await this.usersService.findOneAgent(uuid);
    return { status: 'success', data: user }
  }

  @Get('email/:email')
  async findOneByEmail(@Param('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    return { status: 'success', data: user }
  }

  @Patch(':uuid')
  update(@Param('uuid') uuid: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(uuid, updateUserDto);
  }

  @Delete(':uuid')
  remove(@Param('uuid') uuid: string) {
    return this.usersService.remove(uuid);
  }
}

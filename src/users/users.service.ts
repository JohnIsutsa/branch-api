import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../common/enums';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>
  ) { }


  /**
   * Creates a new user with the provided user data.
   * @param createUserDto The data for creating the user.
   * @returns A promise that resolves to the created user.
   */
  create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepo.create(createUserDto);
    return this.userRepo.save(user);
  }

  /**
   * Retrieves all users from the user repository.
   * @returns {Promise<User[]>} A promise that resolves to an array of User objects representing the users.
   */
  findAll(): Promise<User[]> {
    return this.userRepo.find();
  }

  /**
   * Retrieves all customers from the user repository.
   * @returns {Promise<User[]>} A promise that resolves to an array of User objects representing the customers.
   */
  findAllCustomers(): Promise<User[]> {
    return this.userRepo.find({ where: { role: UserRole.CUSTOMER } });
  }

  /**
   * Retrieves all agents from the user repository.
   * @returns {Promise<User[]>} A promise that resolves to an array of User objects representing the customers.
   */
  findAllAgents(): Promise<User[]> {
    return this.userRepo.find({ where: { role: UserRole.AGENT } });
  }

  /**
   * Finds a user by their email.
   * @param email - The email of the user to find.
   * @returns A promise that resolves to the found user.
   */
  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { email } })
    if (!user) {
      throw new NotFoundException('No user found with the provided email');
    }
    return user;
  }


  async findOneCustomer(uuid: string) {
    const customer = await this.userRepo.findOne({ where: { uuid } });
    if (customer && customer.role !== UserRole.CUSTOMER) {
      throw new NotFoundException('No customer found with the provided uuid');
    }
    return customer;
  }

  async findOneAgent(uuid: string) {
    const agent = await this.userRepo.findOne({ where: { uuid } });
    if (agent && agent.role !== UserRole.AGENT) {
      throw new NotFoundException('No agent found with the provided uuid');
    }
    return agent;
  }

  async findOne(uuid: string): Promise<User> {
    return await this.userRepo.findOne({ where: { uuid } });
  }

  async update(uuid: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { uuid } });
    if (!user) {
      throw new NotFoundException('No user found with the provided id');
    }
    Object.assign(user, updateUserDto);
    return this.userRepo.save(user);
  }

  remove(uuid: string) {
    return this.userRepo.delete({ uuid });
  }
}

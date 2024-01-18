import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { Ticket } from './entities/ticket.entity';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Ticket])
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}

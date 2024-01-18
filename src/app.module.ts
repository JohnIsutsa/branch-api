import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from './config/config.module';
import { UsersModule } from './users/users.module';
import { TicketsModule } from './tickets/tickets.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService ) => configService.get('database'),
    }),
    UsersModule,
    TicketsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

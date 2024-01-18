import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      global: true,
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('app.jwtSecret'),
        signOptions: {
          expiresIn: configService.get('app.jwtExpirationInterval'),
        },
      }),
    })
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthService],
  exports: [UsersService, AuthService]
})
export class UsersModule {}

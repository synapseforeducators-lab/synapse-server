import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common';
import { User } from './entities/user.entity';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { UsersRepository } from './repository/users.repository';
import { SmsModule } from 'src/common/sms/sms.module';

@Module({
  imports: [DatabaseModule.forFeature([User]), SmsModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UserModule {}

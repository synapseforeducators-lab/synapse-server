import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common';
import { User } from './entities/user.entity';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { UsersRepository } from './repository/users.repository';
import { EmailModule } from 'src/common/email/email.module';

import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { SchoolModule } from 'src/schools/school.module';

@Module({
  imports: [DatabaseModule.forFeature([User]), EmailModule, CloudinaryModule, SchoolModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UserModule {}

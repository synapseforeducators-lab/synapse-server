import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common';
import { User } from './entities/user.entity';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { UsersRepository } from './repository/users.repository';
import { EmailModule } from 'src/common/email/email.module';
import { School } from './entities/school.entity';
import { SchoolsService } from './school.service';
import { SchoolsRepository } from './repository/schools.repository';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';

@Module({
  imports: [
    DatabaseModule.forFeature([User, School]),
    EmailModule,
    CloudinaryModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, SchoolsService, UsersRepository, SchoolsRepository],
  exports: [UsersService],
})
export class UserModule {}

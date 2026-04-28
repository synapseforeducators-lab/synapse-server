import { SmsService } from '../common/sms/sms.service';
import { BadRequestException, Injectable } from '@nestjs/common';

import { User } from './entities/user.entity';
import { customResponse } from 'src/common/util';

import { CreateSchoolDto, UpdateSchoolDto } from './dto/create-school.dto';
import { SchoolsRepository } from './repository/schools.repository';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { UsersRepository } from './repository/users.repository';

@Injectable()
export class SchoolsService {
  constructor(
    private readonly schoolsRepository: SchoolsRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createSchoolProfile(user: User, createSchoolDto: CreateSchoolDto) {
    const schoolRes = await this.schoolsRepository.createSchoolProfile(
      user,
      createSchoolDto,
    );

    if (!schoolRes) {
      throw new BadRequestException('Something went wrong');
    }

    return customResponse('School profile added successfully');
  }

  async updateSchoolLogo(user: User, file: Express.Multer.File) {
    const userResp = await this.schoolsRepository.findOne({ createdBy: user });

    if (!userResp) {
      throw new BadRequestException('Reach out to admin to update school logo');
    }

    const imgUrl = await this.cloudinaryService.uploadImageToCloudinary(file);
    if (!imgUrl) throw new BadRequestException('unable to upload image');

    const schoolResp = await this.schoolsRepository.findOneAndUpdate(
      { createdBy: user },
      {
        school_logo_url: imgUrl,
      },
    );
    delete schoolResp.created_at;
    delete schoolResp.updated_at;
    delete schoolResp.id;

    return customResponse('Profile photo updated successfully', schoolResp);
  }

  async updateSchoolProfile(user: User, updateSchoolDto: UpdateSchoolDto) {
    const userResp = await this.schoolsRepository.findOne({ createdBy: user });

    if (!userResp) {
      throw new BadRequestException(
        'Reach out to admin to update school details',
      );
    }

    const schoolRes = await this.schoolsRepository.findOneAndUpdate(
      { createdBy: user },
      { ...updateSchoolDto },
    );

    if (!schoolRes) {
      throw new BadRequestException('Something went wrong');
    }

    return customResponse('School profile details updated successfully');
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';

import { customResponse } from 'src/common/util';

import { CreateSchoolDto } from './dto/create-school.dto';
import { SchoolsRepository } from './repository/schools.repository';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { User } from 'src/user/entities/user.entity';
import { SchoolMembersRepository } from './repository/school-members.repository';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Injectable()
export class SchoolsService {
  constructor(
    private readonly userRepository: SchoolsRepository,
    private readonly schoolsRepository: SchoolsRepository,
    private readonly schoolMembersRepository: SchoolMembersRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createSchoolProfile(user: User, createSchoolDto: CreateSchoolDto) {
    const existingSchool = await this.schoolsRepository.findOne({
      ownerId: user.id,
    });

    if (existingSchool) {
      throw new BadRequestException('User already attached to a school');
    }

    const { school } = await this.userRepository.createSchool(
      user,
      createSchoolDto,
    );

    delete school.created_at;
    delete school.updated_at;
    delete school.id;

    return customResponse('School profile added successfully', school);
  }

  async updateSchoolLogo(user: User, file: Express.Multer.File) {
    const userResp = await this.schoolsRepository.findOne({ owner: user });

    if (!userResp) {
      throw new BadRequestException('Reach out to admin to update school logo');
    }

    const imgUrl = await this.cloudinaryService.uploadImageToCloudinary(file);
    if (!imgUrl) throw new BadRequestException('unable to upload image');

    const schoolResp = await this.schoolsRepository.findOneAndUpdate(
      { owner: user },
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
    const userResp = await this.schoolsRepository.findOne({ owner: user });

    if (!userResp) {
      throw new BadRequestException(
        'Reach out to admin to update school details',
      );
    }

    const schoolRes = await this.schoolsRepository.findOneAndUpdate(
      { owner: user },
      { ...updateSchoolDto },
    );

    if (!schoolRes) {
      throw new BadRequestException('Something went wrong');
    }

    return customResponse('School profile details updated successfully');
  }

  async findSchoolByUser(user: User) {
    const schoolMember = await this.schoolMembersRepository.findOne({
      userId: user.id,
    });
    if (!schoolMember) {
      return null;
    }

    const school = await this.schoolsRepository.findOne({
      id: schoolMember.schoolId,
    });

    delete school.id;
    delete school.updated_at;
    delete school.created_at;
    delete school.owner;
    delete school.ownerId;
    return school;
  }
}

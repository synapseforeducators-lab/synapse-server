import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSupportDto } from './dto/create-support.dto';
import { UpdateSupportDto } from './dto/update-support.dto';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { SupportsRepository } from './repository/supports.repository';
import { User } from 'src/user/entities/user.entity';
import { Support } from './entities/support.entity';
import { customResponse } from 'src/common/util';

@Injectable()
export class SupportService {
  constructor(
    private readonly supportsRepository: SupportsRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  async create(
    user: User,
    createSupportDto: CreateSupportDto,
    file: Express.Multer.File,
  ) {
    const imgUrl = await this.cloudinaryService.uploadImageToCloudinary(file);
    if (!imgUrl) throw new BadRequestException('unable to upload image');

    const support = new Support({
      attachment_url: imgUrl,
      userId: user.id,
      user: user,
      ...createSupportDto,
    });

    const supportRes = await this.supportsRepository.create(support);

    if (!supportRes) {
      throw new BadRequestException('something went wrong');
    }

    return customResponse('Support ticket created');
  }

  async findAll() {
    return await this.supportsRepository.getAllSupport();
  }

  async findOne(id: string) {
    return await this.supportsRepository.findAndSelect({ id: id }, [
      'attachment_url',
      'complaint_type',
      'description',
      'subject',
      'user',
    ]);
  }
}

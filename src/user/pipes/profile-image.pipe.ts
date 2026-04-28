import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: Express.Multer.File, metadata: ArgumentMetadata) {
    if (!value) {
      throw new BadRequestException('No file provided.');
    }

    const maxSize = 20 * 1024 * 1024;
    if (value.size > maxSize) {
      throw new BadRequestException('File size exceeds the 15MB limit.');
    }

    return value;
  }
}

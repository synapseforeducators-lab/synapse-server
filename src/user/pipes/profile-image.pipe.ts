import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  // @ts-ignore
  transform(value: Express.Multer.File, _metadata: ArgumentMetadata) {
    if (!value) {
      throw new BadRequestException('No file provided.');
    }

    const maxSize = 20 * 1024 * 1024;
    if (value.size > maxSize) {
      throw new BadRequestException('File size exceeds the 20MB limit.');
    }

    return value;
  }
}

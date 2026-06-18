import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { extname } from 'path';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'];

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: Express.Multer.File | undefined) {
    if (!value) {
      return value;
    }

    const maxSize = 20 * 1024 * 1024;
    if (value.size > maxSize) {
      throw new BadRequestException('File size exceeds the 20MB limit.');
    }

    const extension = extname(value.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      throw new BadRequestException(
        'Invalid file extension. Only jpg, jpeg, and png are allowed.',
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(value.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG and PNG images are allowed.',
      );
    }

    return value;
  }
}

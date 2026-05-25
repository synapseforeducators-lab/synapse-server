import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class SvgFileValidationPipe implements PipeTransform {
  // @ts-ignore
  transform(value: Express.Multer.File, _metadata: ArgumentMetadata) {
    if (!value) {
      throw new BadRequestException('No file provided.');
    }

    // Check file extension
    const allowedMime = 'image/svg+xml';
    if (value.mimetype !== allowedMime) {
      throw new BadRequestException('Only SVG files are allowed.');
    }

    // Optional: check file extension as well
    if (!value.originalname.toLowerCase().endsWith('.svg')) {
      throw new BadRequestException('File extension must be .svg');
    }

    return value;
  }
}

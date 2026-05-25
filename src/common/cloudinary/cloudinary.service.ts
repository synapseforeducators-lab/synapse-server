import { BadRequestException, Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        resolve(result);
      });

      toStream(file.buffer).pipe(upload);
    });
  }

  async uploadImageToCloudinary(file: Express.Multer.File) {
    try {
      const res = await this.uploadImage(file);
      return res.secure_url; // ✅ return only the image URL
    } catch (e) {
      console.error('Cloudinary upload error:', e);
      throw new BadRequestException('Invalid file type.');
    }
  }

  async uploadMultipleImagesToCloudinary(files: Express.Multer.File[]) {
    if (!files || !files.length) {
      throw new BadRequestException('No files provided.');
    }

    try {
      const uploads = await Promise.all(
        files.map(async (file) => {
          const res = await this.uploadImage(file);
          return res.secure_url;
        }),
      );

      return uploads;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new BadRequestException('One or more files failed to upload.');
    }
  }
}

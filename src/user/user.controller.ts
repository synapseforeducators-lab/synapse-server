import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UsersService } from './user.service';
import { CurrentUser } from 'src/common/decorators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { UpdateNinDto } from './dto/verify-nin.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileSizeValidationPipe } from './pipes/profile-image.pipe';
import { memoryStorage } from 'multer';
import {
  UpdatePasswordDto,
  UpdateUserProfileDto,
} from './dto/update-user-details.dto';

@ApiTags('User')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  // @Post('/verify-nin')
  // async verifyNIN(
  //   @CurrentUser() user: User,
  //   @Body() updateNinDto: UpdateNinDto,
  // ) {
  //   // return await this.buyerService.verifyNIN(user, updateNinDto);
  // }

  @Post('update-profile')
  async UpdateUserProfile(
    @CurrentUser() user: User,
    @Body() UpdateUserProfileDto: UpdateUserProfileDto,
  ) {
    return await this.userService.updateUserProfile(user, UpdateUserProfileDto);
  }

  @Post('update-password')
  async UpdatePassword(
    @CurrentUser() user: User,
    @Body() UpdatePasswordDto: UpdatePasswordDto,
  ) {
    return await this.userService.updatePassword(user, UpdatePasswordDto);
  }

  @Post('update-profile-picture')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async updateProfilePicture(
    @CurrentUser() user: User,
    @UploadedFile(new FileSizeValidationPipe())
    file: Express.Multer.File,
  ) {
    return await this.userService.updateProfilePicture(user, file);
  }
}

import {
  Body,
  Controller,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UsersService } from './user.service';
import { CurrentUser } from 'src/common/decorators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileSizeValidationPipe } from './pipes/profile-image.pipe';
import { memoryStorage } from 'multer';
import {
  UpdatePasswordDto,
  UpdatePersonalProfileDto,
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
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    return await this.userService.updateUserProfile(user, updateUserProfileDto);
  }

  @Post('teach-profile')
  async ForTeacherOnly(
    @CurrentUser() user: User,
  ) {
    return await this.userService.teacherProfileOnly(user);
  }

  @Post('update-password')
  async UpdatePassword(
    @CurrentUser() user: User,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return await this.userService.updatePassword(user, updatePasswordDto);
  }

  @Put('update-personal-profile')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdatePersonalProfileDto })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async updateProfilePicture(
    @CurrentUser() user: User,
    @Body() updatePersonalProfileDto: UpdatePersonalProfileDto,
    @UploadedFile(new FileSizeValidationPipe())
    file?: Express.Multer.File,
  ) {
    return await this.userService.updatePersonalProfile(
      user,
      updatePersonalProfileDto,
      file,
    );
  }
}

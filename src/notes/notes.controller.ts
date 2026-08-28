import {
  BadRequestException,
  Delete,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators';
import { User } from 'src/user/entities/user.entity';
import { customResponse } from 'src/common/util';

@ApiTags('Notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.notesService.findAll(user);
  }

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() createNoteDto: CreateNoteDto,
  ) {
    const note = await this.notesService.create(user, createNoteDto);

    if (!note) {
      throw new BadRequestException('unable to create note');
    }

    return customResponse('Note created successfully', note);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.notesService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateNoteDto: UpdateNoteDto,
  ) {
    return this.notesService.update(id, user, updateNoteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.notesService.remove(id, user);
  }
}

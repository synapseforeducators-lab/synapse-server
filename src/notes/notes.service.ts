import { Injectable } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  create(createNoteDto: CreateNoteDto) {
    return createNoteDto;
  }

  findAll() {
    return `This action returns all notes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} note`;
  }

  update(id: number, updateNoteDto: UpdateNoteDto) {
    return {updateNoteDto, id};
  }

  remove(id: number) {
    return `This action removes a #${id} note`;
  }
}

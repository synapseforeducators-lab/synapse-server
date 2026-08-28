import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common';
import { Note } from './entities/note.entity';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { NotesRepository } from './repositories/notes.repository';

@Module({
  imports: [DatabaseModule.forFeature([Note])],
  controllers: [NotesController],
  providers: [NotesService, NotesRepository],
})
export class NotesModule {}

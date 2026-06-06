import { AbstractEntity } from 'src/common';

export class Note extends AbstractEntity<Note> {
  schechemeOfWorkId: string;

  schemeOfWorkSectionId: string;
}

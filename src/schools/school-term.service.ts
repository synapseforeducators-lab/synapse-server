import { BadRequestException, Injectable } from '@nestjs/common';
import { TermRepository } from './repository/school-terms.repository';
import { CreateTermDto } from './dto/create-term.dto';
import { Term } from './entities/school-term.entity';
import { UpdateTermDto } from './dto/update-term.dto';

@Injectable()
export class TermsService {
  constructor(private readonly termRepository: TermRepository) {}
  async create(createTermDto: CreateTermDto) {
    const newTerm = new Term({ name: createTermDto.term });

    const termRes = await this.termRepository.create(newTerm);

    if (!termRes) {
      throw new BadRequestException(
        'Unable to create term at the moment, try again later',
      );
    }

    return termRes;
  }

  async getAllTerms() {
    const termRes = await this.termRepository.findAndSelect({}, ['id', 'name']);

    if (!termRes) {
      throw new BadRequestException(
        'Unable to get term at the moment, try again later',
      );
    }

    return termRes;
  }

  async findOne(id: string) {
    const termRes = await this.termRepository.findAndSelect(
      { id: id, is_archived: false },
      ['id', 'name'],
    );

    if (!termRes) {
      throw new BadRequestException(
        'Unable to get term at the moment, try again later',
      );
    }

    return termRes;
  }

  async update(updateTermDto: UpdateTermDto) {
    const termRes = await this.termRepository.findOneAndUpdate(
      { id: updateTermDto.id },
      updateTermDto,
    );

    if (!termRes) {
      throw new BadRequestException(
        'Unable to get term at the moment, try again later',
      );
    }

    return termRes;
  }

  async remove(id: string) {
    const termRes = await this.termRepository.findOneAndUpdate(
      { id: id },
      { is_archived: true },
    );

    if (!termRes) {
      throw new BadRequestException(
        'Unable to get term at the moment, try again later',
      );
    }

    return termRes;
  }
}

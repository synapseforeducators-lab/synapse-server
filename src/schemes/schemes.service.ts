import { Injectable } from '@nestjs/common';
import { CreateSchemeDto } from './dto/create-scheme.dto';
import { UpdateSchemeDto } from './dto/update-scheme.dto';

@Injectable()
export class SchemesService {
  create(createSchemeDto: CreateSchemeDto) {
    return 'This action adds a new scheme';
  }

  findAll() {
    return `This action returns all schemes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} scheme`;
  }

  update(id: number, updateSchemeDto: UpdateSchemeDto) {
    return `This action updates a #${id} scheme`;
  }

  remove(id: number) {
    return `This action removes a #${id} scheme`;
  }
}

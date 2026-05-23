import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SchemesService } from './schemes.service';
import { CreateSchemeDto } from './dto/create-scheme.dto';
import { UpdateSchemeDto } from './dto/update-scheme.dto';

@Controller('schemes')
export class SchemesController {
  constructor(private readonly schemesService: SchemesService) {}

  @Post()
  create(@Body() createSchemeDto: CreateSchemeDto) {
    return this.schemesService.create(createSchemeDto);
  }

  @Get()
  findAll() {
    return this.schemesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schemesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSchemeDto: UpdateSchemeDto) {
    return this.schemesService.update(+id, updateSchemeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schemesService.remove(+id);
  }
}

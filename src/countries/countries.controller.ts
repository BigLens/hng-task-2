import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Res,
  HttpStatus,
  NotFoundException,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { Response } from 'express';
import { CountriesService } from './countries.service';
import { QueryCountriesDto } from './dto/query-countries.dto';
import * as fs from 'fs';
import { ImageGenerationService } from './services/image-generation.service';

@Controller('countries')
export class CountriesController {
  constructor(
    private readonly countriesService: CountriesService,
    private readonly imageGenerationService: ImageGenerationService,
  ) {}

  @Post('refresh')
  async refresh() {
    return await this.countriesService.refreshCountries();
  }

  @Get('status')
  async getStatus() {
    return await this.countriesService.getStatus();
  }

  @Get('image')
  async getImage(@Res() res: Response) {
    const imagePath = this.imageGenerationService.getImagePath();

    if (!fs.existsSync(imagePath)) {
      return res.status(HttpStatus.NOT_FOUND).json({
        error: 'Summary image not found',
      });
    }

    return res.sendFile(imagePath);
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() query: QueryCountriesDto) {
    return await this.countriesService.findAll(query);
  }

  @Get(':name')
  async findOne(@Param('name') name: string) {
    return await this.countriesService.findOne(name);
  }

  @Delete(':name')
  async remove(@Param('name') name: string) {
    return await this.countriesService.remove(name);
  }
}

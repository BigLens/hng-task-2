import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CountriesController } from './countries.controller';
import { CountriesService } from './countries.service';
import { Country } from './entities/country.entity';
import { ExternalApiService } from './services/external-api.service';
import { ImageGenerationService } from './services/image-generation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Country]),
    HttpModule,
  ],
  controllers: [CountriesController],
  providers: [CountriesService, ExternalApiService, ImageGenerationService],
})
export class CountriesModule {}

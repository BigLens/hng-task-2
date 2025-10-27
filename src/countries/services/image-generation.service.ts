import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from '../entities/country.entity';
import * as Jimp from 'jimp';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ImageGenerationService {
  private readonly IMAGE_PATH = path.join(process.cwd(), 'cache', 'summary.png');

  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
  ) {}

  async generateSummaryImage(): Promise<void> {
    const cacheDir = path.join(process.cwd(), 'cache');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const totalCountries = await this.countryRepository.count();
    const topCountries = await this.countryRepository
      .createQueryBuilder('country')
      .orderBy('country.estimated_gdp', 'DESC')
      .limit(5)
      .getMany();

    const lastRefreshed = await this.countryRepository
      .createQueryBuilder('country')
      .select('MAX(country.last_refreshed_at)', 'max')
      .getRawOne();

    const image = new Jimp(800, 600, '#ffffff');
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    const smallFont = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);

    let yPosition = 50;

    image.print(font, 50, yPosition, `Total Countries: ${totalCountries}`);
    yPosition += 80;

    image.print(font, 50, yPosition, 'Top 5 Countries by GDP:');
    yPosition += 60;

    topCountries.forEach((country, index) => {
      const gdpValue = country.estimated_gdp
        ? `$${Number(country.estimated_gdp).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : 'N/A';
      const text = `${index + 1}. ${country.name} - ${gdpValue}`;
      image.print(smallFont, 70, yPosition, text);
      yPosition += 40;
    });

    yPosition += 40;
    const refreshTime = lastRefreshed?.max
      ? new Date(lastRefreshed.max).toISOString()
      : 'N/A';
    image.print(smallFont, 50, yPosition, `Last Refreshed: ${refreshTime}`);

    await image.writeAsync(this.IMAGE_PATH);
  }

  getImagePath(): string {
    return this.IMAGE_PATH;
  }
}

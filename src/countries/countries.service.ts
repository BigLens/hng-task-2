import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity';
import { ExternalApiService } from './services/external-api.service';
import { ImageGenerationService } from './services/image-generation.service';
import { QueryCountriesDto } from './dto/query-countries.dto';

@Injectable()
export class CountriesService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    private readonly externalApiService: ExternalApiService,
    private readonly imageGenerationService: ImageGenerationService,
  ) {}

  async refreshCountries(): Promise<{ message: string; count: number }> {
    const [countriesData, exchangeRates] = await Promise.all([
      this.externalApiService.fetchCountries(),
      this.externalApiService.fetchExchangeRates(),
    ]);

    let savedCount = 0;

    for (const countryData of countriesData) {
      const currencyCode =
        countryData.currencies && countryData.currencies.length > 0
          ? countryData.currencies[0].code
          : null;

      let exchangeRate = null;
      let estimatedGdp = null;

      if (currencyCode && exchangeRates[currencyCode]) {
        exchangeRate = exchangeRates[currencyCode];
        const randomMultiplier = Math.random() * (2000 - 1000) + 1000;
        estimatedGdp =
          (countryData.population * randomMultiplier) / exchangeRate;
      } else if (currencyCode) {
        exchangeRate = null;
        estimatedGdp = null;
      } else {
        estimatedGdp = 0;
      }

      const existingCountry = await this.countryRepository
        .createQueryBuilder('country')
        .where('LOWER(country.name) = LOWER(:name)', { name: countryData.name })
        .getOne();

      const countryPayload = {
        name: countryData.name,
        capital: countryData.capital || null,
        region: countryData.region || null,
        population: countryData.population,
        currency_code: currencyCode,
        exchange_rate: exchangeRate,
        estimated_gdp: estimatedGdp,
        flag_url: countryData.flag || null,
        last_refreshed_at: new Date(),
      };

      if (existingCountry) {
        await this.countryRepository.update(existingCountry.id, countryPayload);
      } else {
        await this.countryRepository.save(countryPayload);
      }

      savedCount++;
    }

    await this.imageGenerationService.generateSummaryImage();

    return { message: 'Countries refreshed successfully', count: savedCount };
  }

  async findAll(query: QueryCountriesDto): Promise<Country[]> {
    const queryBuilder = this.countryRepository.createQueryBuilder('country');

    if (query.region) {
      queryBuilder.andWhere('LOWER(country.region) = LOWER(:region)', {
        region: query.region,
      });
    }

    if (query.currency) {
      queryBuilder.andWhere('LOWER(country.currency_code) = LOWER(:currency)', {
        currency: query.currency,
      });
    }

    if (query.sort) {
      // Handle sorting with defaults
      let field: string;
      let direction: 'ASC' | 'DESC';

      if (query.sort === 'gdp' || query.sort === 'gdp_desc') {
        field = 'gdp';
        direction = 'DESC'; // Default to descending
      } else if (query.sort === 'gdp_asc') {
        field = 'gdp';
        direction = 'ASC';
      } else if (
        query.sort === 'population' ||
        query.sort === 'population_desc'
      ) {
        field = 'population';
        direction = 'DESC';
      } else if (query.sort === 'population_asc') {
        field = 'population';
        direction = 'ASC';
      } else if (query.sort === 'name' || query.sort === 'name_asc') {
        field = 'name';
        direction = 'ASC';
      } else if (query.sort === 'name_desc') {
        field = 'name';
        direction = 'DESC';
      }

      if (field === 'gdp') {
        queryBuilder.orderBy('country.estimated_gdp', direction);
      } else if (field === 'population') {
        queryBuilder.orderBy('country.population', direction);
      } else if (field === 'name') {
        queryBuilder.orderBy('country.name', direction);
      }
    }

    return await queryBuilder.getMany();
  }

  async findOne(name: string): Promise<Country> {
    const country = await this.countryRepository.findOne({
      where: { name },
    });

    if (!country) {
      throw new NotFoundException({ error: 'Country not found' });
    }

    return country;
  }

  async remove(name: string): Promise<{ message: string }> {
    const country = await this.findOne(name);
    await this.countryRepository.remove(country);
    return { message: 'Country deleted successfully' };
  }

  async getStatus(): Promise<{
    total_countries: number;
    last_refreshed_at: Date | null;
  }> {
    const totalCountries = await this.countryRepository.count();
    const lastRefreshed = await this.countryRepository
      .createQueryBuilder('country')
      .select('MAX(country.last_refreshed_at)', 'max')
      .getRawOne();

    return {
      total_countries: totalCountries,
      last_refreshed_at: lastRefreshed?.max || null,
    };
  }
}

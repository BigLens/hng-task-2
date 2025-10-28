import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class ExternalApiService {
  private readonly COUNTRIES_API =
    'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies';
  private readonly EXCHANGE_RATE_API = 'https://open.er-api.com/v6/latest/USD';

  constructor(private readonly httpService: HttpService) {}

  async fetchCountries(): Promise<any[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(this.COUNTRIES_API).pipe(timeout(15000)), // 15 second timeout
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        {
          error: 'External data source unavailable',
          details: 'Could not fetch data from Countries API',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async fetchExchangeRates(): Promise<{ [key: string]: number }> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(this.EXCHANGE_RATE_API).pipe(timeout(15000)), // 15 second timeout
      );
      return response.data.rates;
    } catch (error) {
      throw new HttpException(
        {
          error: 'External data source unavailable',
          details: 'Could not fetch data from Exchange Rate API',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}

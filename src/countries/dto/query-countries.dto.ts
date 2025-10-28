import { IsOptional, IsString, IsIn } from 'class-validator';

export class QueryCountriesDto {
  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsIn([
    'gdp',
    'gdp_asc',
    'gdp_desc',
    'population',
    'population_asc',
    'population_desc',
    'name',
    'name_asc',
    'name_desc',
  ])
  sort?: string;
}

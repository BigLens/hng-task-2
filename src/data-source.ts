import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: (process.env.MYSQLHOST || process.env.DB_HOST || 'localhost'),
  port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306'),
  username: (process.env.MYSQLUSER || process.env.DB_USERNAME || 'root'),
  password: (process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || ''),
  database: (process.env.MYSQLDATABASE || process.env.DB_DATABASE || 'countries_api'),
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});

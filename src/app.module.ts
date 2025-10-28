import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CountriesModule } from './countries/countries.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql' as const,
        host:
          configService.get<string>('MYSQLHOST') ||
          configService.get<string>('DB_HOST') ||
          'localhost',
        port: parseInt(
          configService.get<string>('MYSQLPORT') ||
            configService.get<string>('DB_PORT') ||
            '3306',
        ),
        username:
          configService.get<string>('MYSQLUSER') ||
          configService.get<string>('DB_USERNAME') ||
          'root',
        password:
          configService.get<string>('MYSQLPASSWORD') ||
          configService.get<string>('DB_PASSWORD') ||
          '',
        database:
          configService.get<string>('MYSQLDATABASE') ||
          configService.get<string>('DB_DATABASE') ||
          'countries_api',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
        migrationsRun: true,
      }),
    }),
    CountriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class InitialMigration1730000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'countries',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'capital',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'region',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'population',
            type: 'bigint',
          },
          {
            name: 'currency_code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'exchange_rate',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'estimated_gdp',
            type: 'decimal',
            precision: 20,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'flag_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'last_refreshed_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('countries');
  }
}

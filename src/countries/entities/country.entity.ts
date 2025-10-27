import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  capital: string;

  @Column({ nullable: true })
  region: string;

  @Column({ type: 'bigint' })
  population: number;

  @Column({ nullable: true })
  currency_code: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  exchange_rate: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true })
  estimated_gdp: number;

  @Column({ nullable: true })
  flag_url: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  last_refreshed_at: Date;
}

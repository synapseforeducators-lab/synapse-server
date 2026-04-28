import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';

config();

const configService = new ConfigService();
export default new DataSource({
  type: 'postgres',
  host: configService.getOrThrow('DB_HOST'),
  port: configService.getOrThrow('DB_PORT'),
  database: configService.getOrThrow('DB_NAME'),
  username: configService.getOrThrow('DB_USER'),
  password: configService.getOrThrow('DB_PASS'),

  ssl: {
    rejectUnauthorized: false,
  },
  synchronize: configService.getOrThrow('DB_SYNCHRONIZE'),
  entities: [join(__dirname, '**', 'entities', '*.entity.{ts,js}')],
  migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
});

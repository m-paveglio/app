import { DataSource } from 'typeorm';
import { CNAE } from './entities/cnae.entity';



export const CnaeProviders = [
  {
    provide: 'CNAE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(CNAE),
    inject: ['DATA_SOURCE'],
  },
];
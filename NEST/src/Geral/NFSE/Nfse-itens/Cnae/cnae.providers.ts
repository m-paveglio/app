import { DataSource } from 'typeorm';
import { Cnae } from './entities/cnae.entity';


export const CnaeProviders = [
  {
    provide: 'CNAE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Cnae),
    inject: ['DATA_SOURCE'],
  },
];
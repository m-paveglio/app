import { DataSource } from 'typeorm';
import { NFSE } from './nfse.entity';


export const NFSEProviders = [
  {
    provide: 'NFSE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(NFSE),
    inject: ['DATA_SOURCE'],
  },
];
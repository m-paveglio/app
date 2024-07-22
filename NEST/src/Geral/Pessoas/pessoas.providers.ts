import { DataSource } from 'typeorm';
import { pessoas } from './pessoas.entity';

export const pessoasProviders = [
  {
    provide: 'PESSOAS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(pessoas),
    inject: ['DATA_SOURCE'],
  },
];
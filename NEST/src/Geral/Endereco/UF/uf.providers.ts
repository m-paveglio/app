import { DataSource } from 'typeorm';
import { UfEntity } from './entities/uf.entity';


export const ufProviders = [
  {
    provide: 'UF_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(UfEntity),
    inject: ['DATA_SOURCE'],
  },
];
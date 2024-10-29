import { DataSource } from 'typeorm';
import { PaisEntity } from './entities/pai.entity';


export const paisProviders = [
  {
    provide: 'PAIS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(PaisEntity),
    inject: ['DATA_SOURCE'],
  },
];
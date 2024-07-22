import { DataSource } from 'typeorm';
import { Logradouro } from './entities/logradouro.entity';


export const logradouroProviders = [
  {
    provide: 'LOGRADOURO_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Logradouro),
    inject: ['DATA_SOURCE'],
  },
];
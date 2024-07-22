import { DataSource } from 'typeorm';
import { Cidades } from './entities/cidade.entity';


export const cidadesProviders = [
  {
    provide: 'CIDADES_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Cidades),
    inject: ['DATA_SOURCE'],
  },
];
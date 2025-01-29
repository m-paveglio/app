import { DataSource } from 'typeorm';
import { Comandas } from './entities/comanda.entity';



export const ComandasProviders = [
  {
    provide: 'COMANDAS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Comandas),
    inject: ['DATA_SOURCE'],
  },
];
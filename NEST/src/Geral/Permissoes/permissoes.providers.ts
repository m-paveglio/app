import { DataSource } from 'typeorm';
import { Permissoes } from './entities/permissoes.entity';


export const PermissoesProviders = [
  {
    provide: 'PERMISSOES_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Permissoes),
    inject: ['DATA_SOURCE'],
  },
];
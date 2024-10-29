import { DataSource } from 'typeorm';
import { Profissoes } from './entities/profissoes.entity';



export const ProfissoesProviders = [
  {
    provide: 'PROFISSOES_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Profissoes),
    inject: ['DATA_SOURCE'],
  },
];
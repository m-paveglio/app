import { DataSource } from 'typeorm';
import { Servicos } from './entities/servico.entity';



export const ServicosProviders = [
  {
    provide: 'SERVICOS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Servicos),
    inject: ['DATA_SOURCE'],
  },
];
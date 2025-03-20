import { DataSource } from 'typeorm';
import { ComandasXServicos } from './entities/comandaXservico.entity';



export const ComandasXServicoProviders = [
  {
    provide: 'COMANDASSERVICOS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ComandasXServicos),
    inject: ['DATA_SOURCE'],
  },
];
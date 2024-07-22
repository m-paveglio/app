import { DataSource } from 'typeorm';
import { Nbs } from './entities/nb.entity';


export const NbsProviders = [
  {
    provide: 'NBS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Nbs),
    inject: ['DATA_SOURCE'],
  },
];
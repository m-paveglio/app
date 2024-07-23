import { DataSource } from 'typeorm';
import { ITEM_LC_116 } from './entities/item_lc_116.entity';



export const ItemProviders = [
  {
    provide: 'ITEM_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ITEM_LC_116),
    inject: ['DATA_SOURCE'],
  },
];
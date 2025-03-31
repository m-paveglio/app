import { DataSource } from 'typeorm';
import { ItemLC } from './entities/itemLC.entity';



export const ItemLCProviders = [
  {
    provide: 'ITEMLC_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ItemLC),
    inject: ['DATA_SOURCE'],
  },
];
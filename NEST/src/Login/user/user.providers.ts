import { DataSource } from 'typeorm';
import { user } from '../user/user.entity';

export const userProviders = [
  {
    provide: 'USER_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(user),
    inject: ['DATA_SOURCE'],
  },
];
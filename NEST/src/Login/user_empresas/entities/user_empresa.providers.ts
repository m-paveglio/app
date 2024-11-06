import { DataSource } from 'typeorm';
import { UserEmpresa } from './user_empresa.entity';

export const UserEmpresasProviders = [
  {
    provide: 'USER_EMPRESAS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(UserEmpresa),
    inject: ['DATA_SOURCE'],
  },
];
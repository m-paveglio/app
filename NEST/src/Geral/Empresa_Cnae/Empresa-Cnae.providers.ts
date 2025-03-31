import { DataSource } from 'typeorm';
import { Empresa_CNAE } from './entities/Empresa-Cnae.entity';



export const EmpresaCnaeProviders = [
  {
    provide: 'EMPRESACNAE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Empresa_CNAE),
    inject: ['DATA_SOURCE'],
  },
];
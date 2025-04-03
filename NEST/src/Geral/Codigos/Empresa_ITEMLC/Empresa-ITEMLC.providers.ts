import { DataSource } from 'typeorm';
import { Empresa_ITEMLC } from './entities/Empresa-ITEMLC.entity';



export const EmpresaITEMLCProviders = [
  {
    provide: 'EMPRESAITEMLC_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Empresa_ITEMLC),
    inject: ['DATA_SOURCE'],
  },
];
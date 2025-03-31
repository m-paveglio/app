import { DataSource } from 'typeorm';
import { CodigoTributacaoMunicipio } from './entities/CodigoTributacaoMunicipio.entity';



export const CodigoTributacaoMunicipioProviders = [
  {
    provide: 'CODIGOTRIBUTACAOMUNICIPIO_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(CodigoTributacaoMunicipio),
    inject: ['DATA_SOURCE'],
  },
];
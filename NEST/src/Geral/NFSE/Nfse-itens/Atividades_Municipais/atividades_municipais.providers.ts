import { DataSource } from 'typeorm';
import { ATIVIDADES } from './entities/atividades_municipais.entity';

export const AtividadesMunicipaisProviders = [
  {
    provide: 'ATIVIDADES_MUNICIPAIS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ATIVIDADES),
    inject: ['DATA_SOURCE'],
  },
];
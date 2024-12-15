import { DataSource } from 'typeorm';
import { Webservice } from './entities/webservice.entity';


export const webserviceProviders = [
  {
    provide: 'WEBSERVICE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Webservice),
    inject: ['DATA_SOURCE'],
  },
];
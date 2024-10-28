import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'sqlite',
        database: 'database.sqlite', // Caminho para o arquivo do SQLite
        entities: [
          __dirname + '/../**/*.entity{.ts,.js}',
        ],
        synchronize: false, // Em desenvolvimento, true para sincronizar o schema
      });

      return dataSource.initialize();
    },
  },
];
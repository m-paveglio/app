import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: 'mysql.railway.internal',
        port: 3306,
        username: 'root', // Alterado para 'root' conforme as credenciais fornecidas
        password: 'UjbaHHhVKbzuEWYqauWhsZmAblJHbcfD', // Alterado para a senha fornecida
        database: 'railway',
        entities: [
          __dirname + '/../**/*.entity{.ts,.js}',
        ],
        synchronize: true,
      });

      try {
        await dataSource.connect(); // Adjusted to connect()
        console.log("Conexão ao banco de dados MySQL estabelecida com sucesso!");
      } catch (error) {
        console.error("Erro ao conectar ao banco de dados MySQL:", error);
      }

      return dataSource;
    },
  },
];

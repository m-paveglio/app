import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Obter ConfigService para acessar variáveis de ambiente
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const corsOrigin = configService.get<string>('CORS_ORIGIN', '*');

  // ==========================================
  // SEGURANÇA
  // ==========================================
  
  // Helmet: Adiciona headers de segurança HTTP
  app.use(helmet({
    contentSecurityPolicy: nodeEnv === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: nodeEnv === 'production' ? undefined : false,
  }));

  // CORS: Configuração segura
 app.enableCors({
  origin: corsOrigin?.split(',') || ['http://localhost:4200'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 3600,
});

  // ==========================================
  // VALIDAÇÃO GLOBAL
  // ==========================================
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades não definidas no DTO
      forbidNonWhitelisted: true, // Retorna erro se houver propriedades extras
      transform: true, // Transforma automaticamente tipos primitivos
      transformOptions: {
        enableImplicitConversion: true, // Converte tipos automaticamente
      },
      disableErrorMessages: nodeEnv === 'production', // Oculta detalhes em produção
    }),
  );

  // ==========================================
  // SWAGGER DOCUMENTATION
  // ==========================================
  
  // Só ativa Swagger em desenvolvimento ou se explicitamente configurado
  const swaggerEnabled = configService.get<boolean>('SWAGGER_ENABLED', nodeEnv !== 'production');
  
  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('API de Autenticação')
      .setDescription('Sistema de autenticação e gerenciamento de usuários')
      .setVersion('1.0')
      .addTag('auth', 'Endpoints de autenticação')
      .addTag('users', 'Gerenciamento de usuários')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Insira o token JWT',
          in: 'header',
        },
        'JWT-auth', // Nome da security scheme
      )
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'API Documentation',
      customCss: '.swagger-ui .topbar { display: none }',
      swaggerOptions: {
        persistAuthorization: true, // Mantém token após refresh
        docExpansion: 'none', // Começa com endpoints fechados
        filter: true, // Habilita busca
        tryItOutEnabled: true,
      },
    });
    
    logger.log(`📚 Swagger disponível em: http://localhost:${port}/api/docs`);
  }

  // ==========================================
  // CONFIGURAÇÕES DE PRODUÇÃO
  // ==========================================
  
  if (nodeEnv === 'production') {
    // Graceful shutdown
    app.enableShutdownHooks();
    
    // Desabilita logs detalhados
    logger.log('🔒 Modo de produção ativado');
  } else {
    logger.log('🔧 Modo de desenvolvimento ativado');
  }

  // ==========================================
  // INICIAR SERVIDOR
  // ==========================================
  
  await app.listen(port);
  
  logger.log('='.repeat(50));
  logger.log(`🚀 Aplicação iniciada com sucesso!`);
  logger.log(`📡 Servidor rodando em: http://localhost:${port}`);
  logger.log(`🌍 Ambiente: ${nodeEnv}`);
  logger.log(`🔐 CORS configurado para: ${corsOrigin}`);
  logger.log('='.repeat(50));
}

// Capturar erros não tratados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

bootstrap();
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { userModule } from './Login/user/user.module';
import { AuthModule } from './Login/auth/auth.module';
import { PermissoesModule } from './Geral/Permissoes/permissoes.module';
import { UfModule } from './Geral/Endereco/UF/uf.module';
import { PaisModule } from './Geral/Endereco/Pais/pais.module';
import { CidadesModule } from './Geral/Endereco/Cidades/cidades.module';
import { LogradouroModule } from './Geral/Endereco/Logradouro/logradouro.module';
import { ProfissoesModule } from './Geral/Profissoes/profissoes.module';
import { pessoasModule } from './Geral/Pessoas/pessoas.module';
import { EmpresasModule } from './Login/empresas/empresas.module';
import { UserEmpresasProviders } from './Login/user_empresas/entities/user_empresa.providers';
import { UserEmpresasModule } from './Login/user_empresas/user_empresas.module';



@Module({
  imports: [userModule, AuthModule, UserEmpresasModule, pessoasModule,PermissoesModule, UfModule, PaisModule, CidadesModule, LogradouroModule, ProfissoesModule, EmpresasModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

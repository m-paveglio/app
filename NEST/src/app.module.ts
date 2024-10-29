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



@Module({
  imports: [userModule, AuthModule, pessoasModule,PermissoesModule, UfModule, PaisModule, CidadesModule, LogradouroModule, ProfissoesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

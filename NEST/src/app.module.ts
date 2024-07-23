import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { userModule } from './Login/user/user.module';
import { AuthModule } from './Login/auth/auth.module';
import { PermissoesModule } from './Geral/Outros/Permissoes/permissoes.module';
import { UfModule } from './Geral/Outros/Endereco/UF/uf.module';
import { PaisModule } from './Geral/Outros/Endereco/Pais/pais.module';
import { CidadesModule } from './Geral/Outros/Endereco/Cidades/cidades.module';
import { LogradouroModule } from './Geral/Outros/Endereco/Logradouro/logradouro.module';
import { ProfissoesModule } from './Geral/Outros/Profissoes/profissoes.module';
import { ItemLc116Module } from './Geral/NFS-E/Nfse-itens/Item_LC_116/item_lc_116.module';
import { CnaeModule } from './Geral/NFS-E/Nfse-itens/Cnae/cnae.module';
import { AtividadesMunicipaisModule } from './Geral/NFS-E//Nfse-itens/Atividades_Municipais/atividades_municipais.module';
import { NbsModule } from './Geral/NFS-E/Nfse-itens/nbs/nbs.module';
import { pessoasModule } from './Geral/Pessoas/pessoas.module';
import { nfseModule } from './Geral/NFS-E/nfse/nfse.module';


@Module({
  imports: [userModule, AuthModule, nfseModule, pessoasModule,PermissoesModule, UfModule, PaisModule, CidadesModule, LogradouroModule, ProfissoesModule, ItemLc116Module, CnaeModule, AtividadesMunicipaisModule, NbsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

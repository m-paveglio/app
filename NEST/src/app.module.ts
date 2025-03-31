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
import { pessoasModule } from './Geral/Pessoas/pessoas.module';
import { EmpresasModule } from './Login/empresas/empresas.module';
import { UserEmpresasModule } from './Login/user_empresas/user_empresas.module';
import { WebserviceModule } from './Geral/Nota-Fiscal/Nfse/webservice/webservice.module';
import { ServicosModule } from './Geral/Servicos/servicos.module';
import { NfseModule } from './Geral/Nota-Fiscal/Nfse/nfse.module';
import { ComandasModule } from './Geral/Comanda/comanda.module';
import { ComandasXServicoModule } from './Geral/ComandaXservico/comandaXservico.module';
import { RpsModule } from './Geral/Nota-Fiscal/Nfse/RpsDisponivel/Rps.module';
import { CnaeModule } from './Geral/Codigos/CNAE/cnae.module';
import { ItemLCModule } from './Geral/Codigos/ITEM_LC/itemLC.module';
import { CodigoTributacaoMunicipioModule } from './Geral/Codigos/CodigoTributacaoMunicipio/CodigoTributacaoMunicipio.module';
import { EmpresaCnaeModule } from './Geral/Empresa_Cnae/Empresa-Cnae.module';

 

@Module({
  imports: [userModule, 
    AuthModule, 
    UserEmpresasModule, 
    pessoasModule,
    PermissoesModule,
    UfModule, 
    PaisModule, 
    CidadesModule, 
    LogradouroModule,
    EmpresasModule,
    WebserviceModule,
    ServicosModule,
    NfseModule,
    ComandasModule,
    ComandasXServicoModule,
    RpsModule,
    CnaeModule,
    ItemLCModule,
    CodigoTributacaoMunicipioModule,
    EmpresaCnaeModule

    ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

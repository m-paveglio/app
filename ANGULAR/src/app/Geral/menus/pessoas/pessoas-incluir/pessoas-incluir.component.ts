import { Component } from '@angular/core';
import { UserService } from '../pessoas.service';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-user-incluir',
  templateUrl: './user-incluir.component.html'
})

export class UserIncluirComponent {

    mask: String = '';
    resultado: any;
    novoUsuario: any = {};
    mensagem: any;
    exibirMensagem: boolean = false;

    permissoes = [
      {nome: 'Administrador', codigo: '1'},
      {nome: 'Suporte', codigo: '2'},
      {nome: 'Contador', codigo: '3'},
      {nome: 'Diretor', codigo: '4'},
      {nome: 'Gerente', codigo: '5'},
      {nome: 'Procurador', codigo: '6'},
      {nome: 'Auxiliar Administrativo', codigo: '7'},
      {nome: 'Auxiliar Contábil', codigo: '8'},
      {nome: 'Atendente', codigo: '9'},
      {nome: 'Estagiário', codigo: '10'}
    ];

    profissoes = [
      {nome: 'Não Informada', codigo: '0'},
{nome: 'Importação', codigo: '1'},
{nome: 'Administrador', codigo: '2'},
{nome: 'Advogado', codigo: '3'},
{nome: 'Analista de Sistemas', codigo: '4'},
{nome: 'Arquiteto', codigo: '5'},
{nome: 'Artesão', codigo: '6'},
{nome: 'Assistente Social', codigo: '7'},
{nome: 'Biólogo', codigo: '8'},
{nome: 'Cabelereiro', codigo: '9'},
{nome: 'Contador', codigo: '10'},
{nome: 'Corretor de Imóveis', codigo: '11'},
{nome: 'Corretor de Seguros', codigo: '12'},
{nome: 'Dentista', codigo: '13'},
{nome: 'Despachante', codigo: '14'},
{nome: 'Economista', codigo: '15'},
{nome: 'Enfermeiro', codigo: '16'},
{nome: 'Engenheiro Agrimensor', codigo: '17'},
{nome: 'Engenheiro Agrônomo', codigo: '18'},
{nome: 'Engenheiro Civil', codigo: '19'},
{nome: 'Engenheiro de Computação', codigo: '20'},
{nome: 'Engenheiro de Telecomunicações', codigo: '21'},
{nome: 'Engenheiro Mecatrônico', codigo: '22'},
{nome: 'Engenheiro Quimico', codigo: '23'},
{nome: 'Farmacêutico Bioquímico', codigo: '24'},
{nome: 'Fisioterapeuta', codigo: '25'},
{nome: 'Fonoaudiólogo', codigo: '26'},
{nome: 'Fotógrafo', codigo: '27'},
{nome: 'Geógrafo', codigo: '28'},
{nome: 'Guia de Turismo', codigo: '29'},
{nome: 'Jornalista', codigo: '30'},
{nome: 'Leiloeiro', codigo: '31'},
{nome: 'Médico', codigo: '32'},
{nome: 'Nutricionista', codigo: '33'},
{nome: 'Optometrista', codigo: '34'},
{nome: 'Pescador', codigo: '35'},
{nome: 'Piloto Comercial', codigo: '36'},
{nome: 'Professor', codigo: '37'},
{nome: 'Programador de Sistema', codigo: '38'},
{nome: 'Protético', codigo: '39'},
{nome: 'Psicanalista', codigo: '40'},
{nome: 'Psicólogo Clínico', codigo: '41'},
{nome: 'Químico', codigo: '42'},
{nome: 'Representante Comercial Autônomo', codigo: '43'},
{nome: 'Tecnólogo', codigo: '44'},
{nome: 'Terapeuta Ocupacional', codigo: '45'},
{nome: 'Topógrafo', codigo: '46'},
{nome: 'Veterinário', codigo: '47'},
{nome: 'Zootecnista', codigo: '48'},
{nome: 'Técnico', codigo: '49'},
{nome: 'Técnico em Contabilidade', codigo: '50'},
    ];

    USER_SIS = [
      {nome: 'Ativo', codigo: '1'},
      {nome: 'Desativado', codigo: '0'}
    ]

      constructor(private userService: UserService) {}
     
      adicionarUsuario() {
        this.userService.adicionarUsuario(this.novoUsuario).subscribe(
          (data) => {
            this.resultado = data;
            this.novoUsuario = {};
            this.mensagem = 'Usuário cadastrado com sucesso'; // Adicione esta linha
            this.exibirMensagem = true;
            setTimeout(() => {
              this.exibirMensagem = false;
            }, 3000); // Faz a mensagem desaparecer após 3 segundos
          },
          (error) => {
            console.error('Erro ao adicionar usuário:', error);
            console.error('Detalhes do erro:', error.error);
            this.mensagem = 'Erro ao cadastrar usuário'; // Adicione esta linha
            this.exibirMensagem = true;
            setTimeout(() => {
              this.exibirMensagem = false;
            }, 3000); // Faz a mensagem desaparecer após 3 segundos
          }
        );
        }  


    }
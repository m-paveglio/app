import { Component, OnInit } from '@angular/core';
import { ComandasService } from '../comandas.service';
import { LoginService } from '../../../login/login.service';
import { MessageService } from 'primeng/api';
import { FormBuilder } from '@angular/forms';

interface Comanda {
  id: number;
  nome: string;
  data_fim?: string;
  servicos: Servico[];
  total: number;
}

interface Servico {
  id: number;
  nome: string;
  valor: number;
  qtd: number;
  total: number;
}

interface Usuario {
  id: number;
  nome: string;
  cpf: string;
}

@Component({
  selector: 'app-comandas-incluir',
  templateUrl: './comandas-incluir.component.html',
  styleUrls: ['./comandas-incluir.component.css'],
  providers: [MessageService],
})
export class ComandasIncluirComponent implements OnInit {
  comandas: Comanda[] = [];
  servicosDisponiveis: Servico[] = [];
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];

  dialogComanda = false;
  dialogServico = false;
  
  filtroUsuario = '';
  usuarioSelecionado: Usuario | null = null;
  novoContribuinte = '';

  comandaSelecionada!: Comanda;
  servicoSelecionado!: Servico;
  quantidadeServico = 1;

  constructor(
    private comandasService: ComandasService, // Nome corrigido
    private loginService: LoginService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.carregarComandas();
    this.carregarServicos();
    this.carregarUsuarios();
  }

  carregarComandas() {
    this.comandasService.getComandasAbertas().subscribe(
      (comandas: Comanda[]) => (this.comandas = comandas),
      (error: any) => console.error('Erro ao carregar comandas:', error)
    );
  }

  carregarServicos() {
    this.comandasService.getServicos().subscribe(
      (servicos: Servico[]) => (this.servicosDisponiveis = servicos),
      (error: any) => console.error('Erro ao carregar serviços:', error)
    );
  }

  carregarUsuarios() {
    this.comandasService.getUsuarios().subscribe(
      (usuarios: Usuario[]) => {
        this.usuarios = usuarios;
        this.usuariosFiltrados = usuarios;
      },
      (error: any) => console.error('Erro ao carregar usuários:', error)
    );
  }

  filtrarUsuarios() {
    this.usuariosFiltrados = this.usuarios.filter(u =>
      u.nome.toLowerCase().includes(this.filtroUsuario.toLowerCase()) ||
      u.cpf.includes(this.filtroUsuario)
    );
  }

  openDialog() {
    this.dialogComanda = true;
    this.filtroUsuario = '';
    this.usuariosFiltrados = this.usuarios;
  }

  selecionarUsuario(usuario: Usuario) {
    this.usuarioSelecionado = usuario;
    this.novoContribuinte = usuario.nome;
  }

  adicionarComanda() {
    if (!this.novoContribuinte.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Insira um nome ou selecione um usuário!' });
      return;
    }

    const novaComanda: Comanda = {
      id: new Date().getTime(),
      nome: this.novoContribuinte,
      servicos: [],
      total: 0
    };

    this.comandasService.adicionarComanda(novaComanda).subscribe(
      (comandaCriada: Comanda) => {
        this.comandas.push(comandaCriada);
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Comanda criada com sucesso!' });

        this.dialogComanda = false;
        this.novoContribuinte = '';
        this.usuarioSelecionado = null;

        this.openServicoDialog(comandaCriada);
      },
      (error: any) => console.error('Erro ao criar comanda:', error)
    );
  }

  openServicoDialog(comanda: Comanda) {
    this.comandaSelecionada = comanda;
    this.dialogServico = true;
  }

  adicionarServico() {
    if (!this.servicoSelecionado) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Selecione um serviço!' });
      return;
    }

    const servico = { 
      ...this.servicoSelecionado, 
      qtd: this.quantidadeServico, 
      total: this.servicoSelecionado.valor * this.quantidadeServico 
    };

    this.comandaSelecionada.servicos.push(servico);
    this.calcularTotal(this.comandaSelecionada);

    this.dialogServico = false;
    this.salvarComandas();
  }

  calcularTotal(comanda: Comanda) {
    comanda.total = comanda.servicos.reduce((sum, s) => sum + s.total, 0);
    this.salvarComandas();
  }

  removerServico(comanda: Comanda, servico: Servico) {
    comanda.servicos = comanda.servicos.filter(s => s !== servico);
    this.calcularTotal(comanda);
  }

  salvarComandas() {
    this.comandasService.atualizarComandas(this.comandas).subscribe(
      () => this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Comanda atualizada!' }),
      (error: any) => console.error('Erro ao atualizar comandas:', error)
    );
  }
}

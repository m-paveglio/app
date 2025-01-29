import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';


@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];

    constructor(public layoutService: LayoutService) { }

    ngOnInit() {
        this.model = [
            {
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/dashboard'] }
                ]
            },
            {
                label: 'Menus Admin',
                items: [
                    { label: 'Usuários', icon: 'pi pi-fw pi-users', items: [
                        {
                            label: 'Incluir',
                            icon: 'pi pi-fw pi-user-plus',
                            routerLink: ['user/incluir']
                        },
                        {
                            label: 'Consultar',
                            icon: 'pi pi-fw pi-search',
                            routerLink: ['user/consultar']
                        },
                        ],
                     },  

                     { label: 'Empresas', icon: 'pi pi-fw pi-building', items: [
                        {
                            label: 'Incluir',
                            icon: 'pi pi-fw pi-plus',
                            routerLink: ['empresas/incluir']
                        },
                        {
                            label: 'Consultar',
                            icon: 'pi pi-fw pi-search',
                            routerLink: ['empresas/consultar']
                        },
                        ],
                     },  

                     { label: 'Nota Eletrônica', icon: 'pi pi-fw pi-dollar', items: [
                        {
                            label: 'Nova Nota',
                            icon: 'pi pi-fw pi-file-export',
                            routerLink: ['nfse/gerar']
                        },
                        {
                            label: 'Consultar',
                            icon: 'pi pi-fw pi-search',
                            routerLink: ['user/consultar']
                        },
                        ],
                     },  

                     
                        ]
            },

            {
                label: 'Menus Contribuinte',
                items: [
                    { label: 'Serviços', icon: 'pi pi-fw pi-clipboard', items: [
                        {
                            label: 'Incluir',
                            icon: 'pi pi-fw pi-file-export',
                            routerLink: ['servicos/incluir']
                        },
                        {
                            label: 'Consultar',
                            icon: 'pi pi-fw pi-search',
                            routerLink: ['servicos/consultar']
                        },
                        ],
                     },  

                     { label: 'Clientes', icon: 'pi pi-fw pi-users', items: [
                        {
                            label: 'Incluir',
                            icon: 'pi pi-fw pi-user-plus',
                            routerLink: ['pessoas/incluir']
                        },
                        {
                            label: 'Consultar',
                            icon: 'pi pi-fw pi-search',
                            routerLink: ['pessoas/consultar']
                        },
                    ]},

                    { label: 'Comandas', icon: 'pi pi-fw pi-users', routerLink: 'comandas' }
                
                ]},

            /*{
                label: 'Tabelas',
                items: [
                          
                    { label: 'Endereço', icon: 'pi pi-fw pi-building', items: [
                                {
                                    label: 'Cidades',
                                    icon: 'pi pi-fw pi-building',
                                    items: [
                                        {
                                            label: 'Consultar',
                                            icon: 'pi pi-fw pi-search',
                                            routerLink: ['x']
                                        },

                                    ]
                                },
                                {
                                    label: 'Logradouro',
                                    icon: 'pi pi-fw pi-building',
                                    items: [
                                        {
                                            label: 'Incluir',
                                            icon: 'pi pi-fw pi-pencil',
                                            routerLink: ['x']
                                        },
                                        {
                                            label: 'Consultar',
                                            icon: 'pi pi-fw pi-search',
                                            routerLink: ['x']
                                        },

                                    ]
                                },
                                {
                                    label: 'Uf',
                                    icon: 'pi pi-fw pi-building',
                                    items: [
                                        {
                                            label: 'Consultar',
                                            icon: 'pi pi-fw pi-search',
                                            routerLink: ['x']
                                        },

                                    ]
                                },
                                {
                                    label: 'Pais',
                                    icon: 'pi pi-fw pi-building',
                                    items: [
                                        {
                                            label: 'Consultar',
                                            icon: 'pi pi-fw pi-search',
                                            routerLink: ['x']
                                        },

                                    ]
                                },
                                ],
                             },
                             { label: 'Profissoes', icon: 'pi pi-fw pi-briefcase', items: [
                                {
                                    label: 'Incluir',
                                    icon: 'pi pi-fw pi-pencil',
                                    routerLink: ['x']
                                },
                                {
                                    label: 'Consultar',
                                    icon: 'pi pi-fw pi-search',
                                    routerLink: ['x']
                                }
                            ]
                            },
                            { label: 'Permissoes', icon: 'pi pi-fw pi-verified', items: [
                                {
                                    label: 'Incluir',
                                    icon: 'pi pi-fw pi-pencil',
                                    routerLink: ['x']
                                },
                                {
                                    label: 'Consultar',
                                    icon: 'pi pi-fw pi-search',
                                    routerLink: ['x']
                                }
                            ]
                            }
                        ]
            },*/


            
            
        ];
    }
}

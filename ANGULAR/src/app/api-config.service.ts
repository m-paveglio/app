import { Injectable } from '@angular/core'; 

@Injectable({ providedIn: 'root' }) 

export class ApiConfigService { private readonly baseUrl: string = 'http://localhost:3000'; 

    getBaseUrl(): string { return this.baseUrl; } }
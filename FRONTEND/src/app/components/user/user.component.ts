import { Component } from '@angular/core';
import { UserService } from './user.service';

@Component({
  selector: 'app-user-search',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent {
  cpf: string = '';
  name: string = '';
  users: any[] = [];

  constructor(private userService: UserService) {}

  searchUsers() {
    this.userService.getUsers(this.cpf, this.name)
      .subscribe(data => {
        this.users = data;
      });
  }
}

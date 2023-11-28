import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class userComponent {
  searchTerm = '';
  user: any[] = [];

  constructor(private userService: UserService) {}

  search() {
    this.userService.getUsersByNameOrCpf(this.searchTerm)
      .subscribe(data => {
        this.user = data;
      });
  }
}

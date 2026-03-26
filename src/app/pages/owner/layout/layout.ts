import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-owner-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './layout.html',
})
export class OwnerLayout {}

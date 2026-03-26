import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-owner-footer',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './owner-footer.html',
  styleUrls: ['./owner-footer.css'],
})
export class OwnerFooter {}

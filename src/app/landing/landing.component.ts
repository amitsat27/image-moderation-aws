import { Component } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    MatButton,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {

  constructor(private router: Router) {}

  navigateToNavigationPage() {
    this.router.navigate(['/navigation']);
  }
}

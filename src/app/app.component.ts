import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ImageProcessComponent } from './image-process/image-process.component';
import { NavigationComponent } from './navigation/navigation.component';
import { LandingComponent } from './landing/landing.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,
    ImageProcessComponent,
    NavigationComponent,
    LandingComponent,
    MatButtonModule

  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'image-moderation-app';
}

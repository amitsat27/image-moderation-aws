import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { ImageProcessComponent } from './image-process/image-process.component';
import { NavigationComponent } from './navigation/navigation.component';

export const routes: Routes = [
    { path: '', component: LandingComponent }, // Default route
    { path: 'navigation', component: NavigationComponent },
];

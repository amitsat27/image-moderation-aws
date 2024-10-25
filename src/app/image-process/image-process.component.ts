import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-image-process',
  templateUrl: './image-process.component.html',
  styleUrl: './image-process.component.css',
  standalone: true,
  imports: [
    AsyncPipe,
    MatGridListModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    MatCardModule
  ]
})
export class ImageProcessComponent {
  private breakpointObserver = inject(BreakpointObserver);
  imageUrl: string | ArrayBuffer | null | undefined="";
  @ViewChild('fileInput') fileInput!: ElementRef;

  uploadImage() {
    this.fileInput.nativeElement.click(); // Trigger the hidden 
  }
  processImage(){}

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageUrl = e.target?.result; // Set the image URL for display
      };
      reader.readAsDataURL(file); // Convert the file to a data URL
    }
  }

  /** Based on the screen size, switch from standard to one column per row */
  cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({ matches }) => {
      if (matches) {
        return [
          { title: 'Card 1', cols: 2, rows: 1 },
          { title: 'Card 2', cols: 1, rows: 1 },
          { title: 'Card 3', cols: 1, rows: 1 },
          { title: 'Card 4', cols: 1, rows: 1 }
        ];
      }

      return [
        { title: 'Card 1', cols: 1, rows: 2 },
        { title: 'Card 2', cols: 2, rows: 1 },
        { title: 'Card 3', cols: 1, rows: 1 },
        { title: 'Card 4', cols: 1, rows: 1 },
        { title: 'Card 5', cols: 1, rows: 1 },
        { title: 'Card 6', cols: 1, rows: 2 },
        { title: 'Card 7', cols: 1, rows: 1 }
      ];
    })
  );
}
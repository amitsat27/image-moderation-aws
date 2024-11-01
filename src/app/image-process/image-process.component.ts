import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { catchError, map, tap } from 'rxjs/operators';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { HttpClient , HttpClientModule} from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { of } from 'rxjs';

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
    MatCardModule,
    HttpClientModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ]
})
export class ImageProcessComponent {
  
  private breakpointObserver = inject(BreakpointObserver);
  private http = inject(HttpClient); 
  private snackBar = inject(MatSnackBar); 

  imageUrl: string | ArrayBuffer | null | undefined="";
  base64Image: string | null = null;
  isImageSafe: boolean = true;
  fileName: string | null = null; 
  moderationLabels: any[] = [];
  isProcessingComplete: boolean = false;
  isLoading: boolean = false;

  @ViewChild('fileInput') fileInput!: ElementRef;

  uploadImage() {
    this.fileInput.nativeElement.click();
  }
  cols: number = 4; // Default column count
  colsImages: number = 2;

  // Update column count based on window size
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.setColsLabels();
    this.setColsImages();
  }


  showToaster(message: string, panelClass: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: [panelClass]
    });
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      
      const reader = new FileReader();
      this.fileName = file.name;

      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.imageUrl = result; 
        this.base64Image = result.split(',')[1];

        this.isProcessingComplete = false;
        this.isLoading = true;
        this.showToaster('Processing image...', 'green-snackbar');

        const apiUrl = 'https://tahekxieo5.execute-api.ap-south-1.amazonaws.com/dev/imageAnalysis'; 
        const body = { imageBase64: this.base64Image, fileName: this.fileName };

        this.http.post(apiUrl, body).pipe(
          tap((response: any) => {
            console.log('Image uploaded successfully', response);
            this.moderationLabels = response.moderationInfo;

            if (!this.moderationLabels || this.moderationLabels.length === 0) {
              this.isImageSafe = true;
            } else {
              const totalConfidence = this.moderationLabels.reduce((sum, label) => sum + label.Confidence, 0);
              const averageConfidence = totalConfidence / this.moderationLabels.length;
              this.isImageSafe = averageConfidence <= 90;
            }

            this.isProcessingComplete = true;
            this.isLoading = false;

            this.showToaster(this.isImageSafe ? 'Image is Safe' : 'Image is Unsafe', this.isImageSafe ? 'green-snackbar' : 'red-snackbar');
          }),
          catchError(error => {
            console.error('Error uploading image', error);
            this.isLoading = false;
            this.showToaster(error, 'green-snackbar');
            return of(null); 
          })
        ).subscribe();
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image file (JPG or PNG).');
    }
  }

  setColsLabels() {
    const width = window.innerWidth;
    if (width < 600) {
      this.cols = 1; // 1 column for small screens
    } else if (width < 960) {
      this.cols = 2; // 2 columns for medium screens
    } else {
      this.cols = 4; // 4 columns for larger screens
    }
  }
  setColsImages(){
    const width = window.innerWidth;
    if (width < 600) {
      this.colsImages = 1; // 1 column for small screens
    } else  {
      this.colsImages = 2; // 2 columns for medium screens
    } 
  }
  getFilteredLabels() {
    return this.moderationLabels.filter(label => label?.ParentName).slice(0, 4);
  }
  getSpinnerClass(confidence: number): string {
    if (confidence <= 25) {
      return 'spinner-primary'; // Define this class for low confidence
    } else if (confidence <= 50) {
      return 'spinner-warn'; // Define this class for medium confidence
    } else {
      return 'spinner-accent'; // Define this class for high confidence
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

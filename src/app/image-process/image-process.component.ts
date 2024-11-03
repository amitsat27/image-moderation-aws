import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { catchError, tap } from 'rxjs/operators';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { of } from 'rxjs';

@Component({
  selector: 'app-image-process',
  templateUrl: './image-process.component.html',
  styleUrls: ['./image-process.component.css'],
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
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);

  imageUrl: string | ArrayBuffer | null | undefined = "";
  base64Image: string | null = null;
  isImageSafe: boolean = true;
  fileName: string | null = null;
  moderationLabels: any[] = [];
  isProcessingComplete: boolean = false;
  isLoading: boolean = false;
  isDragOver: boolean = false;

  @ViewChild('fileInput') fileInput!: ElementRef;

  uploadImage() {
    this.fileInput.nativeElement.click();
  }

  showToaster(message: string, panelClass: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: [panelClass]
    });
  }

  handleFile(ImageFile: File) {
    const file = ImageFile;
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

  getFilteredLabels() {
    return this.moderationLabels.filter(label => label?.ParentName).slice(0, 4);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onFileDropped(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    if (event.dataTransfer && event.dataTransfer.files.length) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }
  
  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length) {
      this.handleFile(fileInput.files[0]);
    }
  }
}
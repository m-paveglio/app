import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';


@Component({
  selector: 'app-confirmation-dialog',
  template: `
    <h2 mat-dialog-title>Confirmação</h2>
    <mat-dialog-content>{{ data }}</mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="onConfirmClick()">OK</button>
      <button mat-button mat-dialog-close>Cancelar</button>
    </mat-dialog-actions>
  `,
})
export class ConfirmationDialog {

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: string) { }

  onConfirmClick(): void {
    this.dialogRef.close(true);
  }
}
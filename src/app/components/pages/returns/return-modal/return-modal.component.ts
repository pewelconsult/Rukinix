import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-return-modal',
  standalone: true,
  imports: [],
  templateUrl: './return-modal.component.html',
  styleUrl: './return-modal.component.css'
})
export class ReturnModalComponent {
  @Input() productName: string = '';
  @Input() quantity: number = 0;
  @Input() price: number = 0;
  @Output() returnConfirmed = new EventEmitter<number>();

  newQuantity: number = 0;

  ngOnInit() {
    this.newQuantity = this.quantity;
  }

  confirmReturn() {
    this.returnConfirmed.emit(this.newQuantity);
  }
}

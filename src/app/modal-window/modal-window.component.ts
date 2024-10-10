import { Component } from '@angular/core';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-modal-window',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-window.component.html',
  styleUrl: './modal-window.component.css'
})
export class ModalWindowComponent {
  isOpen: boolean = true;

  closeModal() {
    this.isOpen = false;
  }

  getGameResult() {
    return 'Game result';
  }
}

import {Component, OnDestroy} from '@angular/core';
import {CommonModule} from "@angular/common";
import {Subscription} from "rxjs";
import {ScoreService} from "../services/score.service";
import {ModalWindowStateService} from "../services/modal-window-state.service";

@Component({
  selector: 'app-modal-window',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-window.component.html',
  styleUrl: './modal-window.component.css'
})
export class ModalWindowComponent implements OnDestroy {
  isOpen: boolean = false;

  modalOpenTrigger: Subscription = new Subscription();

  constructor(private readonly scoreService: ScoreService,
              private readonly modalStateService: ModalWindowStateService) {
    this.modalOpenTrigger = this.modalStateService.openResultsModal$.subscribe(() => {
      this.openModal();
    })
  }

  openModal() {
    this.isOpen = true;
  }

  closeModal() {
    this.isOpen = false;
    this.modalStateService.closedResultsModalEvent$.next(); // notify that results modal is closed, need to reset game
  }

  get gameResult(): string {
    const finalScore = this.scoreService._score;
    const result = `${finalScore.user}:${finalScore.computer}`;
    return finalScore.user > finalScore.computer ? `Score ${result}. You won!` : `Score ${result}. You lost :(`;
  }

  ngOnDestroy(): void {
    this.modalOpenTrigger.unsubscribe();
  }
}

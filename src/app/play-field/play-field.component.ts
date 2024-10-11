import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {Subscription, takeUntil} from "rxjs";

import {PlayFieldCell} from "../types";
import {GameTimerService} from "../services/game-timer.service";
import {ModalWindowStateService} from "../services/modal-window-state.service";
import {ScoreService} from "../services/score.service";

@Component({
  selector: 'app-play-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './play-field.component.html',
  styleUrl: './play-field.component.css'
})
export class PlayFieldComponent implements OnInit, OnDestroy {
  gameResetSubscription: Subscription = new Subscription();
  timeOutSubscription: Subscription = new Subscription();

  fieldCells: Array<PlayFieldCell> = [];
  cellsPickedSet: Set<number> = new Set<number>();
  activeCellId: number = -1;

  constructor(private readonly gameTimer: GameTimerService,
              private readonly scoreService: ScoreService,
              private readonly modalWindowOpener: ModalWindowStateService) {
  }

  ngOnInit(): void {
    this.generateFieldCells();
    this.subscribeToTimeOut();

    this.gameResetSubscription = this.modalWindowOpener.closedResultsModalEvent$.subscribe(() => {
      // clear state of last activated cell
      this.resetLastActiveCellProperties();

      // regenerate play field & restart cell change trigger ofter result modal closed
      this.generateFieldCells();

      // init new timer subscription
      this.subscribeToTimeOut();
    })
  }

  trackByCells(index: number, item: PlayFieldCell): number {
    return item.id;
  }

  handleCellClick(cell: PlayFieldCell): void {
    if (cell.isActive) {
      // if clicked on active cell, make it userSuccess
      cell.isUserSuccess = true;
      cell.isActive = false;
      // increment user score
      this.scoreService.incrementUserScore();
      // trigger timer restart
      this.gameTimer.startTimer();
    }
  }

  private subscribeToTimeOut(): void {
    this.timeOutSubscription = this.gameTimer.timeOut$.pipe(takeUntil(this.scoreService.gameEnd$)).subscribe(() => {
      //if timeOut, process current cell & activate next one
      if (this.activeCellId >= 0 && !this.fieldCells[this.activeCellId].isUserSuccess) {
        // if previously active cell not picked in time, make it userFailed
        this.setLastActiveCellToUserFailed();
      }
      this.activateRandomCell();
    })
  }

  private generateFieldCells(): void {
    this.fieldCells = [];
    this.cellsPickedSet.clear();

    for (let i = 0; i < 100; i++) {
      this.fieldCells.push({id: i, isActive: false, isUserSuccess: false, isUserFailed: false});
    }
  }

  private activateRandomCell(): void {
    this.activeCellId = this.getRandomCellIdx();
    this.fieldCells[this.activeCellId].isActive = true;
  }

  private getRandomCellIdx(): number {
    let newIdx;
    do {
      newIdx = Math.floor(Math.random() * this.fieldCells.length);
    } while (this.cellsPickedSet.has(newIdx));
    this.cellsPickedSet.add(newIdx);
    return newIdx;
  }

  private setLastActiveCellToUserFailed(): void {
    this.fieldCells[this.activeCellId].isUserFailed = true;
    this.fieldCells[this.activeCellId].isActive = false;
    // increment computer score if active cell not clicked
    this.scoreService.incrementComputerScore();
  }

  private resetLastActiveCellProperties(): void {
    this.fieldCells[this.activeCellId].isActive = false;
    this.fieldCells[this.activeCellId].isUserFailed = false;
    this.fieldCells[this.activeCellId].isUserSuccess = false;
    this.activeCellId = -1;
  }

  ngOnDestroy(): void {
    this.gameResetSubscription.unsubscribe();
    this.timeOutSubscription.unsubscribe();
  }
}


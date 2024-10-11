import {Component, OnDestroy} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {Subscription} from "rxjs";

import {DEFAULT_TIMER, DEFAULT_TIMER_MAX, DEFAULT_TIMER_MIN, GameTimerService} from "../services/game-timer.service";
import {ModalWindowStateService} from "../services/modal-window-state.service";
import {ScoreService} from "../services/score.service";
import {PlayFieldComponent} from "../play-field/play-field.component";
import {ButtonText, Score} from "../types";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [FormsModule, PlayFieldComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnDestroy {
  gameEndSubscription: Subscription = new Subscription();
  buttonText = ButtonText;
  score: Score;
  isGameInProgress = false;

  minTime: number = DEFAULT_TIMER_MIN;
  maxTime: number = DEFAULT_TIMER_MAX;
  timerMs: number = DEFAULT_TIMER;

  constructor(private readonly gameTimer: GameTimerService,
              private readonly scoreService: ScoreService,
              private readonly modalOpener: ModalWindowStateService) {
    this.score = scoreService._score;
    this.setTimerMs(this.timerMs);
    this.initSub();
  }

  setTimerMs(newTime: number): void {
    // do not allow value out of min-max ranges
    if (newTime < this.minTime) {
      this.timerMs = this.minTime;
    } else if (newTime > this.maxTime) {
      this.timerMs = this.maxTime;
    } else {
      this.timerMs = newTime;
    }
    this.gameTimer.setTimerMs(this.timerMs);
  }

  gameButtonClicked(): void {
    //button function depends on isGameInProgress value
    this.isGameInProgress ? this.resetGame() : this.startGame();
  }

  private initSub(): void {
    this.gameEndSubscription = this.modalOpener.closedResultsModalEvent$.subscribe(() => {
      // resel game state
      this.isGameInProgress = false;
      this.scoreService.clearScore();
      this.score = this.scoreService._score;
    })
  }

  private startGame(): void {
    this.isGameInProgress = true;
    this.gameTimer.initTimerInstance();
    this.gameTimer.startTimer();
  }

  private resetGame(): void {
    // do manually stop and reset game without showing results
    this.isGameInProgress = false;
    this.gameTimer.stopTimer();
    this.scoreService.gameEnd$.next(false);
    this.score = this.scoreService._score;
  }

  ngOnDestroy(): void {
    this.gameEndSubscription.unsubscribe();
  }


}

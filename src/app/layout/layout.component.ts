import {Component, computed, OnDestroy, signal, Signal, WritableSignal} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {CommonModule} from "@angular/common";

import {Subscription} from "rxjs";
import {DEFAULT_TIMER, DEFAULT_TIMER_MAX, DEFAULT_TIMER_MIN, GameTimerService} from "../services/game-timer.service";
import {ModalWindowStateService} from "../services/modal-window-state.service";
import {ScoreService} from "../services/score.service";
import {PlayFieldComponent} from "../play-field/play-field.component";
import {ButtonText, Score} from "../types";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, PlayFieldComponent, ReactiveFormsModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnDestroy {
  gameEndSubscription: Subscription = new Subscription();
  score: Score;
  isGameInProgress: WritableSignal<boolean> = signal(false);
  buttonText: Signal<string> = computed(() => this.isGameInProgress() ? ButtonText.stop_game : ButtonText.start_game);

  timerInput = new FormControl<number>({value: DEFAULT_TIMER, disabled: this.isGameInProgress()},
    [Validators.required, Validators.min(DEFAULT_TIMER_MIN),
      Validators.max(DEFAULT_TIMER_MAX)]);

  constructor(private readonly gameTimer: GameTimerService,
              private readonly scoreService: ScoreService,
              private readonly modalOpener: ModalWindowStateService) {
    this.score = scoreService._score;
    this.initSub();

    this.timerInput.valueChanges.subscribe((newTime: number | null) => {
      this.gameTimer.setTimerMs(newTime || DEFAULT_TIMER);
    });
  }

  gameButtonClicked(): void {
    //button function depends on isGameInProgress value
    this.isGameInProgress() ? this.resetGame() : this.startGame();

    // disable/enable timer input manually
    this.triggerDisabledInputState();
  }

  private initSub(): void {
    this.gameEndSubscription = this.modalOpener.closedResultsModalEvent$.subscribe(() => {
      // resel game state
      this.isGameInProgress.set(false);
      this.scoreService.clearScore();
      this.score = this.scoreService._score;
    })
  }

  private triggerDisabledInputState(): void {
    this.isGameInProgress() ? this.timerInput.disable() : this.timerInput.enable();
  }

  private startGame(): void {
    this.isGameInProgress.set(true);
    this.gameTimer.initTimerInstance();
    this.gameTimer.startTimer();
  }

  private resetGame(): void {
    // do manually stop and reset game without showing results
    this.isGameInProgress.set(false);
    this.gameTimer.stopTimer();
    this.scoreService.gameEnd$.next(false);
    this.score = this.scoreService._score;
  }

  ngOnDestroy(): void {
    this.gameEndSubscription.unsubscribe();
  }


}

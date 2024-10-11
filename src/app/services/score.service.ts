import {Injectable} from "@angular/core";
import {Subject} from "rxjs";
import {Score} from "../types";
import {GameTimerService} from "./game-timer.service";

@Injectable({providedIn: "root"})
export class ScoreService {
  private score: Score = {user: 0, computer: 0};
  gameEnd$: Subject<boolean> = new Subject(); // boolean value to indicate whether to open results modal

  constructor(private readonly gameTimer: GameTimerService) {
  }

  get _score(): Score {
    return this.score;
  }

  incrementUserScore(): void {
    if (this.score.user < 10) {
      this.score.user++;
    }
    if (this.score.user == 10) {
      // stop game if user score reaches 10
      this.triggerGameEnd();
    }
  }

  incrementComputerScore(): void {
    if (this.score.computer < 10) {
      this.score.computer++;
    }
    if (this.score.computer == 10) {
      // stop game if computer score reaches 10
      this.triggerGameEnd();
    }
  }

  clearScore(): void {
    this.score = {user: 0, computer: 0};
  }

  private triggerGameEnd(): void {
    this.gameTimer.stopTimer();
    this.gameEnd$.next(true);
  }
}

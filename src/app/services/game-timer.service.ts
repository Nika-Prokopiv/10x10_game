import {Injectable} from "@angular/core";
import {Subject, Subscription, switchMap, takeUntil, tap, timer} from "rxjs";

export const DEFAULT_TIMER_MIN: number = 500;
export const DEFAULT_TIMER_MAX: number = 30000;
export const DEFAULT_TIMER: number = 3000;

@Injectable({providedIn: "root"})
export class GameTimerService {
  private timerTimeInMs: number = DEFAULT_TIMER_MIN;
  private timerSub: Subscription = new Subscription();
  private stop$: Subject<void> = new Subject();
  private start$: Subject<void> = new Subject();

  timeOut$: Subject<void> = new Subject();

  startTimer(): void {
    this.start$.next();
  }

  initTimerInstance(): void {
    this.timerSub = this.start$.pipe(
      switchMap(() => {
        // switch to new timer instance on each start$ emission
        return this.createTimer();
      }),
      takeUntil(this.stop$) // listen to timer until stop$
    ).subscribe();
  }

  stopTimer(): void {
    this.stop$.next();
  }

  setTimerMs(timerTimeInMs: number): void {
    this.timerTimeInMs = timerTimeInMs;
  }

  private createTimer() {
    return timer(0, this.timerTimeInMs).pipe(
      tap(() => {
        this.timeOut$.next();
      }),
      takeUntil(this.stop$)
    );
  }

}

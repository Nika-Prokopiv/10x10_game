import {Injectable, OnDestroy} from "@angular/core";
import {Subject, Subscription} from "rxjs";
import {ScoreService} from "./score.service";

@Injectable({providedIn: "root"})
export class ModalWindowStateService implements OnDestroy {
  private gameEndSub: Subscription = new Subscription();

  openResultsModal$: Subject<void> = new Subject<void>();
  closedResultsModalEvent$: Subject<void> = new Subject<void>();

  constructor(private readonly scoreService: ScoreService) {
    // listen to game end for any reason
    this.gameEndSub = this.scoreService.gameEnd$.subscribe((doOpenResultWindow: boolean) => {
      if (doOpenResultWindow) {
        // open game result modal when game ends and was not stopped manually by the user
        this.openResultsModal$.next();
      } else {
        // or emit closedResultsModalEvent$ to trigger game reset
        this.closedResultsModalEvent$.next();
      }
    })
  }

  onModalClose(): void {
    this.closedResultsModalEvent$.next();
  }

  ngOnDestroy(): void {
    this.gameEndSub.unsubscribe();
  }
}

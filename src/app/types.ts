export interface Score {
  user: number;
  computer: number;
}

export interface PlayFieldCell {
  id: number;
  isActive: boolean;
  isUserSuccess: boolean
  isUserFailed: boolean
}

export enum ButtonText {
  start_game = "Start game",
  stop_game = "Stop game"
}

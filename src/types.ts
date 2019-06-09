export enum KeyCode {
  Up = "\u001B\u005B\u0041",
  Down = "\u001B\u005B\u0042",
  Right = "\u001B\u005B\u0043",
  Left = "\u001B\u005B\u0044",
  CtrlC = "\u0003"
}

export type DirectionKeyCode =
  | KeyCode.Up
  | KeyCode.Down
  | KeyCode.Right
  | KeyCode.Left;

export enum Key {
  Up = "UP",
  Down = "DOWN",
  Right = "RIGHT",
  Left = "LEFT",
  CtrlC = "CTRLC"
  // Enter = "ENTER",
  // Space = "SPACE"
}

export const codeToKey: { [key: string]: Key } = {
  [KeyCode.Up as string]: Key.Up,
  [KeyCode.Down as string]: Key.Down,
  [KeyCode.Left as string]: Key.Left,
  [KeyCode.Right as string]: Key.Right,
  [KeyCode.CtrlC as string]: Key.CtrlC
  // [KeyCode.Space as string]: Key.Space,
  // [KeyCode.Enter as string]: Key.Enter
};

export const keyToCode: { [key: string]: string } = {
  [Key.Up as string]: KeyCode.Up,
  [Key.Down as string]: KeyCode.Down,
  [Key.Right as string]: KeyCode.Right,
  [Key.Left as string]: KeyCode.Left,
  [Key.CtrlC as string]: KeyCode.CtrlC
  // [Key.Enter as string]: KeyCode.Enter,
  // [Key.Space as string]: KeyCode.Space
};

export enum Flag {
  None = 0,
  Merged = 1 << 0,
  Spawned = 1 << 1
}

export type Cell = {
  value: number | null;
  flag: Flag;
};

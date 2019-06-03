export enum KeyCode {
  Up = "\u001B\u005B\u0041",
  Down = "\u001B\u005B\u0042",
  Right = "\u001B\u005B\u0043",
  Left = "\u001B\u005B\u0044",
  CtrlC = "\u0003"
  // Space = "\u0020",
  // Enter = "\u000D"
}

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

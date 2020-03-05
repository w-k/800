import { KeyCode, DirectionKeyCode, Flag, Cell } from "./types";
import { diff, Update } from "./diff";
import tty from "tty";
import chalk from "chalk";

if (process.stdin.setRawMode) {
  process.stdin.resume();
  process.stdin.setRawMode(true);
  process.stdin.setEncoding("utf8");
}

const stdin = process.stdin as tty.WriteStream;
const stdout = process.stdout as tty.WriteStream;

stdout.write("\u001B[?25l");

// const figletMap: { [key: string]: string } = {
//   "2": `____
// |___ \
//   __) |
//  / __/
// |_____|
// `, // 7
//   "4": `  _  _
// | || |
// | || |_
// |__   _|
//    |_|
// `, // 8
//   "8": `  ___
//  ( _ )
//  / _ \
// | (_) |
//  \___/
// `, // 7
//   "10": ` _  ___
// / |/ _ \
// | | | | |
// | | |_| |
// |_|\___/
//  `, // 9
//   "20": `____   ___
// |___ \ / _ \
//   __) | | | |
//  / __/| |_| |
// |_____|\___/
//  `, // 13
//   "40": `_  _    ___
// | || |  / _ \
// | || |_| | | |
// |__   _| |_| |
//    |_|  \___/
//  `, // 14
//   "80": `  ___   ___
//  ( _ ) / _ \
//  / _ \| | | |
// | (_) | |_| |
//  \___/ \___/
// `, // 13
//   "100": ` _  ___   ___
// / |/ _ \ / _ \
// | | | | | | | |
// | | |_| | |_| |
// |_|\___/ \___/
//  `, // 15
//   "200": `  ____   ___   ___
//   |___ \ / _ \ / _ \
//     __) | | | | | | |
//    / __/| |_| | |_| |
//   |_____|\___/ \___/
//  `,
//   "400": `_  _    ___   ___
// | || |  / _ \ / _ \
// | || |_| | | | | | |
// |__   _| |_| | |_| |
//    |_|  \___/ \___/
//  `, // 20
//   "800": `  ___   ___   ___
//  ( _ ) / _ \ / _ \
//  / _ \| | | | | | |
// | (_) | |_| | |_| |
//  \___/ \___/ \___/
// ` // 19
// };

// const top = "┌──────┐";
// const bottom = "└──────┘";
// │

// const n = [
//   `  ___   ___   ___  `,
//   ` ( _ ) / _ \\ / _ \\ `,
//   ` / _ \\| | | | | | |`,
//   `| (_) | |_| | |_| |`,
//   ` \\___/ \\___/ \\___/ `
// ];
// const t = `┌─────────────────────┐`;
// const b = `└─────────────────────┘`;
// const x800 = [
//   `${t}`,
//   `│ ${n[0]} │`,
//   `│ ${n[1]} │`,
//   `│ ${n[2]} │`,
//   `│ ${n[3]} │`,
//   `│ ${n[4]} │`,
//   `${b}`
// ];

// const g = [
//   x800[0].repeat(4),
//   x800[1].repeat(4),
//   x800[2].repeat(4),
//   x800[3].repeat(4),
//   x800[4].repeat(4),
//   x800[5].repeat(4),
//   x800[6].repeat(4)
// ].join("\n");
// console.log([g, g, g, g].join("\n"));

const getColor = (value: number | null): string => {
  if (value === null) {
    return "#ffffff";
  }
  if (value === 2) {
    return "#fffac8";
  }
  if (value === 4) {
    return "#fabebe";
  }
  if (value === 8) {
    return "#e6beff";
  }
  if (value === 16) {
    return "#aaffc3";
  }
  if (value === 32) {
    return "#469990";
  }
  if (value === 64) {
    return "#4363d8";
  }
  if (value === 128) {
    return "#ffe119";
  }
  if (value === 256) {
    return "#800000";
  }
  if (value === 512) {
    return "#f58231";
  }
  if (value === 1024) {
    return "f032e6";
  }
  return "#e6194B";
};

const top = "┌──────┐";
const bottom = "└──────┘";

enum Color {
  Blue = "#9bc1ff",
  Orange = "#ffb682",
  Green = "#74fc7a"
}

type TextTransform = (input: string) => string;

const mergeTransforms = (textTransforms: TextTransform[]): TextTransform => {
  return (input: string) => {
    let output = input;
    textTransforms.forEach(textTransform => {
      output = textTransform(output);
    });
    return output;
  };
};

const getBorderStyles = (cell: Cell): ((input: string) => string) => {
  const textTransforms: TextTransform[] = [input => input];
  // tslint:disable-next-line: no-bitwise
  if (cell.flag & Flag.Spawned) {
    textTransforms.push(chalk.hex(Color.Green));
  }
  // tslint:disable-next-line: no-bitwise
  if (cell.flag & Flag.Merged) {
    textTransforms.push(chalk.hex(Color.Orange));
  }
  return mergeTransforms(textTransforms);
};

const stringify = (value: number | null) =>
  value === null ? "" : value.toString(16);

const getValueStyles = (cell: Cell): TextTransform => {
  const textTransforms: TextTransform[] = [input => input];
  const initialValueLength = stringify(cell.value).length;
  textTransforms.push(chalk.hex(getColor(cell.value)));
  // tslint:disable-next-line: no-bitwise
  if (cell.flag & Flag.Merged) {
    textTransforms.push(chalk.bold);
  }
  textTransforms.push(value => value + " ".repeat(4 - initialValueLength));
  return mergeTransforms(textTransforms);
};

const getCellStyles = (cell: Cell): ((input: string) => string) => {
  if (cell.value && cell.value > 8) {
    return input => chalk.bgHex(getColor(cell.value && cell.value * 2))(input);
  }
  return input => input;
};

const getCellLines = (cell: Cell): string[] => {
  const borderStyles = getBorderStyles(cell);
  const valueStyles = getValueStyles(cell);
  const cellStyles = getCellStyles(cell);
  return [
    cellStyles(borderStyles(top)),
    cellStyles(
      borderStyles("│ ") +
        valueStyles(stringify(cell.value)) +
        borderStyles(" │")
    ),
    cellStyles(borderStyles(bottom))
  ];
};

const renderLine = (cells: Cell[]): string[] => {
  const allCellLines = cells.map(cell => getCellLines(cell));
  const cellHeight = allCellLines[0].length;
  const gridLines: string[] = [];
  for (let i = 0; i < cellHeight; i++) {
    const gridLine = allCellLines.map(oneCellLines => oneCellLines[i]).join("");
    gridLines.push(gridLine);
  }

  return gridLines;
};

let renderedLines: string[] = [];

// const padLeft = (input: string, widthWithPadding: number): string => {
//   return `${" ".repeat(widthWithPadding - input.length)}${input}`;
// };

const render = (cells: Cell[][]) => {
  let newLines: string[] = [];
  cells.forEach(cell => {
    newLines = [...newLines, ...renderLine(cell)];
  });
  if (renderedLines.length === 0) {
    stdout.cursorTo(0, 0);
    stdout.clearScreenDown();
    stdout.write(newLines.join("\n"));
  } else {
    applyDiff(diff(renderedLines, newLines));
    renderedLines = newLines;
  }
  stdout.cursorTo(35, 1);
  stdout.clearLine(1);
  stdout.write(`Score: 0x${score.toString(16)} (${score})`);
};

const onLost = () => {
  stdout.cursorTo(0, 0);
  stdout.clearScreenDown();
  stdout.cursorTo(5, 6);
  stdout.write("You lost");
  stdout.cursorTo(5, 7);
  stdout.rite(`Score: 0x${score.toString(16)} (${score})`);
};

const applyDiff = (updates: Update[][]) => {
  updates.forEach((lineUpdates, lineIndex) => {
    lineUpdates.forEach(update => {
      stdout.cursorTo(update.index, lineIndex);
      stdout.write(update.value);
    });
  });
};

const emptyCell = () => ({
  value: null,
  flag: Flag.None
});

const emptyGrid = () => {
  const grid: Cell[][] = [];
  for (let y = 0; y < 4; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < 4; x++) {
      row.push(emptyCell());
    }
    grid.push(row);
  }
  return grid;
};

const getEmptyCells = (gridValues: Cell[][]): number[][] => {
  const result: number[][] = [];
  gridValues.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell.value === null) {
        result.push([x, y]);
      }
    });
  });
  return result;
};

const random = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min) + min);

const addRandom = (cells: Cell[][], count: number) => {
  const empty = getEmptyCells(cells);
  while (empty.length > 0 && count > 0) {
    count--;
    const index = random(0, empty.length);
    const [x, y] = empty[index];
    cells[y][x] = { value: 2, flag: Flag.Spawned };
    empty.splice(index, 1);
  }
};

const initializeGrid = (): Cell[][] => {
  const initialGrid = emptyGrid();
  addRandom(initialGrid, 2);
  return initialGrid;
};

const calculateScore = (g: Cell[][]): number =>
  g
    .map(row => row.reduce((curr, prev) => curr + (prev.value || 0), 0))
    .reduce((curr, prev) => curr + prev, 0);

let grid = initializeGrid();
let score = calculateScore(grid);

render(grid);

stdin.on("data", (keyCode: KeyCode) => {
  switch (keyCode) {
    case KeyCode.CtrlC:
      stdout.cursorTo(0, 0);
      stdout.clearScreenDown();
      process.exit();
      return;
    case KeyCode.Up:
    case KeyCode.Down:
    case KeyCode.Left:
    case KeyCode.Right:
      const newGrid = transformMap[keyCode](grid);
      if (areDifferent(grid, newGrid)) {
        addRandom(newGrid, 1);
        grid = newGrid;
        score = calculateScore(grid);
        render(grid);
      } else {
        if (getEmptyCells(grid).length === 0) {
          onLost();
        }
      }
      return;
  }
});

const collapse = (cells: Cell[]): Cell[] => {
  const cellsWithValues = cells.filter(x => x.value !== null);
  if (cellsWithValues.length === 0) {
    return padNull([], "right");
  }
  const newCells: Cell[] = [];
  let index = 0;
  while (true) {
    if (
      index < cellsWithValues.length - 1 &&
      cellsWithValues[index].value === cellsWithValues[index + 1].value
    ) {
      newCells.push({
        value: cellsWithValues[index].value! * 2,
        flag: Flag.Merged
      });
      index += 2;
      if (index > cellsWithValues.length - 1) {
        break;
      }
    }
    newCells.push({ ...cellsWithValues[index]!, flag: Flag.None });
    if (index === cellsWithValues.length - 1) {
      break;
    }
    index++;
  }
  return padNull(newCells, "right");
};

const areDifferent = (a: Cell[][], b: Cell[][]): boolean => {
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      if (a[y][x].value !== b[y][x].value) {
        return true;
      }
    }
  }
  return false;
};

const left = (gridValues: Cell[][]): Cell[][] => {
  const newValues = gridValues.map(row => collapse(row));
  return newValues;
};

const right = (gridValues: Cell[][]): Cell[][] => {
  const newValues = gridValues.map(row => {
    const newRow = [...row];
    newRow.reverse();
    const collapsed = collapse(newRow);
    collapsed.reverse();
    return collapsed;
  });
  return newValues;
};

const up = (gridValues: Cell[][]): Cell[][] => {
  const newValues: Cell[][] = [[], [], [], []];
  for (let i = 0; i < 4; i++) {
    const column = gridValues.map(x => x[i]);
    const collapsed = collapse(column);
    collapsed.forEach((value, idx) => {
      newValues[idx].push(value);
    });
  }
  return newValues;
};

const down = (gridValues: Cell[][]): Cell[][] => {
  const newValues: Cell[][] = [[], [], [], []];
  for (let i = 0; i < 4; i++) {
    const column = gridValues.map(x => x[i]);
    column.reverse();
    const collapsed = collapse(column);
    collapsed.reverse();
    collapsed.forEach((value, idx) => {
      newValues[idx].push(value);
    });
  }
  return newValues;
};

const transformMap: {
  [key in DirectionKeyCode]: (grid: Cell[][]) => Cell[][]
} = {
  [KeyCode.Left]: left,
  [KeyCode.Right]: right,
  [KeyCode.Up]: up,
  [KeyCode.Down]: down
};

type Direction = "left" | "right";

const padNull = (array: Cell[], direction: Direction) => {
  const padding: Array<Cell> = [];
  for (let i = 0; i < 4 - array.length; i++) {
    padding.push(emptyCell());
  }
  if (direction === "left") {
    return [...padding, ...array];
  } else {
    return [...array, ...padding];
  }
};

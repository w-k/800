const readline = require("readline");

import { KeyCode, DirectionKeyCode } from "./types";
import chalk from "chalk";

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
  if (cell.flag & Flag.Spawned) {
    textTransforms.push(chalk.hex(Color.Green));
  }
  if (cell.flag & Flag.Merged) {
    textTransforms.push(chalk.hex(Color.Orange));
  }
  return mergeTransforms(textTransforms);
};

const stringify = (value: number | null) =>
  value === null ? "" : value.toString(16);

const getValueStyles = (cell: Cell): TextTransform => {
  const textTransforms: TextTransform[] = [];
  const initialValueLength = stringify(cell.value).length;
  textTransforms.push(chalk.hex(getColor(cell.value)));
  // let format = (input: string) => chalk.hex(getColor(cell.value))(input);
  textTransforms.push(value => value + " ".repeat(4 - initialValueLength));
  return mergeTransforms(textTransforms);
};

const getCellStyles = (_cell: Cell): ((input: string) => string) => {
  // if (cell.value && cell.value > 8) {
  //   return input => chalk.bgHex(getColor(cell.value && cell.value * 2))(input);
  // }
  return input => input;
};

const writeLine = (cells: Cell[]) => {
  const borderStyles: Array<(input: string) => string> = cells.map(cell =>
    getBorderStyles(cell)
  );
  const valueStyles: Array<(input: string) => string> = cells.map(cell =>
    getValueStyles(cell)
  );
  const cellStyles: Array<(input: string) => string> = cells.map(cell =>
    getCellStyles(cell)
  );
  return (
    cellStyles[0](borderStyles[0](top)) +
    cellStyles[1](borderStyles[1](top)) +
    cellStyles[2](borderStyles[2](top)) +
    cellStyles[3](borderStyles[3](top)) +
    cellStyles[0](
      borderStyles[0]("\n│ ") +
        valueStyles[0](stringify(cells[0].value)) +
        borderStyles[0](" │")
    ) +
    cellStyles[1](
      borderStyles[1]("│ ") +
        valueStyles[1](stringify(cells[1].value)) +
        borderStyles[1](" │")
    ) +
    cellStyles[2](
      borderStyles[2]("│ ") +
        valueStyles[2](stringify(cells[2].value)) +
        borderStyles[2](" │")
    ) +
    cellStyles[3](
      borderStyles[3]("│ ") +
        valueStyles[3](stringify(cells[3].value)) +
        borderStyles[3](" │\n")
    ) +
    cellStyles[0](borderStyles[0](bottom)) +
    cellStyles[1](borderStyles[1](bottom)) +
    cellStyles[2](borderStyles[2](bottom)) +
    cellStyles[3](borderStyles[3](bottom))
  );
};

const render = (cells: Cell[][]) =>
  `${writeLine(cells[0])}\n${writeLine(cells[1])}\n${writeLine(
    cells[2]
  )}\n${writeLine(cells[3])}\n`;

enum Flag {
  None = 0,
  Merged = 1 << 0,
  Spawned = 1 << 1
}

type Cell = {
  value: number | null;
  flag: Flag;
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

let grid = initializeGrid();

console.log(render(grid));

const { stdin } = process;
if (stdin.setRawMode) {
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding("utf8");
}

stdin.on("data", (keyCode: KeyCode) => {
  switch (keyCode) {
    case KeyCode.CtrlC:
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
        replace(render(grid));
      }
      return;
  }
});

const replace = (gridString: string) => {
  readline.moveCursor(process.stdout, 0, -13);
  readline.clearScreenDown(process.stdout);
  console.log(gridString);
};

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

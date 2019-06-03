const readline = require("readline");

import { KeyCode } from "./types";
import chalk from "chalk";

const format = (num: GridValue) => {
  const stringified = num === null ? "" : num.toString(16);
  return chalk.hex(getColor(num))(
    stringified + " ".repeat(4 - stringified.length)
  );
};

const getColor = (value: GridValue) => {
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

/*
2
4
8
16
32
64
128
256
512
1024
2048
*/

const tops = "┌──────┐┌──────┐┌──────┐┌──────┐";
const bottoms = "└──────┘└──────┘└──────┘└──────┘";

const writeLine = (gridValues: GridValue[]) =>
  tops +
  "\n│ " +
  format(gridValues[0]) +
  " ││ " +
  format(gridValues[1]) +
  " ││ " +
  format(gridValues[2]) +
  " ││ " +
  format(gridValues[3]) +
  " │\n" +
  bottoms;

const writeGrid = (gridValues: GridValue[][]) =>
  `${writeLine(gridValues[0])}\n${writeLine(gridValues[1])}\n${writeLine(
    gridValues[2]
  )}\n${writeLine(gridValues[3])}\n`;

type GridValue = number | null;

const emptyGrid = () => {
  return [
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null]
  ];
};

const emptyCells = (gridValues: GridValue[][]): number[][] => {
  const result: number[][] = [];
  gridValues.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === null) {
        result.push([x, y]);
      }
    });
  });
  return result;
};

const random = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min) + min);

const addRandom = (gridValues: GridValue[][], count: number) => {
  const empty = emptyCells(gridValues);
  while (empty.length > 0 && count > 0) {
    count--;
    const index = random(0, empty.length);
    const [x, y] = empty[index];
    gridValues[y][x] = 2;
    empty.splice(index, 1);
  }
};

const initializeGrid = (): GridValue[][] => {
  const initialGrid = emptyGrid();
  addRandom(initialGrid, 2);
  return initialGrid;
};

let grid = initializeGrid();

console.log(writeGrid(grid));

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
      grid = up(grid);
      addRandom(grid, 1);
      replace(writeGrid(grid));
      return;
    case KeyCode.Down:
      grid = down(grid);
      addRandom(grid, 1);
      replace(writeGrid(grid));
      return;
    case KeyCode.Left:
      grid = left(grid);
      addRandom(grid, 1);
      replace(writeGrid(grid));
      return;
    case KeyCode.Right:
      grid = right(grid);
      addRandom(grid, 1);
      replace(writeGrid(grid));
      return;
  }
});

const replace = (gridString: string) => {
  readline.moveCursor(process.stdout, 0, -13);
  readline.clearScreenDown(process.stdout);
  console.log(gridString);
};

const collapse = (gridValues: GridValue[]): GridValue[] => {
  const values = gridValues.filter(x => x !== null);
  if (values.length === 0) {
    return padNull([], "right");
  }
  const newValues: number[] = [];
  let index = 0;
  while (true) {
    if (values[index] === values[index + 1]) {
      newValues.push(values[index]! * 2);
      index += 2;
      if (index > values.length - 1) {
        break;
      }
    }
    newValues.push(values[index]!);
    if (index === values.length - 1) {
      break;
    }
    index++;
  }
  return padNull(newValues, "right");
};

const left = (gridValues: GridValue[][]): GridValue[][] =>
  gridValues.map(row => collapse(row));

const right = (gridValues: GridValue[][]): GridValue[][] =>
  gridValues.map(row => {
    row.reverse();
    const collapsed = collapse(row);
    collapsed.reverse();
    return collapsed;
  });

const up = (gridValues: GridValue[][]): GridValue[][] => {
  for (let i = 0; i < 4; i++) {
    const column = gridValues.map(x => x[i]);
    const collapsed = collapse(column);
    gridValues.forEach((x, idx) => {
      x[i] = collapsed[idx];
    });
  }
  return gridValues;
};

const down = (gridValues: GridValue[][]): GridValue[][] => {
  for (let i = 0; i < 4; i++) {
    const column = gridValues.map(x => x[i]);
    column.reverse();
    const collapsed = collapse(column);
    collapsed.reverse();
    gridValues.forEach((x, idx) => {
      x[i] = collapsed[idx];
    });
  }
  return gridValues;
};

type Direction = "left" | "right";

const padNull = (array: GridValue[], direction: Direction) => {
  const padding: null[] = [];
  for (let i = 0; i < 4 - array.length; i++) {
    padding.push(null);
  }
  if (direction === "left") {
    return [...padding, ...array];
  } else {
    return [...array, ...padding];
  }
};

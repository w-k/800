export enum UpdateType {
  Add = "ADD",
  Remove = "REMOVE",
  Replace = "REPLACE"
}

export interface Update {
  index: number;
  value: string;
}
// chalk.red("abc") => \u001B[31m abc \u001B[39m
// chalk.hex("#4286f4")("abc") => \u001B[38;2;66;134;244mabc\u001B[39m
// const tagEndings = ["[31m", "[39m"];

export enum TagType {
  None = "None",
  Open = "Open",
  Close = "Close"
}

export const getTagInfo = (
  line: string,
  index: number
): { value: string | undefined; type: TagType } => {
  if (line[index] !== "\u001b") {
    return { type: TagType.None, value: undefined };
  }
  const startIndex = index;
  let endIndex = index;

  while (true) {
    endIndex++;
    if (endIndex === line.length) {
      return { type: TagType.None, value: undefined };
    }
    if (line[endIndex] === "m") {
      const value = line.slice(startIndex, endIndex + 1);
      return {
        value,
        type: value.endsWith("[39m") ? TagType.Close : TagType.Open
      };
    }
  }
};

export const diff = (linesA: string[], linesB: string[]): Update[][] => {
  const updates: Update[][] = [];
  for (let i = 0; i < linesA.length; i++) {
    const lineA = linesA[i];
    const lineB = linesB[i];
    let indexA = 0;
    let indexB = 0;
    let visibleIndex = 0;
    let updateStart: number | undefined;
    const lineUpdates: Update[] = [];
    const tagStackA: string[] = [];
    const tagStackB: string[] = [];
    while (true) {
      if (indexB >= lineB.length || indexA >= lineA.length) {
        if (updateStart !== undefined) {
          // console.log(
          //   `pushing update because updateStart is ${updateStart} and reached end of line`
          // );
          lineUpdates.push({
            index: updateStart,
            value: lineB.slice(updateStart, lineB.length)
          });
        }
        break;
      }

      const tagA = getTagInfo(lineA, indexA);
      if (tagA.type === TagType.Open) {
        tagStackA.unshift(tagA.value!);
      } else if (tagA.type === TagType.Close) {
        tagStackA.shift();
      }

      const tagB = getTagInfo(lineB, indexB);
      if (tagB.type === TagType.Open) {
        tagStackB.unshift(tagA.value!);
      } else if (tagB.type === TagType.Close) {
        tagStackB.shift();
      }

      if (tagA.type !== TagType.None) {
        indexA += tagA.value!.length;
      }
      if (tagB.type !== TagType.None) {
        indexB += tagB.value!.length;
      }
      // console.log(
      //   `visibleIndex: ${visibleIndex} indexA: ${indexA} (${
      //     lineA[indexA]
      //   }) indexB: ${indexB} (${lineB[indexB]}) tagStackA: ${
      //     tagStackA.length
      //   } tagStackB.length: ${tagStackB.length}`
      // );
      if (lineA[indexA] === lineB[indexB] && tagStackB.length === 0) {
        if (updateStart !== undefined) {
          lineUpdates.push({
            index: updateStart,
            value: lineB.slice(updateStart, indexB)
          });
          // console.log(`setting updateStart to undefined`);
          updateStart = undefined;
        }
      } else if (updateStart === undefined) {
        // console.log(`setting updateStart to visibleIndex: ${visibleIndex}`);
        updateStart = visibleIndex;
      }

      visibleIndex++;
      indexA++;
      indexB++;
    }
    updates.push(lineUpdates);
  }
  return updates;
};

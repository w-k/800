import { getTagInfo, TagType, diff } from "../diff";

describe("getTagInfo", () => {
  test.each([
    ["\u001B[31mabc\u001B[39m", 0, "\u001B[31m", TagType.Open],
    ["\u001B[31mabc\u001B[39m", 1, undefined, TagType.None],
    ["\u001B[31mabc\u001B[39m", 2, undefined, TagType.None],
    ["\u001B[31mabc\u001B[39m", 3, undefined, TagType.None],
    ["\u001B[31mabc\u001B[39m", 4, undefined, TagType.None],
    ["\u001B[31mabc\u001B[39m", 5, undefined, TagType.None],
    ["\u001B[31mabc\u001B[39m", 6, undefined, TagType.None],
    ["\u001B[31mabc\u001B[39m", 7, undefined, TagType.None],
    ["\u001B[31mabc\u001B[39m", 8, "\u001B[39m", TagType.Close],
    ["\u001B[31mabc\u001B[39m", 9, undefined, TagType.None],
    ["\u001B[31mabc\u001B[39m", 10, undefined, TagType.None],
    ["\u001B[31mabc\u001B[39m", 11, undefined, TagType.None],
    ["\u001B[31mabc\u001B[39m", 12, undefined, TagType.None]
  ])("%s %s %s", (line: any, index: any, value: any, type: any) => {
    expect(getTagInfo(line, index)).toEqual({ value, type });
  });
});

describe("diff", () => {
  // chalk.red("abc"), // \u001B[31m abc \u001B[39m
  // chalk.red("abc"), // \u001B[31mabc\u001B[39m
  test.each([
    ["abc", "abc", []],
    [
      "abc",
      "axc",
      [
        {
          index: 1,
          value: "x"
        }
      ]
    ],
    [
      "abc",
      "xbc",
      [
        {
          index: 0,
          value: "x"
        }
      ]
    ],
    [
      "abc",
      "abx",
      [
        {
          index: 2,
          value: "x"
        }
      ]
    ],
    [
      "abcdef",
      "xyzdef",
      [
        {
          index: 0,
          value: "xyz"
        }
      ]
    ],
    [
      "abcdef",
      "abxyzf",
      [
        {
          index: 2,
          value: "xyz"
        }
      ]
    ],
    [
      "abcdef",
      "abcxyz",
      [
        {
          index: 3,
          value: "xyz"
        }
      ]
    ],
    [
      "abc",
      "\u001B[31mabc\u001B[39m",
      [
        {
          index: 0,
          value: "\u001B[31mabc\u001B[39m"
        }
      ]
    ],
    [
      "abc",
      "a\u001B[31mbc\u001B[39m",
      [
        {
          index: 1,
          value: "\u001B[31mbc\u001B[39m"
        }
      ]
    ],
    [
      "abc",
      "\u001B[31mab\u001B[39mc",
      [
        {
          index: 0,
          value: "\u001B[31mab\u001B[39m"
        }
      ]
    ]
  ])("%s %s %o", (a: any, b: any, updates: any) => {
    expect(diff([a as string], [b as string])).toEqual([updates]);
  });
});

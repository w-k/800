export const unicodeLiteral = (input: string) => {
  let result = "";
  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i);
    const hex = charCode.toString(16).toUpperCase();
    const padding = "0".repeat(4 - hex.length);
    if (charCode > 126 || charCode < 32) {
      result += `\\u${padding}${hex}`;
    } else {
      result += input[i];
    }
  }
  return result;
};

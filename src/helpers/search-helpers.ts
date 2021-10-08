export const getSearchArray: (str: string) => string[] = _str => {
  const str = _str.toLowerCase();
  const output: string[] = [];
  let acc = "";
  let accTotal = "";
  str.split("").forEach(char => {
    // Reset accumulator when space is encountered
    // Otherwise, add the new phrase to the array
    accTotal += char;
    output.push(accTotal);
    if (char === " ") {
      acc = "";
    } else {
      acc += char;
      output.push(acc);
    }
  });
  return Array.from(new Set(output));
};

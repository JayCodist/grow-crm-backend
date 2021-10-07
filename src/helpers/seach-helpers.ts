export const getSearchArray: (str: string) => string[] = (str) => {
  const output: string[] = [];
  let acc = "";
  str.split("").forEach((char) => {
    // Reset accumulator when space is encountered
    // Otherwise, add the new phrase to the array
    if (char === " ") {
      acc = "";
    } else {
      acc += char;
      output.push(acc);
    }
  });
  return Array.from(new Set(output));
};

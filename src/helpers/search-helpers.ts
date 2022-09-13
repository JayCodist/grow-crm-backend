import AppConfigRepo from "../database/repository/AppConfigRepo";

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

export const waitOut = (milliseconds: number) => {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
};

/**
 * Implements incremental backoff-retry if sync is ongoing
 */
export const wPCollectionIsReady = async () => {
  const config = await AppConfigRepo.getConfig();
  if (config?.wPSyncInProgress) {
    /**
     * Wait till sync is complete
     */
    for (let waitTime = 1000; config?.wPSyncInProgress; waitTime += 1000) {
      // eslint-disable-next-line no-await-in-loop
      await waitOut(waitTime);
    }
  }
};

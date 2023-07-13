export const msInDay = 86400 * 1000;

export const checkFreqCodes = {
  day: true,
  week: true,
  month: true,
  quarter: true,
  year: true,
};

export type CheckFreqCode = keyof typeof checkFreqCodes;

export const checkFreqCodesArray = Object.keys(checkFreqCodes) as [
  CheckFreqCode,
  ...CheckFreqCode[],
];

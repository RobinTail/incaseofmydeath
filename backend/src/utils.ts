import { CheckFreqCode } from "./const";

export const checkFreqToDays = (checkFreq: CheckFreqCode): number => {
  switch (checkFreq) {
    case "year":
      return 365;
    case "quarter":
      return 90;
    case "month":
      return 30;
    case "week":
      return 7;
    default:
      return 1;
  }
};

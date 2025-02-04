/* eslint-disable no-empty-pattern */
import {
  Slider,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  Tooltip,
} from "@mui/material";
import Icon from "@mui/material/Icon";
import React from "react";
import { updateTimeSettings } from "./api";

type CheckFreqCode = "day" | "week" | "month" | "quarter" | "year";

const checkFreqLabels: Record<CheckFreqCode, string> = {
  day: "daily",
  week: "weekly",
  month: "monthly",
  quarter: "quarterly",
  year: "yearly",
};

const defaultCheckFreqCode: CheckFreqCode = "month";

interface TimeSlidersOptions {
  userId: number;
  uToken: string;
  checkFreqCode: CheckFreqCode;
  deadlineDays: number;
  attemptsCount: number;
  nextCheck: Date;
}

const checkFreqMarks = (Object.keys(checkFreqLabels) as CheckFreqCode[]).map(
  (key, index) => ({
    value: index,
    label: checkFreqLabels[key],
  }),
);

export const TimeSliders = (props: TimeSlidersOptions) => {
  const theme = useTheme();
  const isXS = useMediaQuery(theme.breakpoints.only("xs"));
  const [checkFreq, setCheckFreq] = React.useState(() => {
    const foundIndex = Object.keys(checkFreqLabels).indexOf(
      props.checkFreqCode,
    );
    if (foundIndex === -1) {
      return Object.keys(checkFreqLabels).indexOf(defaultCheckFreqCode);
    }
    return foundIndex;
  });
  const [deadlineDays, setDeadlineDays] = React.useState(props.deadlineDays);
  const [attemptsCount, setAttemptsCount] = React.useState(props.attemptsCount);
  const [nextCheck, setNextCheck] = React.useState(props.nextCheck);

  const handleUpdate = async () => {
    const resp = await updateTimeSettings({
      userId: props.userId,
      uToken: props.uToken,
      checkFreq: Object.keys(checkFreqLabels)[
        checkFreq
      ] as keyof typeof checkFreqLabels,
      deadlineDays,
      attemptsCount,
    });
    setNextCheck(new Date(resp.nextCheck));
  };

  return (
    <Box sx={[!isXS && { minWidth: "300px" }, isXS && { ml: 1, mr: 1 }]}>
      <Typography>
        Check that I'm alive{" "}
        <strong>{Object.values(checkFreqLabels)[checkFreq]}</strong>
        <Tooltip
          arrow
          title={`Next check: ${nextCheck.toLocaleDateString()}`}
          placement={isXS ? "top" : "right"}
          sx={{ ml: 1 }}
        >
          <Icon fontSize="small" className="material-symbols-outlined">
            info
          </Icon>
        </Tooltip>
      </Typography>
      <Slider
        value={checkFreq}
        min={0}
        step={1}
        max={checkFreqMarks.length - 1}
        marks={checkFreqMarks}
        onChange={({}, value) => {
          if (typeof value === "number") {
            setCheckFreq(value);
          }
        }}
        onChangeCommitted={handleUpdate}
        valueLabelDisplay="off"
      />
      <Typography mt={2}>
        Consider me dead after <strong>{deadlineDays}</strong> day
        {deadlineDays > 1 ? "s " : " "}
        without response
      </Typography>
      <Slider
        value={deadlineDays}
        min={1}
        step={1}
        max={14}
        marks
        onChange={({}, value) => {
          if (typeof value === "number") {
            setDeadlineDays(value);
          }
        }}
        onChangeCommitted={handleUpdate}
        valueLabelDisplay="off"
      />
      <Typography mt={2}>
        Make <strong>{attemptsCount}</strong> attempt
        {attemptsCount > 1 ? "s" : ""} during {deadlineDays} day
        {deadlineDays > 1 ? "s" : ""}
      </Typography>
      <Slider
        value={attemptsCount}
        min={1}
        step={1}
        max={5}
        marks
        onChange={({}, value) => {
          if (typeof value === "number") {
            setAttemptsCount(value);
          }
        }}
        onChangeCommitted={handleUpdate}
        valueLabelDisplay="off"
      />
    </Box>
  );
};

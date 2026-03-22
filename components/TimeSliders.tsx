'use client'

import { Box, Slider, Typography, Tooltip, useTheme, useMediaQuery } from '@mui/material'
import Icon from '@mui/material/Icon'
import { useState } from 'react'

type CheckFreqCode = 'day' | 'week' | 'month' | 'quarter' | 'year'

const checkFreqLabels: Record<CheckFreqCode, string> = {
  day: 'daily',
  week: 'weekly',
  month: 'monthly',
  quarter: 'quarterly',
  year: 'yearly',
}

const checkFreqMarks = (['day', 'week', 'month', 'quarter', 'year'] as CheckFreqCode[]).map(
  (key, index) => ({
    value: index,
    label: checkFreqLabels[key],
  })
)

const defaultCheckFreqIndex = 2

interface TimeSlidersProps {
  checkFreqCode: CheckFreqCode
  deadlineDays: number
  attemptsCount: number
  nextCheck: Date
  onUpdate: (checkFreq: CheckFreqCode, deadlineDays: number, attemptsCount: number) => void
}

export function TimeSliders({
  checkFreqCode: initialCheckFreqCode,
  deadlineDays: initialDeadlineDays,
  attemptsCount: initialAttemptsCount,
  nextCheck,
  onUpdate,
}: TimeSlidersProps) {
  const theme = useTheme()
  const isXS = useMediaQuery(theme.breakpoints.only('xs'))

  const initialIndex = (Object.keys(checkFreqLabels) as CheckFreqCode[]).indexOf(
    initialCheckFreqCode
  )
  const [checkFreqIndex, setCheckFreqIndex] = useState(
    initialIndex >= 0 ? initialIndex : defaultCheckFreqIndex
  )
  const [deadlineDays, setDeadlineDays] = useState(initialDeadlineDays)
  const [attemptsCount, setAttemptsCount] = useState(initialAttemptsCount)

  const checkFreqCode = (Object.keys(checkFreqLabels) as CheckFreqCode[])[checkFreqIndex]

  const handleUpdate = () => {
    onUpdate(checkFreqCode, deadlineDays, attemptsCount)
  }

  return (
    <Box sx={[!isXS && { minWidth: '300px' }, isXS && { ml: 1, mr: 1 }]}>
      <Typography>
        Check that I&apos;m alive <strong>{Object.values(checkFreqLabels)[checkFreqIndex]}</strong>
        <Tooltip
          arrow
          title={`Next check: ${nextCheck.toLocaleDateString()}`}
          placement={isXS ? 'top' : 'right'}
          sx={{ ml: 1 }}
        >
          <Icon fontSize="small" className="material-symbols-outlined">
            info
          </Icon>
        </Tooltip>
      </Typography>
      <Slider
        value={checkFreqIndex}
        min={0}
        step={1}
        max={checkFreqMarks.length - 1}
        marks={checkFreqMarks}
        onChange={(_, value) => {
          if (typeof value === 'number') {
            setCheckFreqIndex(value)
          }
        }}
        onChangeCommitted={handleUpdate}
        valueLabelDisplay="off"
      />
      <Typography mt={2}>
        Consider me dead after <strong>{deadlineDays}</strong> day
        {deadlineDays > 1 ? 's ' : ' '}
        without response
      </Typography>
      <Slider
        value={deadlineDays}
        min={1}
        step={1}
        max={14}
        marks
        onChange={(_, value) => {
          if (typeof value === 'number') {
            setDeadlineDays(value)
          }
        }}
        onChangeCommitted={handleUpdate}
        valueLabelDisplay="off"
      />
      <Typography mt={2}>
        Make <strong>{attemptsCount}</strong> attempt
        {attemptsCount > 1 ? 's' : ''} during {deadlineDays} day
        {deadlineDays > 1 ? 's' : ''}
      </Typography>
      <Slider
        value={attemptsCount}
        min={1}
        step={1}
        max={5}
        marks
        onChange={(_, value) => {
          if (typeof value === 'number') {
            setAttemptsCount(value)
          }
        }}
        onChangeCommitted={handleUpdate}
        valueLabelDisplay="off"
      />
    </Box>
  )
}

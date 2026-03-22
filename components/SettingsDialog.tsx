'use client'

import { useState } from 'react'
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
  onUnregister: () => Promise<void>
  repo: { owner: string; name: string } | null
  workflow: { name: string } | null
}

export function SettingsDialog({
  open,
  onClose,
  onUnregister,
  repo,
  workflow,
}: SettingsDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleUnregister = async () => {
    setLoading(true)
    try {
      await onUnregister()
    } finally {
      setLoading(false)
    }
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        {repo && workflow ? (
          <>
            <Typography gutterBottom>Your last will is set.</Typography>
            <Typography>Repo: {repo.name}</Typography>
            <Typography>Owner: {repo.owner}</Typography>
            <Typography>Workflow: {workflow.name}</Typography>
          </>
        ) : (
          <Typography>No workflow registered yet.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        {repo && (
          <Button variant="outlined" color="error" onClick={handleUnregister} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Unregister workflow'}
          </Button>
        )}
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

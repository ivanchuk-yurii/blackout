'use client'

import { useState } from 'react'
import Modal from './ui/Modal'
import Input from './ui/Input'
import Button from './ui/Button'
import { useUser } from '@/context/UserContext'

export default function NamePrompt() {
  const { user, loading, initUser } = useUser()
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (loading || user) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Please enter your name')
      return
    }
    setSubmitting(true)
    try {
      await initUser(trimmed)
    } catch {
      setError('Something went wrong, try again')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={true} onClose={() => {}} title="What's your name?">
      <p className="text-gray-400 text-sm mb-4">
        No account needed — just tell us what to call you tonight.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          placeholder="Your name"
          value={name}
          onChange={e => { setName(e.target.value); setError('') }}
          error={error}
          autoFocus
          maxLength={30}
        />
        <Button type="submit" size="lg" loading={submitting}>
          Let's go
        </Button>
      </form>
    </Modal>
  )
}

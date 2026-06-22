'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { BarPhoto } from '@/types'

interface PhotoBoothProps {
  barId: string
  userId: string
  onPhotoTaken: (photo: BarPhoto) => void
  onClose: () => void
}

type Stage = 'preview' | 'countdown' | 'flash' | 'saving'

export default function PhotoBooth({ barId, userId, onPhotoTaken, onClose }: PhotoBoothProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [stage, setStage] = useState<Stage>('preview')
  const [countdown, setCountdown] = useState(3)
  const [error, setError] = useState('')

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => startCountdown()
      }
    } catch {
      setError('Camera access denied.')
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop())
  }

  function startCountdown() {
    setStage('countdown')
    let count = 3
    setCountdown(count)
    const tick = setInterval(() => {
      count--
      if (count > 0) {
        setCountdown(count)
      } else {
        clearInterval(tick)
        captureAndSave()
      }
    }, 1000)
  }

  async function captureAndSave() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0)

    setStage('flash')

    canvas.toBlob(async blob => {
      if (!blob) { onClose(); return }
      setStage('saving')
      try {
        const fileName = `${barId}/${Date.now()}.jpg`
        const { error: uploadErr } = await supabase.storage
          .from('bar-photos')
          .upload(fileName, blob, { contentType: 'image/jpeg' })
        if (uploadErr) throw uploadErr

        const { data, error: dbErr } = await supabase
          .from('bar_photos')
          .insert({ bar_id: barId, user_id: userId, storage_path: fileName })
          .select('*, user:users(name)')
          .single()
        if (dbErr) throw dbErr

        onPhotoTaken(data as BarPhoto)
        onClose()
      } catch {
        setError('Failed to save photo.')
        onClose()
      }
    }, 'image/jpeg', 0.9)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 p-2 text-white/70 hover:text-white"
      >
        <X size={26} />
      </button>

      <div className="flex-1 relative overflow-hidden bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />

        {stage === 'flash' && (
          <div className="absolute inset-0 bg-white z-10" />
        )}

        {stage === 'countdown' && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <span
              key={countdown}
              className="text-white font-black drop-shadow-2xl select-none"
              style={{ fontSize: 'min(50vw, 50vh)', lineHeight: 1 }}
            >
              {countdown}
            </span>
          </div>
        )}

        {stage === 'saving' && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50">
            <span className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="absolute bottom-4 left-4 right-4 z-20 bg-red-900/80 border border-red-500/50 rounded-xl p-3 text-center">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

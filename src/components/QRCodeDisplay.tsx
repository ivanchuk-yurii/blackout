'use client'

import { QRCodeSVG } from 'qrcode.react'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface QRCodeDisplayProps {
  url: string
  title?: string
}

export default function QRCodeDisplay({ url, title }: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {title && <p className="text-sm text-gray-400">{title}</p>}
      <div className="bg-white p-4 rounded-2xl">
        <QRCodeSVG value={url} size={200} />
      </div>
      <button
        onClick={copyLink}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
        {copied ? 'Copied!' : 'Copy link'}
      </button>
    </div>
  )
}

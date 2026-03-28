import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface BarcodeScannerProps {
  onScan: (code: string) => void
  active: boolean
  containerId?: string
}

export function BarcodeScanner({ onScan, active, containerId = 'barcode-reader' }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const lastScan = useRef<string>('')
  const cooldown = useRef(false)
  const starting = useRef(false)

  useEffect(() => {
    if (!active) {
      const s = scannerRef.current
      if (s) {
        s.stop().catch(() => {}).finally(() => {
          scannerRef.current = null
          starting.current = false
        })
      }
      return
    }

    // Prevent double-start
    if (starting.current || scannerRef.current) return
    starting.current = true

    // Clear any leftover HTML from a previous instance
    const el = document.getElementById(containerId)
    if (el) el.innerHTML = ''

    setCameraError(null)
    const scanner = new Html5Qrcode(containerId)
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 120 } },
        (decodedText) => {
          if (cooldown.current || decodedText === lastScan.current) return
          lastScan.current = decodedText
          cooldown.current = true
          onScan(decodedText)
          setTimeout(() => {
            cooldown.current = false
            lastScan.current = ''
          }, 2000)
        },
        () => {},
      )
      .catch(() => {
        setCameraError('Camera access denied or unavailable. Use manual entry below.')
        starting.current = false
        scannerRef.current = null
      })

    return () => {
      scannerRef.current?.stop().catch(() => {})
      scannerRef.current = null
      starting.current = false
    }
  }, [active, containerId, onScan])

  return (
    <div className="w-full">
      <div
        id={containerId}
        className="w-full rounded-lg bg-black"
        style={{ minHeight: '220px' }}
      />
      {cameraError && (
        <p className="text-sm text-red-600 text-center mt-2">{cameraError}</p>
      )}
    </div>
  )
}

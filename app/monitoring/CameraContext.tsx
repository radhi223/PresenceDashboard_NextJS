"use client"

import React, { createContext, useContext, useRef, useState, useCallback } from 'react'

interface DetectionResult {
  user_id?: string
  visitor_id?: string
  distance: number
  bounding_box: {
    x: number
    y: number
    width: number
    height: number
  }
}

interface ApiResponse {
  status: string
  results: DetectionResult[]
}

interface CameraContextType {
  isLive: boolean
  currentDetections: any[]
  latestResults: DetectionResult[]
  startCamera: () => Promise<void>
  stopCamera: () => void
  getVideoStream: () => MediaStream | null
}

const CameraContext = createContext<CameraContextType | undefined>(undefined)

// Generate random MongoDB ObjectID
const generateObjectId = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0')
  const randomHex = () => Math.floor(Math.random() * 16).toString(16)
  return timestamp + Array.from({ length: 16 }, randomHex).join('')
}

export function CameraProvider({ children }: { children: React.ReactNode }) {
  const [isLive, setIsLive] = useState(false)
  const [currentDetections, setCurrentDetections] = useState<any[]>([])
  const [latestResults, setLatestResults] = useState<DetectionResult[]>([])
  
  const streamRef = useRef<MediaStream | null>(null)
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const hiddenVideoRef = useRef<HTMLVideoElement | null>(null)
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null)

  // Fetch user name by ID
  const fetchUserName = async (userId: string): Promise<string> => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/users/${userId}`)
      if (response.ok) {
        const data = await response.json()
        return data.name || `User ${userId.substring(0, 8)}`
      }
    } catch (error) {
      console.error('Error fetching user name:', error)
    }
    return `User ${userId.substring(0, 8)}`
  }

  // Update current detections
  const updateDetections = async (results: DetectionResult[]) => {
    const detections = await Promise.all(
      results.map(async (result, index) => {
        let name = ''
        let type = ''
        let distance = 'NULL'
        
        if (result.user_id) {
          const userName = await fetchUserName(result.user_id)
          name = userName
          type = 'Student'
          distance = result.distance.toFixed(3)
        }

        return {
          id: index,
          name,
          type,
          distance,
        }
      })
    )

    setCurrentDetections(detections)
  }

  // Capture and send frame to API
  const captureAndSendFrame = useCallback(async () => {
    if (!hiddenVideoRef.current || !hiddenCanvasRef.current) return
    if (!streamRef.current) return

    const video = hiddenVideoRef.current
    const canvas = hiddenCanvasRef.current
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    // Set canvas to target resolution
    canvas.width = 1280
    canvas.height = 720

    // Draw current video frame
    ctx.drawImage(video, 0, 0, 1280, 720)

    // Convert to JPEG Base64 with 85% quality
    canvas.toBlob(
      async (blob) => {
        if (!blob) return

        const reader = new FileReader()
        reader.onloadend = async () => {
          const base64String = (reader.result as string).split(',')[1]

          try {
            const response = await fetch('http://127.0.0.1:8000/face/uploadmany', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                class_id: generateObjectId(),
                image_base64: base64String,
              }),
            })

            if (response.ok) {
              const data: ApiResponse = await response.json()
              
              if (data.status === 'success' && data.results.length > 0) {
                setLatestResults(data.results)
                updateDetections(data.results)
              } else {
                setLatestResults([])
                setCurrentDetections([])
              }
            }
          } catch (error) {
            console.error('API Error:', error)
          }
        }
        reader.readAsDataURL(blob)
      },
      'image/jpeg',
      0.85
    )
  }, [])

  const startCamera = useCallback(async () => {
    if (isLive) return // Already running

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720, frameRate: 30 },
        audio: false 
      })
      
      // Create hidden video element if not exists
      if (!hiddenVideoRef.current) {
        hiddenVideoRef.current = document.createElement('video')
        hiddenVideoRef.current.autoplay = true
        hiddenVideoRef.current.playsInline = true
        hiddenVideoRef.current.muted = true
        hiddenVideoRef.current.style.display = 'none'
        document.body.appendChild(hiddenVideoRef.current)
      }

      // Create hidden canvas if not exists
      if (!hiddenCanvasRef.current) {
        hiddenCanvasRef.current = document.createElement('canvas')
        hiddenCanvasRef.current.style.display = 'none'
        document.body.appendChild(hiddenCanvasRef.current)
      }

      hiddenVideoRef.current.srcObject = stream
      streamRef.current = stream
      setIsLive(true)
      
      // Start capturing frames every 2 seconds
      captureIntervalRef.current = setInterval(() => {
        captureAndSendFrame()
      }, 2000)

      console.log('[CameraContext] Camera started globally')
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Unable to access camera. Please check permissions.")
    }
  }, [isLive, captureAndSendFrame])

  const stopCamera = useCallback(() => {
    // Clear capture interval
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current)
      captureIntervalRef.current = null
    }
    
    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (hiddenVideoRef.current) {
      hiddenVideoRef.current.srcObject = null
    }
    
    // Clear detections
    setCurrentDetections([])
    setLatestResults([])
    setIsLive(false)

    console.log('[CameraContext] Camera stopped globally')
  }, [])

  const getVideoStream = useCallback(() => {
    return streamRef.current
  }, [])

  return (
    <CameraContext.Provider value={{ 
      isLive, 
      currentDetections, 
      latestResults,
      startCamera, 
      stopCamera,
      getVideoStream 
    }}>
      {children}
    </CameraContext.Provider>
  )
}

export function useCamera() {
  const context = useContext(CameraContext)
  if (context === undefined) {
    throw new Error('useCamera must be used within a CameraProvider')
  }
  return context
}

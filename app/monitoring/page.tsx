"use client"

import { useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Square, User } from "lucide-react"
import { useCamera } from "./CameraContext"
import { TrendingUp, Home, ChevronDown } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

interface DetectionResult {
  user_id?: string
  distance: number
  bounding_box: {
    x: number
    y: number
    width: number
    height: number
  }
}

export default function MonitorPage() {
  const { isLive, currentDetections, latestResults, startCamera, stopCamera, getVideoStream } = useCamera()
  const videoRef = useRef<HTMLVideoElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)

  // Sync video stream when component mounts or isLive changes
  useEffect(() => {
    if (videoRef.current && isLive) {
      const stream = getVideoStream()
      if (stream && videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream
      }
    } else if (videoRef.current && !isLive) {
      videoRef.current.srcObject = null
    }
  }, [isLive, getVideoStream])

  // Update bounding boxes when results change
  useEffect(() => {
    if (latestResults.length > 0) {
      drawBoundingBoxes(latestResults)
    } else {
      clearBoundingBoxes()
    }
  }, [latestResults])

  // Draw bounding boxes on overlay canvas
  const drawBoundingBoxes = (results: DetectionResult[]) => {
    if (!overlayCanvasRef.current || !videoRef.current) return

    const canvas = overlayCanvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Match canvas size to video display size
    const rect = video.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    // Calculate scale factors
    const scaleX = rect.width / 1280
    const scaleY = rect.height / 720

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    results.forEach((result) => {
      const { x, y, width, height } = result.bounding_box
      
      // Scale coordinates to match display size
      const scaledX = x * scaleX
      const scaledY = y * scaleY
      const scaledWidth = width * scaleX
      const scaledHeight = height * scaleY

      // Determine color and label
      let color = '#eab308' // Yellow default for visitor
      let label = ''
      
      if (result.user_id) {
        // Student: Green with similarity
        color = '#22c55e'
        label = `Similarity: ${result.distance.toFixed(3)}`
      } 
      
      // Draw bounding box
      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight)

      // Draw label
      ctx.fillStyle = color
      ctx.font = 'bold 14px sans-serif'
      ctx.fillText(label, scaledX, scaledY - 5)
    })
  }

  const clearBoundingBoxes = () => {
    if (!overlayCanvasRef.current) return
    const ctx = overlayCanvasRef.current.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height)
    }
  }

  return (
    <DashboardLayout>
        {/* Breadcrumb */}
        <div className="px-6 md:px-8 py-4 border-b border-slate-200 bg-white">
            <div className="flex items-center gap-2 text-sm text-slate-600">
            <Home size={16} />
            <span>/</span>
            <span className="font-medium text-slate-900">Monitoring</span>
            </div>
        </div>
        
        <div className="p-8 max-w-5xl mx-auto space-y-8">
        <div className="relative aspect-video bg-slate-900 rounded-3xl overflow-hidden flex flex-col items-center justify-center border-4 border-white shadow-xl">
            <video
            ref={videoRef}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ display: isLive ? 'block' : 'none' }}
            />
            <canvas
            ref={overlayCanvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ display: isLive ? 'block' : 'none' }}
            />
            {isLive && (
            <div className="absolute top-4 left-4 z-10">
                <span className="text-white font-bold flex items-center gap-2 bg-black/50 px-3 py-2 rounded-lg">
                <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                LIVE FEED ACTIVE
                </span>
            </div>
            )}
            {!isLive && (
            <div className="text-slate-400 flex flex-col items-center gap-4">
                <h2 className="text-6xl font-black tracking-tighter opacity-20">LIVE CAMERA</h2>
            </div>
            )}
        </div>

        <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Camera Controls</p>
            <div className="grid grid-cols-2 gap-4">
            <Button
                variant={isLive ? "outline" : "secondary"}
                className="h-12 text-sm font-semibold rounded-xl"
                onClick={startCamera}
                disabled={isLive}
            >
                <Play className="mr-2 h-4 w-4" /> Start Camera
            </Button>
            <Button
                variant={!isLive ? "outline" : "secondary"}
                className="h-12 text-sm font-semibold rounded-xl"
                onClick={stopCamera}
                disabled={!isLive}
            >
                <Square className="mr-2 h-4 w-4" /> Stop Camera
            </Button>
            </div>
            <p className="text-xs text-slate-400">Choose an option.</p>
        </div>

        <div className="space-y-6">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900">Currently Detected</h2>
            <div className="space-y-3">
            {currentDetections.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                <User className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No faces detected</p>
                <p className="text-sm">Start the camera to begin face detection</p>
                </div>
            ) : (
                currentDetections.map((detection) => (
                <Card key={detection.id} className="overflow-hidden border-slate-200/60 hover:border-slate-300 transition-colors">
                    <CardContent className="p-4 flex gap-4 items-center">
                    <div className="h-20 w-20 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                        <User className="h-10 w-10 text-slate-300" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <h3 className="font-bold text-lg text-slate-900">{detection.name}</h3>
                        <p className="text-sm text-slate-500 font-medium italic">
                        Distance: <span className="font-bold">{detection.distance}</span>
                        </p>
                        <Badge 
                        variant="secondary" 
                        className={`font-bold px-3 py-0.5 border-none ${
                            detection.type === 'Student' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                        >
                        {detection.type}
                        </Badge>
                    </div>
                    </CardContent>
                </Card>
                ))
            )}
            </div>
        </div>
        </div>
        {/* Footer */}
        <div className="bg-white border-t border-slate-200 px-6 md:px-8 py-4 text-center">
            <p className="text-xs text-slate-500">© 2026 SIAK Universitas Pendidikan Indonesia. All rights reserved.</p>
        </div>
    </DashboardLayout> 
  )
}
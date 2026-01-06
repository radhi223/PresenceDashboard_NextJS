import { CameraProvider } from './CameraContext'

export default function MonitoringLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <CameraProvider>{children}</CameraProvider>
}

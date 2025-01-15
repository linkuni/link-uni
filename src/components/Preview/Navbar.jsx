import { ZoomIn, ZoomOut, Flag, ChevronLeft } from 'lucide-react'
import { Button } from "../ui/button"

export default function Navbar({numPages, pageNumber, onZoomIn, onZoomOut}) {
  return (
    <nav className="flex h-12 items-center justify-between bg-[#0A0A0A] px-4">
      {/* Left side */}
      <div className="flex items-center gap-2">

        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={() => window.location.reload()}
          
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Go back</span>
        </Button>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2">
        <Button
            onClick={onZoomOut}
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
        >
          <ZoomOut className="h-5 w-5" />
          <span className="sr-only">Zoom out</span>
        </Button>
        <Button
            onClick={onZoomIn}
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
        >
          <ZoomIn className="h-5 w-5" />
          <span className="sr-only">Zoom in</span>
        </Button>
        <div className="flex items-center gap-1 px-3 text-sm text-white">
          <span>{pageNumber}</span>
          <span>/</span>
          <span>{numPages}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
        >
          <Flag className="h-5 w-5" />
          <span className="sr-only">Report</span>
        </Button>
      </div>
    </nav>
  )
}


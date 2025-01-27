import { useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/esm/Page/AnnotationLayer.css"
import "react-pdf/dist/esm/Page/TextLayer.css"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Loader2, ZoomIn, ZoomOut } from "lucide-react"
import { ErrorBoundary } from "react-error-boundary"

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';


const PDFViewer = ({ pdfUrl = "/sample.pdf" }) => {
  const [numPages, setNumPages] = useState(null)
  const [scale, setScale] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)

  function onDocumentLoadSuccess(numPages) {
    setNumPages(numPages)
  }

  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.1, 3))
  }

  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.1, 0.5))
  }

  const handlePageChange = (e) => {
    const page = parseInt(e.target.value)
    if (page > 0 && page <= (numPages || 0)) {
      setCurrentPage(page)
    }
  }

function fallbackRender({ error, resetErrorBoundary }) {
  // Call resetErrorBoundary() to reset the error boundary and retry the render.

  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: "red" }}>{error.message}</pre>
    </div>
  );
}

  return (
    <ErrorBoundary FallbackComponent={fallbackRender}>
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between w-full mb-4">
        <div className="flex items-center space-x-2">
          <Button onClick={handleZoomOut} variant="outline" size="icon">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button onClick={handleZoomIn} variant="outline" size="icon">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            min={1}
            max={numPages || 1}
            value={currentPage}
            onChange={handlePageChange}
            className="w-16"
          />
          <span className="text-sm">of {numPages}</span>
        </div>
      </div>
      <div
        className="w-full overflow-auto"
        style={{
          height: "calc(100vh - 100px)",
          scrollBehavior: "smooth",
        }}
      >
        <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess} loading={<Loader2 className="animate-spin" />}>
          {Array.from(new Array(numPages), (el, index) => (
            <Page key={`page_${index + 1}`} pageNumber={index + 1} scale={scale} className="mb-4" />
          ))}
        </Document>
      </div>
    </div>
    </ErrorBoundary>
  )
}

export default PDFViewer


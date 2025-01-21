import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import React, { useState, useRef, useEffect } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/esm/Page/AnnotationLayer.css"
import "react-pdf/dist/esm/Page/TextLayer.css"
import Navbar from "./Navbar"
import { ErrorBoundary } from "react-error-boundary"
import Lottie from "lottie-react"
import loadingAnimation from "./loading.json"

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"

function fallbackRender({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>
        Something went wrong: <span className="text-red-500">PDF render failed</span>
      </p>
    </div>
  )
}

const PDFViewer = ({ url }) => {
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pageWidth, setPageWidth] = useState(0)
  const [scale, setScale] = useState(1)
  const scrollContainerRef = useRef(null)

  useEffect(() => {
    const handleResize = () => {
      setPageWidth(window.innerWidth)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  function goToNextPage() {
    if (pageNumber >= numPages) return
    setPageNumber((prevPageNumber) => prevPageNumber + 1)
  }

  function goToPreviousPage() {
    if (pageNumber <= 1) return
    setPageNumber((prevPageNumber) => prevPageNumber - 1)
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
    setError(null)
    setIsLoading(false)
  }

  function onPageLoadSuccess() {
    setPageWidth(window.innerWidth)
    setIsLoading(false)
  }

  const onDocumentLoadError = (error) => {
    setError(error.message)
    setIsLoading(false)
  }

  const options = {
    cMapUrl: "cmaps/",
    cMapPacked: true,
    standardFontDataUrl: "standard_fonts/",
  }

  const zoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.1, 2.0))
  }

  const zoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.1, 0.5))
  }

  const resetZoom = () => {
    setScale(1)
  }

  return (
    <>
      <ErrorBoundary FallbackComponent={fallbackRender}>
        <Navbar
          numPages={numPages}
          pageNumber={pageNumber}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onResetZoom={resetZoom}
        />
        <div
          hidden={isLoading}
          style={{ height: "calc(100vh - 64px)" }}
          className="relative overflow-x-auto"
          ref={scrollContainerRef}
        >
          <div className="flex items-center">
            <button
              onClick={goToPreviousPage}
              disabled={pageNumber <= 1}
              className="sticky left-0 z-10 h-[calc(100vh - 64px)] px-2 py-24 text-gray-400 hover:text-gray-50 focus:z-20"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon className="h-10 w-10" aria-hidden="true" />
            </button>
            <div className="flex h-full justify-center mx-auto">
              <Document file={url} onLoadSuccess={onDocumentLoadSuccess} options={options} renderMode="canvas" className="">
                {Array.from(new Array(numPages), (el, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                    onLoadSuccess={onPageLoadSuccess}
                    onRenderError={() => setIsLoading(false)}
                    width={Math.max(pageWidth * 0.8, 390) * scale}
                    className="mx-2"
                  />
                ))}
              </Document>
            </div>
            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="sticky right-0 z-10 h-[calc(100vh - 64px)] px-2 py-24 text-gray-400 hover:text-gray-50 focus:z-20"
            >
              <span className="sr-only">Next</span>
              <ChevronRightIcon className="h-10 w-10" aria-hidden="true" />
            </button>
          </div>
        </div>
        {
          isLoading && (
            <div className="flex items-center justify-center h-screen">
              <Lottie
                animationData={loadingAnimation}
                className="flex justify-center items-center h-1/2"
                loop={true}
              />
            </div>
          )
        }
      </ErrorBoundary>
    </>
  )
}

export default PDFViewer


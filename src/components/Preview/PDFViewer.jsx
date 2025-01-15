import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import Navbar from './Navbar';

// Set worker source path to public folder
// pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';


const PDFViewer = ({url}) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageWidth, setPageWidth] = useState(0);
  const [scale, setScale] = useState(1);

    // Go to next page
    function goToNextPage() {
        if (pageNumber >= numPages) return;
        setPageNumber((prevPageNumber) => prevPageNumber + 1);
      }
    
      function goToPreviousPage() {
        if (pageNumber <= 1) return;
        setPageNumber((prevPageNumber) => prevPageNumber - 1);
      }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setError(null);
    setIsLoading(false);
  };

  function onPageLoadSuccess() {
    setPageWidth(window.innerWidth);
    setIsLoading(false);
  }

  const onDocumentLoadError = (error) => {
    setError(error.message);
    setIsLoading(false);
  };

  const options = {
    cMapUrl: "cmaps/",
    cMapPacked: true,
    standardFontDataUrl: "standard_fonts/",
  };

  const zoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.1, 2.0)); // Max zoom 200%
  };

  const zoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.1, 0.5)); // Min zoom 50%
  };

  const resetZoom = () => {
    setScale(1);
  };

  return (
<>
    <Navbar 
    numPages={numPages} 
    pageNumber={pageNumber}
    onZoomIn={zoomIn}
    onZoomOut={zoomOut}
    onResetZoom={resetZoom}
    postId={postId}
     />
        <div
        hidden={isLoading}
        style={{ height: "calc(100vh - 64px)" }}
        className="flex items-center"
      >
        <div
          className={`absolute z-10 flex w-full items-center justify-between px-2`}
        >
          <button
            onClick={goToPreviousPage}
            disabled={pageNumber <= 1}
            className="h-[calc(100vh - 64px)] relative px-2 py-24 text-gray-400 hover:text-gray-50 focus:z-20"
          >
            <span className="sr-only">Previous</span>
            <ChevronLeftIcon className="h-10 w-10" aria-hidden="true" />
          </button>
          <button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="h-[calc(100vh - 64px)] relative px-2 py-24 text-gray-400 hover:text-gray-50 focus:z-20"
          >
            <span className="sr-only">Next</span>
            <ChevronRightIcon className="h-10 w-10" aria-hidden="true" />
          </button>
        </div>

        <div className="mx-auto flex h-full justify-center">
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            options={options}
            renderMode="canvas"
            className=""
          >
            <Page
              className=""
              key={pageNumber}
              pageNumber={pageNumber}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              onLoadSuccess={onPageLoadSuccess}
              onRenderError={() => setIsLoading(false)}
              width={Math.max(pageWidth * 0.8, 390)*scale}
            />
          </Document>
        </div>
      </div>
</>

  );
};

export default PDFViewer;
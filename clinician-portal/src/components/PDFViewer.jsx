// src/components/PDFViewer.jsx
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function PDFViewer() {
  const { filename } = useParams();
  
  return (
    <div className="flex flex-col h-screen">
      {/* Optional: Add a header with back button */}
      <div className="bg-gray-900 p-4 flex items-center gap-4">
        <Link 
          to="/" 
          className="text-white hover:text-gray-300 flex items-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </Link>
        <h1 className="text-white font-medium">
          {filename.replace('.pdf', '').replace(/-/g, ' ')}
        </h1>
      </div>
      
      {/* PDF Viewer */}
      <div className="flex-1 w-full">
        <iframe
          src={`/resources/${filename}#view=FitH`}
          className="h-full w-full"
          title={`PDF: ${filename}`}
          style={{ border: 'none' }}
        />
      </div>
    </div>
  );
}

export default PDFViewer;
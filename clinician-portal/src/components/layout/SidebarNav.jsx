import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';
import { pdfApis } from '../../services/api';



export default function SidebarNav({ items, onItemClick }) {
  const location = useLocation();

  const [resourcesOpen, setResourcesOpen] = useState(true);
  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);

  useEffect(() => {
    const loadResources = async () => {
      try {
        setResourcesLoading(true);

        const response = await pdfApis.getAll();

        console.log('Resources API:', response.data);

        setResources(response.data?.data || []);
      } catch (error) {
        console.error('Failed to load resources:', error);
      } finally {
        setResourcesLoading(false);
      }
    };

    loadResources();
  }, []);

  const openPdf = async (filename) => {
    // Open immediately because browsers can block a new tab
    // if window.open happens after an async request.
    const newTab = window.open('', '_blank');

    try {
      const response = await pdfApis.getResourcePdf(filename);

      const blob = response.data;

      const pdfBlob = new Blob([blob], {
        type: 'application/pdf',
      });

      const pdfUrl = URL.createObjectURL(pdfBlob);

      if (newTab) {
        newTab.location.href = pdfUrl;

        // Release object URL after browser has had time to load it
        setTimeout(() => {
          URL.revokeObjectURL(pdfUrl);
        }, 60000);
      } else {
        // Popup was blocked
        window.location.href = pdfUrl;

        setTimeout(() => {
          URL.revokeObjectURL(pdfUrl);
        }, 60000);
      }
    } catch (error) {
      console.error('Failed to open PDF:', error);

      if (newTab) {
        newTab.close();
      }
    }
  };

  return (
    <nav className="flex-1 space-y-0.5 p-3 pt-4 overflow-auto">

      <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-400/70">
        Main Menu
      </p>

      {items.map((item) => {
        const isActive = location.pathname === item.path;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              isActive
                ? 'bg-white/10 text-white'
                : 'text-brand-300 hover:bg-white/5 hover:text-white'
            }`}
            onClick={onItemClick}
          >
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-brand-400" />
            )}

            <item.icon
              className={`h-4 w-4 shrink-0 transition-colors ${
                isActive
                  ? 'text-brand-400'
                  : 'text-brand-400/60 group-hover:text-brand-400'
              }`}
            />

            {item.label}
          </Link>
        );
      })}

      {/* Resources */}
      <div className="pt-3">

        <button
          type="button"
          onClick={() => setResourcesOpen((o) => !o)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-300 transition-all hover:bg-white/5 hover:text-white"
        >
          <FileText className="h-4 w-4 shrink-0 text-brand-400/60" />

          <span className="flex-1 text-left">
            Resources
          </span>

          {resourcesOpen ? (
            <ChevronUp className="h-4 w-4 text-brand-400/60" />
          ) : (
            <ChevronDown className="h-4 w-4 text-brand-400/60" />
          )}
        </button>

        {resourcesOpen && (
          <div className="mt-0.5 space-y-0.5 pl-4">

            {resourcesLoading && (
              <div className="px-3 py-2 text-sm text-brand-300/60">
                Loading resources...
              </div>
            )}

            {!resourcesLoading && resources.length === 0 && (
              <div className="px-3 py-2 text-sm text-brand-300/60">
                No resources available
              </div>
            )}

            {resources.map((resource) => (
              <button
                key={resource.file}
                type="button"
                onClick={() => openPdf(resource.file)}
                className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-brand-300 transition-all hover:bg-white/5 hover:text-white"
              >
                <FileText
                  className="h-4 w-4 shrink-0 text-brand-400/60 transition-colors group-hover:text-brand-400"
                />

                <span className="truncate">
                  {resource.label}
                </span>
              </button>
            ))}

          </div>
        )}
      </div>

    </nav>
  );
}
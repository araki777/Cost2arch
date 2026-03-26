import { useEffect, useRef, useState } from "react";
import { instance } from "@viz-js/viz";
import { Loader2, ZoomIn, Download, Maximize2 } from "lucide-react";
import { Button } from "./ui/button";

interface ArchitectureDiagramProps {
  dotCode: string;
  loading?: boolean;
}

export function ArchitectureDiagram({ dotCode, loading }: ArchitectureDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    if (!dotCode) return;

    const render = async () => {
      try {
        const viz = await instance();
        // 出力形式を SVG に明示的に指定
        const svgElement = viz.renderString(dotCode, { format: "svg" });
        setSvg(svgElement);
        setRenderError(null);
      } catch (err) {
        console.error("Viz.js error:", err);
        setRenderError(err instanceof Error ? err.message : "Failed to render diagram");
      }
    };

    render();
  }, [dotCode]);

  if (loading) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-sm">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-50 mb-4" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">
          Architecting Cloud Infrastructure...
        </p>
      </div>
    );
  }

  if (renderError) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-xl bg-red-900/10 border border-red-900/20 p-8">
        <div className="text-center">
          <p className="text-red-400 font-bold mb-2 uppercase tracking-tight">Render Error</p>
          <p className="text-xs text-red-300/70 font-mono">{renderError}</p>
        </div>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-xl bg-slate-900/30 border border-dashed border-slate-800/50">
        <p className="text-sm text-slate-500 font-medium italic">
          Enter budget and activity to generate architecture.
        </p>
      </div>
    );
  }

  return (
    <div className="relative group overflow-hidden rounded-xl border border-slate-700/30 bg-white shadow-2xl transition-all hover:border-primary/50 min-h-[500px] flex flex-col">
      {/* Toolbar */}
      <div className="absolute right-4 top-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-white/90 border-slate-200 text-slate-900 hover:bg-slate-100 shadow-sm">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-white/90 border-slate-200 text-slate-900 hover:bg-slate-100 shadow-sm">
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-white/90 border-slate-200 text-slate-900 hover:bg-slate-100 shadow-sm">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* SVG Container */}
      <div 
        ref={containerRef}
        className="flex-1 w-full p-8 flex justify-center items-center overflow-auto [&>svg]:max-w-full [&>svg]:h-auto transition-transform duration-500 z-10"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      
      {/* Legend / Overlay */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-slate-900/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-900/5 pointer-events-none">
        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Azure Optimized</span>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef, useCallback, Component } from "react";

// ─── Error Boundary ────────────────────────────────────────────────────────

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class PreviewErrorBoundary extends Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error) {
    console.error("[LivePreview ErrorBoundary]", error);
  }

  handleReset = () => this.setState({ hasError: false, errorMessage: "" });

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-[#09090b] text-white gap-4 p-8 text-center">
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-rose-400" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Preview Component Crashed</h3>
            <p className="text-xs text-white/50 font-mono max-w-md break-words bg-white/[0.04] rounded-xl px-4 py-2 mt-2">
              {this.state.errorMessage}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition-all"
          >
            Reload Preview
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
import {
  Laptop,
  Tablet,
  Phone,
  RotateCw,
  Maximize2,
  Terminal,
  Loader2,
  AlertCircle,
  Undo,
  ZoomIn,
  ZoomOut,
  X,
  Wrench,
} from "lucide-react";
import { GeneratedCode, useProjectStore } from "@/store/projectStore";
import { toast } from "sonner";

interface LivePreviewProps {
  code: GeneratedCode;
  activeTab: string;
  onAutoFix?: (errorMessage: string) => void;
}

type ViewportMode = "desktop" | "tablet" | "mobile";

// ─── Max code size limit (500 KB) ───────────────────────────────────────────
const MAX_CODE_BYTES = 512 * 1024;

function LivePreviewInner({ code, activeTab, onAutoFix }: LivePreviewProps) {
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [zoom, setZoom] = useState<number>(1.0);
  const [logs, setLogs] = useState<{ type: "log" | "error" | "warn"; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // Hash-based dedup: skip re-render if compiled source hasn't changed
  const lastSrcHashRef = useRef<string>("");

  const clearLogs = () => setLogs([]);

  // States to completely recreate iframe node on update
  const [iframeKey, setIframeKey] = useState(0);
  const [currentSrcDoc, setCurrentSrcDoc] = useState("");

  // ─── Virtual Multi-File Compiler ─────────────────────────────────────────

  const buildMultiFileDocument = useCallback((
    files: Record<string, string>,
    entryPath: string
  ): string => {
    const filesJson = JSON.stringify(files).replace(/<\/script/gi, "<\\/script");

    const logInterceptor = `
(function() {
  const _log = console.log;
  const _warn = console.warn;
  const _error = console.error;
  
  const send = (type, args) => {
    window.parent.postMessage({
      source: 'cognify-preview',
      type,
      message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')
    }, '*');
  };
  
  console.log = function(...args) { _log.apply(console, args); send('log', args); };
  console.warn = function(...args) { _warn.apply(console, args); send('warn', args); };
  console.error = function(...args) { _error.apply(console, args); send('error', args); };

  window.onerror = (message, source, lineno, colno, error) => {
    send('error', [message + (lineno ? ' (Line ' + lineno + ')' : '')]);
  };

  window.addEventListener('unhandledrejection', (e) => {
    send('error', ['Unhandled Promise: ' + (e.reason?.message || String(e.reason))]);
  });

  window.addEventListener('load', () => {
    window.parent.postMessage({ source: 'cognify-preview', type: 'ready' }, '*');
  });
})();`;

    // Virtual module resolver script injected into the iframe
    const moduleResolver = `
const __FILES__ = JSON.parse(document.getElementById('__cognify-files__').textContent);
const __MODULE_CACHE__ = {};
const __ENTRY__ = ${JSON.stringify(entryPath)};

function assetMimeType(path) {
  if (path.endsWith('.svg')) return 'image/svg+xml';
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
  if (path.endsWith('.webp')) return 'image/webp';
  if (path.endsWith('.gif')) return 'image/gif';
  if (path.endsWith('.ico')) return 'image/x-icon';
  if (path.endsWith('.css')) return 'text/css';
  return 'text/plain';
}

function normalizeAssetPath(src) {
  if (typeof src !== 'string') return '';
  return src
    .replace(/^https?:\\/\\/[^/]+/i, '')
    .replace(/^\\.\\//, '')
    .replace(/^\\//, '');
}

function resolveAssetUrl(src) {
  const normalized = normalizeAssetPath(src);
  if (!normalized || !__FILES__[normalized]) return src;
  return 'data:' + assetMimeType(normalized) + ';charset=utf-8,' + encodeURIComponent(__FILES__[normalized]);
}

const originalCreateElement = React.createElement;
React.createElement = function(type, props, ...children) {
  if (!props || typeof props !== 'object') {
    return originalCreateElement(type, props, ...children);
  }
  const nextProps = { ...props };
  for (const key of ['src', 'href', 'poster']) {
    if (typeof nextProps[key] === 'string') {
      nextProps[key] = resolveAssetUrl(nextProps[key]);
    }
  }
  if (nextProps.style && typeof nextProps.style.backgroundImage === 'string') {
    nextProps.style = {
      ...nextProps.style,
      backgroundImage: nextProps.style.backgroundImage.replace(/url\\((['"]?)(.*?)\\1\\)/g, (_, quote, url) => {
        return 'url("' + resolveAssetUrl(url) + '")';
      }),
    };
  }
  return originalCreateElement(type, nextProps, ...children);
};

function resolveImport(from, importPath) {
  // Handle absolute alias @/ → src/
  if (importPath.startsWith('@/')) {
    importPath = 'src/' + importPath.slice(2);
  }

  // Handle non-relative paths (browser dependency shims)
  if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
    return '__npm__:' + importPath;
  }

  // Resolve relative path
  const dir = from.includes('/') ? from.substring(0, from.lastIndexOf('/')) : '';
  const parts = (dir ? dir + '/' + importPath : importPath).split('/');
  const resolved = [];
  for (const p of parts) {
    if (p === '..') resolved.pop();
    else if (p !== '.') resolved.push(p);
  }
  const candidate = resolved.join('/');

  // Try direct match, then with extensions, then index files
  const extensions = ['', '.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts', '/index.jsx', '/index.js'];
  for (const ext of extensions) {
    if (__FILES__[candidate + ext]) return candidate + ext;
  }
  return candidate;
}

function transpileAndRun(filePath) {
  if (__MODULE_CACHE__[filePath]) return __MODULE_CACHE__[filePath];

  const moduleExports = { default: undefined };
  const cacheEntry = { exports: moduleExports };
  __MODULE_CACHE__[filePath] = cacheEntry;

  const rawCode = __FILES__[filePath];
  if (!rawCode) {
    console.warn('[Preview] File not found:', filePath);
    return cacheEntry;
  }

  // Transpile with Babel
  let transpiledCode;
  try {
    transpiledCode = Babel.transform(rawCode, {
      presets: [
        ['react', { runtime: 'classic' }],
        ['typescript']
      ],
      plugins: [['transform-modules-commonjs', { strictMode: false }]]
    }).code;
  } catch (babelError) {
    console.error('[Preview] Babel error in ' + filePath + ':', babelError.message);
    return cacheEntry;
  }

  const require = (importPath) => {
    // Handle browser-side dependency shims
    if (importPath === 'react') return window.React;
    if (importPath === 'react-dom') return window.ReactDOM;
    if (importPath === 'react-dom/client') return window.ReactDOM;
    if (importPath === 'lucide-react') return window.__LucideReact__;
    if (importPath.startsWith('lucide-react/')) {
      const parts = importPath.split('/');
      const iconFileName = parts[parts.length - 1].replace(/\.[jt]sx?$/, '');
      const pascalName = iconFileName.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
      const iconComponent = window.__LucideReact__[pascalName] || window.__LucideReact__['HelpCircle'] || (() => null);
      return {
        default: iconComponent,
        [pascalName]: iconComponent
      };
    }
    if (importPath === 'framer-motion') {
      const motionProxy = new Proxy({}, {
        get: (_, tagName) => {
          return React.forwardRef(({ animate, initial, transition, exit, whileHover, whileTap, ...props }, ref) => {
            return React.createElement(tagName, { ...props, ref });
          });
        }
      });
      return {
        motion: motionProxy,
        AnimatePresence: ({ children }) => React.createElement(React.Fragment, null, children),
        useAnimation: () => ({ start: async () => {}, stop: () => {} }),
        useMotionValue: (init) => ({ get: () => init, set: () => {} }),
        useTransform: (val) => val,
      };
    }
    if (importPath === 'recharts') {
      const DummyChart = ({ children, data, ...props }) => {
        return React.createElement('div', {
          className: 'w-full h-full flex flex-col items-center justify-center bg-slate-900/50 border border-white/5 rounded-xl p-4 min-h-[200px]',
          style: { width: props.width || '100%', height: props.height || '105%' }
        },
          React.createElement('div', { className: 'text-xs text-white/40 mb-2 font-mono' }, 'Chart Preview'),
          React.createElement('svg', { className: 'w-full h-32 text-indigo-500 overflow-visible' },
            data && Array.isArray(data) ? data.map((d, i) => React.createElement('circle', {
              key: i,
              cx: (i / Math.max(1, data.length - 1)) * 100 + '%',
              cy: 30 + Math.sin(i) * 20 + 20,
              r: 4,
              fill: 'currentColor'
            })) : null
          ),
          React.createElement('div', { className: 'flex gap-2 mt-2' },
            React.Children.map(children, child => {
              if (child && child.props && child.props.dataKey) {
                return React.createElement('span', { className: 'text-[10px] bg-indigo-500/10 px-2 py-0.5 rounded text-indigo-400 font-mono' }, child.props.dataKey);
              }
              return null;
            })
          )
        );
      };
      const DummyComponent = ({ children }) => React.createElement(React.Fragment, null, children);
      return {
        ResponsiveContainer: ({ children, width, height }) => React.createElement('div', { style: { width: width || '100%', height: height || '100%', minHeight: 200 } }, children),
        LineChart: DummyChart,
        BarChart: DummyChart,
        AreaChart: DummyChart,
        PieChart: DummyChart,
        RadarChart: DummyChart,
        Line: DummyComponent,
        Bar: DummyComponent,
        Area: DummyComponent,
        Pie: DummyComponent,
        XAxis: () => null,
        YAxis: () => null,
        CartesianGrid: () => null,
        Tooltip: () => null,
        Legend: () => null,
      };
    }
    if (importPath === 'next/link') return { default: (p) => React.createElement('a', { href: p.href, ...p }, p.children) };
    if (importPath === 'next/image') return { default: (p) => React.createElement('img', p) };
    if (importPath === 'next/navigation') return { useRouter: () => ({ push: () => {}, back: () => {} }), useSearchParams: () => new URLSearchParams(), usePathname: () => '/' };

    const resolved = resolveImport(filePath, importPath);
    if (resolved.startsWith('__npm__:')) {
      console.warn('[Preview] Unresolved npm module:', importPath, '- using empty shim');
      return {};
    }
    return transpileAndRun(resolved).exports;
  };

  // Execute the transpiled module
  try {
    const moduleFunc = new Function('module', 'exports', 'require', 'React', '__filename', transpiledCode);
    moduleFunc(cacheEntry, cacheEntry.exports, require, window.React, filePath);
    // Handle ES module default export pattern
    if (cacheEntry.exports.__esModule && cacheEntry.exports.default) {
      cacheEntry.exports.default = cacheEntry.exports.default;
    }
  } catch (execError) {
    console.error('[Preview] Runtime error in ' + filePath + ':', execError.message);
  }

  return cacheEntry;
}

// Bootstrap: run the entry point
try {
  const entryModule = transpileAndRun(__ENTRY__);
  const AppComponent = entryModule.exports.default || entryModule.exports;
  if (typeof AppComponent === 'function') {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(AppComponent));
  } else {
    console.error('[Preview] Entry module did not export a default React component.');
    document.getElementById('root').innerHTML = '<div style="color:#64748b;padding:20px;text-align:center">No default export found in entry file.</div>';
  }
} catch (bootError) {
  console.error('[Preview] Boot error:', bootError.message);
}
`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lucide-static@0.407.0/font/lucide.css">
  <style>
    body { margin: 0; padding: 0; background-color: #020617; color: #f8fafc; }
    * { box-sizing: border-box; }
  </style>
  <script>${logInterceptor}</script>
</head>
<body>
  <div id="root"></div>
  <script id="__cognify-files__" type="application/json">${filesJson}</script>
  <script>
    // Lucide icon proxy (renders CSS icon font as React component)
    window.__LucideReact__ = new Proxy({}, {
      get: (_, name) => {
        return ({ className, size, style, ...rest } = {}) => {
          const kebab = String(name).replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
          return React.createElement('i', {
            className: ['lucide-' + kebab, className].filter(Boolean).join(' '),
            style: { fontSize: size || 16, width: size || 16, height: size || 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style },
            ...rest
          });
        };
      }
    });
    // Also expose individual icon names for destructured imports like { Sparkles }
    [
      'Sparkles','Check','ChevronDown','ChevronRight','ChevronLeft','ChevronUp',
      'ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Zap','Play','Star','Shield',
      'Users','User','BarChart3','TrendingUp','DollarSign','CheckCircle2','Search',
      'MapPin','Calendar','Heart','Compass','Plus','Trash2','Activity','Settings',
      'Bell','Menu','X','Home','Folder','File','Upload','Download','Share',
      'Lock','Unlock','Eye','EyeOff','Mail','Phone','Globe','Layers','Code2',
      'Terminal','Monitor','Tablet','Smartphone','Maximize2','Minimize2',
      'RefreshCw','RotateCw','Loader2','AlertCircle','Info','Check','Copy',
      'ExternalLink','Link','Bookmark','Tag','Clock','Database','Server',
      'Cpu','Memory','HardDrive','Wifi','Cloud','Sun','Moon','Package',
      'Grid','List','Layout','Sidebar','PanelLeft','PanelRight','Columns',
      'Rows','AlignLeft','AlignCenter','AlignRight','Bold','Italic',
      'Underline','Type','Image','Video','Music','Mic','Volume2','Send',
      'MessageCircle','MessageSquare','Inbox','Archive','Filter','SortAsc',
      'SortDesc','Edit','Edit2','Edit3','Save','Slash','Minus','Dot',
      'Circle','Square','Triangle','Hexagon','Octagon','Diamond','Percent',
      'Hash','AtSign','Award','Badge','Crown','Flag','Smile','Frown',
      'Meh','ThumbsUp','ThumbsDown','Repeat','Shuffle','SkipForward',
      'SkipBack','FastForward','Rewind','Pause','StopCircle','PlayCircle',
      'TrendingDown','PieChart','BarChart','LineChart','Activity','Gauge',
      'Rocket','Lightbulb','Target','Crosshair','Aperture','Anchor',
    ].forEach(name => {
      window[name] = window.__LucideReact__[name];
    });
  </script>
  <script>
    ${moduleResolver}
  </script>
</body>
</html>`;
  }, []);

  // ─── Compile HTML-only preview ─────────────────────────────────────────

  const buildHtmlDocument = useCallback((files: Record<string, string>, entryPath: string): string => {
    const htmlContent = files[entryPath] || files["index.html"] || "";
    const cssContent = files["style.css"] || files["src/index.css"] || "";
    const jsContent = files["script.js"] || files["src/index.js"] || "";

    const assetMimeType = (path: string) => {
      if (path.endsWith(".svg")) return "image/svg+xml";
      if (path.endsWith(".png")) return "image/png";
      if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
      if (path.endsWith(".webp")) return "image/webp";
      if (path.endsWith(".gif")) return "image/gif";
      if (path.endsWith(".ico")) return "image/x-icon";
      return "text/plain";
    };

    const escapeRegex = (value: string) =>
      value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const resolveAssetRefs = (content: string) =>
      Object.entries(files).reduce((next, [path, value]) => {
        if (!/\.(svg|png|jpe?g|webp|gif|ico)$/i.test(path)) return next;
        const dataUrl = `data:${assetMimeType(path)};charset=utf-8,${encodeURIComponent(value)}`;
        const escapedPath = escapeRegex(path);
        return next
          .replace(new RegExp(`(["'(])/${escapedPath}(["')])`, "g"), `$1${dataUrl}$2`)
          .replace(new RegExp(`(["'(])${escapedPath}(["')])`, "g"), `$1${dataUrl}$2`);
      }, content);

    const logInterceptor = `<script>
(function() {
  const send = (type, args) => window.parent.postMessage({
    source: 'cognify-preview', type,
    message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')
  }, '*');
  console.log = (...a) => send('log', a);
  console.error = (...a) => send('error', a);
  window.onerror = (m, s, l) => send('error', [m + ' (Line ' + l + ')']);
  window.addEventListener('load', () => window.parent.postMessage({ source: 'cognify-preview', type: 'ready' }, '*'));
})();
<\/script>`;

    if (htmlContent) {
      // Full HTML file — inject logger and Tailwind
      return resolveAssetRefs(htmlContent)
        .replace("</head>", `<script src="https://cdn.tailwindcss.com"></script>\n${logInterceptor}\n</head>`)
        .replace("</body>", `${cssContent ? `<style>${resolveAssetRefs(cssContent)}</style>` : ""}\n${jsContent ? `<script>${jsContent}<\/script>` : ""}\n</body>`);
    }

    // Generic fallback
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.tailwindcss.com"></script>
  ${logInterceptor}
  <style>body{margin:0;padding:0;background:#020617;color:#f8fafc} ${resolveAssetRefs(cssContent)}</style>
</head>
<body>
  <div style="padding:20px;text-align:center;color:#64748b">No HTML content generated yet.</div>
  <script>${jsContent}<\/script>
</body>
</html>`;
  }, []);

  // ─── Master compile function ─────────────────────────────────────────

  const compileSource = useCallback((): string | null => {
    const files = code.files && Object.keys(code.files).length > 0
      ? code.files
      : buildLegacyFiles(code);

    // Guard: max total code size
    const totalBytes = Object.values(files).reduce((acc, s) => acc + (s?.length ?? 0), 0);
    if (totalBytes > MAX_CODE_BYTES) {
      return null; // Signal size exceeded
    }

    const entryPath = code.entryPath || Object.keys(files)[0] || "src/App.tsx";
    const projectType = code.projectType || "react";

    if (projectType === "html") {
      return buildHtmlDocument(files, entryPath);
    }

    // React / Next.js — use virtual module compiler
    if (Object.keys(files).length > 0) {
      return buildMultiFileDocument(files, entryPath);
    }

    // Ultimate fallback: empty frame
    return `<!DOCTYPE html><html><body style="background:#020617;color:#64748b;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;text-align:center">
<p>Enter a prompt to generate your UI preview.</p></body></html>`;
  }, [code, buildMultiFileDocument, buildHtmlDocument]);

  // ─── Refresh ────────────────────────────────────────────────────────

  const handleRefresh = useCallback(() => {
    const srcDoc = compileSource();

    // Guard: code too large
    if (srcDoc === null) {
      setPreviewError("Code size exceeds 500 KB limit. Reduce file sizes to render preview.");
      return;
    }

    // Hash-based dedup — skip identical re-renders
    let hash = 0;
    for (let i = 0; i < srcDoc.length; i++) {
      hash = ((hash << 5) - hash + srcDoc.charCodeAt(i)) | 0;
    }
    const hashStr = String(hash);
    if (hashStr === lastSrcHashRef.current) return;
    lastSrcHashRef.current = hashStr;

    setIsLoading(true);
    setPreviewError(null);
    clearLogs();

    setCurrentSrcDoc(srcDoc);
    setIframeKey((k) => k + 1);
  }, [compileSource]);

  useEffect(() => {
    if (iframeRef.current && currentSrcDoc) {
      iframeRef.current.srcdoc = currentSrcDoc;
    }
  }, [iframeKey, currentSrcDoc]);

  const handleReset = () => {
    // Clear hash to force a fresh render on manual reset/reload
    lastSrcHashRef.current = "";
    handleRefresh();
    toast.info("Preview reset");
  };

  // Hot Reload: debounce refresh after code changes.
  // Use a longer delay (1200ms) during active AI streaming to prevent excessive
  // compile cycles while chunks are still arriving, then 600ms for manual edits.
  useEffect(() => {
    const isGenerating = useProjectStore.getState().isGenerating;
    const delay = isGenerating ? 1200 : 600;
    const timer = setTimeout(() => {
      handleRefresh();
    }, delay);
    return () => clearTimeout(timer);
  }, [code, activeTab, handleRefresh]);

  // Trap postMessages from sandbox iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.source === "cognify-preview") {
        if (e.data.type === "ready") {
          setIsLoading(false);
        } else if (e.data.type === "log") {
          setLogs((prev) => [...prev, { type: "log", text: e.data.message }]);
        } else if (e.data.type === "warn") {
          setLogs((prev) => [...prev, { type: "warn", text: e.data.message }]);
        } else if (e.data.type === "error") {
          setIsLoading(false);
          // Only show error overlay if the AI model is not actively generating/streaming!
          const activeIsGenerating = useProjectStore.getState().isGenerating;
          if (!activeIsGenerating) {
            setPreviewError(e.data.message);
            setShowConsole(true);
          }
          setLogs((prev) => [...prev, { type: "error", text: e.data.message }]);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const VIEWPORT_WIDTHS: Record<ViewportMode, string> = {
    desktop: "w-full h-full",
    tablet: "w-[768px] h-[90%] border border-white/10 rounded-2xl shadow-2xl transition-all",
    mobile: "w-[375px] h-[80%] border border-white/10 rounded-2xl shadow-2xl transition-all",
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 1.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));

  const previewContent = (
    <div className="relative w-full h-full flex items-center justify-center p-4 min-h-0 bg-[#0c0c12]">
      {/* Zoom scaling container */}
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "center center",
          width: viewport === "desktop" ? "100%" : undefined,
          height: viewport === "desktop" ? "100%" : undefined,
        }}
        className="flex items-center justify-center w-full h-full transition-transform duration-300"
      >
        <iframe
          key={iframeKey}
          ref={iframeRef}
          className={`bg-slate-950 transition-all duration-300 ${VIEWPORT_WIDTHS[viewport]}`}
          title="Cognify UI Live Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      {/* Error Overlay */}
      {previewError && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-40">
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 mb-4">
            <AlertCircle className="h-8 w-8 text-rose-400" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">Preview Runtime Error</h3>
          <p className="mt-1 text-xs text-white/50 max-w-md break-words font-mono bg-white/[0.04] rounded-xl px-4 py-3">
            {previewError}
          </p>
          <div className="mt-5 flex gap-2.5">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-semibold text-white transition-all"
            >
              <RotateCw className="h-3 w-3" />
              Reload Frame
            </button>
            {onAutoFix && (
              <button
                onClick={() => {
                  onAutoFix(previewError);
                  setPreviewError(null);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white transition-all"
              >
                <Wrench className="h-3 w-3" />
                Auto-Fix with AI
              </button>
            )}
            <button
              onClick={() => {
                setPreviewError(null);
                setShowConsole(true);
              }}
              className="rounded-xl bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.08] px-3.5 py-2 text-xs font-semibold text-white/70 transition-all"
            >
              View Console
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#09090b] overflow-hidden select-none">
      {/* Top action bar */}
      <div className="h-12 border-b border-white/[0.06] bg-[#0a0a0f] flex items-center justify-between px-4 shrink-0">

        {/* Left: Viewport size & Zoom controls */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] p-0.5 rounded-xl">
            {(["desktop", "tablet", "mobile"] as ViewportMode[]).map((mode) => {
              const active = viewport === mode;
              const Icon = mode === "desktop" ? Laptop : mode === "tablet" ? Tablet : Phone;
              return (
                <button
                  key={mode}
                  onClick={() => setViewport(mode)}
                  className={`p-1.5 rounded-lg transition-all ${
                    active
                      ? "bg-indigo-600/70 text-white shadow"
                      : "text-white/40 hover:text-white/70"
                  }`}
                  title={`Switch to ${mode} preview`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              );
            })}
          </div>

          <div className="h-4 w-[1px] bg-white/[0.08]" />

          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="p-1 rounded text-white/40 hover:text-white/70 hover:bg-white/[0.04] disabled:opacity-30"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="text-[10px] font-mono text-white/40 w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 1.5}
              className="p-1 rounded text-white/40 hover:text-white/70 hover:bg-white/[0.04] disabled:opacity-30"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-1.5">
          {/* Reset Preview */}
          <button
            onClick={handleReset}
            className="p-2 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] text-white/50 hover:text-white/80 transition-all"
            title="Reset Preview State"
          >
            <Undo className="h-3.5 w-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-2 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] text-white/50 hover:text-white/80 transition-all"
            title="Open Fullscreen Modal"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] text-white/50 hover:text-white/80 transition-all"
            title="Refresh preview"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RotateCw className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Toggle Console */}
          <button
            onClick={() => setShowConsole((c) => !c)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              showConsole
                ? "bg-indigo-500/15 border-indigo-500/20 text-indigo-400"
                : "border-white/[0.06] bg-white/[0.02] text-white/50 hover:bg-white/[0.06] hover:text-white/80"
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Console ({logs.length})</span>
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 min-h-0 relative flex flex-col">
        {previewContent}
      </div>

      {/* Collapsible Console Panel */}
      {showConsole && (
        <div className="h-48 border-t border-white/[0.06] bg-[#07070a] flex flex-col shrink-0">
          <div className="h-9 border-b border-white/[0.04] bg-[#09090d] flex items-center justify-between px-4 text-xs font-semibold select-none shrink-0">
            <span className="text-white/40 flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-indigo-400" />
              Runtime Console
            </span>
            <button
              onClick={clearLogs}
              className="text-white/20 hover:text-white/50 text-[10px] uppercase font-bold"
            >
              Clear
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] space-y-1 select-text">
            {logs.length === 0 ? (
              <p className="text-white/20 italic">No logs recorded. Interact with the preview to trigger output.</p>
            ) : (
              logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-1.5 leading-relaxed ${
                    log.type === "error"
                      ? "text-red-400"
                      : log.type === "warn"
                      ? "text-amber-400"
                      : "text-white/60"
                  }`}
                >
                  {log.type === "error" && (
                    <AlertCircle className="h-3 w-3 shrink-0 text-red-500 mt-0.5" />
                  )}
                  {log.type === "warn" && (
                    <AlertCircle className="h-3 w-3 shrink-0 text-amber-500 mt-0.5" />
                  )}
                  <span className="break-all">{log.text}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Custom Fullscreen Overlay Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/95 flex flex-col">
          <div className="h-14 border-b border-white/[0.08] px-6 flex items-center justify-between bg-[#0a0a0f] text-white shrink-0">
            <div className="flex items-center gap-3">
              <Laptop className="h-4 w-4 text-indigo-400" />
              <span className="text-sm font-semibold">Fullscreen Preview</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] p-0.5 rounded-xl text-white/50">
                {(["desktop", "tablet", "mobile"] as ViewportMode[]).map((mode) => {
                  const Icon = mode === "desktop" ? Laptop : mode === "tablet" ? Tablet : Phone;
                  return (
                    <button
                      key={mode}
                      onClick={() => setViewport(mode)}
                      className={`p-1.5 rounded-lg transition-all ${
                        viewport === mode ? "bg-indigo-600/70 text-white" : ""
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.05] transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0 bg-[#07070a]">{previewContent}</div>
        </div>
      )}
    </div>
  );
}

// ─── Public export wrapped in ErrorBoundary ────────────────────────────────

export function LivePreview(props: LivePreviewProps) {
  return (
    <PreviewErrorBoundary>
      <LivePreviewInner {...props} />
    </PreviewErrorBoundary>
  );
}

// ─── Helper: build legacy file map from old GeneratedCode fields ─────────

function buildLegacyFiles(code: GeneratedCode): Record<string, string> {
  const files: Record<string, string> = {};
  if (code.react?.trim()) files["src/App.tsx"] = code.react;
  if (code.html?.trim()) files["index.html"] = code.html;
  if (code.css?.trim()) files["src/index.css"] = code.css;
  if (code.js?.trim()) files["script.js"] = code.js;
  return files;
}

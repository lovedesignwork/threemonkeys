'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms_conditions' | 'privacy_policy';
}

interface LegalContent {
  title: string;
  content: string;
  updated_at: string;
}

export function LegalModal({ isOpen, onClose, type }: LegalModalProps) {
  const [content, setContent] = useState<LegalContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/legal/${type}`);
      if (!response.ok) {
        throw new Error('Failed to load content');
      }
      const data = await response.json();
      setContent(data);
    } catch {
      setError('Unable to load content. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    if (isOpen && !content) {
      fetchContent();
    }
  }, [isOpen, content, fetchContent]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, type: 'spring', damping: 25 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden"
          >
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1a237e]">
                {loading ? 'Loading...' : content?.title || 'Legal Content'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#1a237e]" />
                </div>
              )}

              {error && (
                <div className="text-center py-12">
                  <p className="text-red-500 mb-4">{error}</p>
                  <button
                    onClick={fetchContent}
                    className="px-4 py-2 bg-[#1a237e] text-white rounded-lg hover:bg-[#1a237e]/90 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {!loading && !error && content && (
                <div className="prose prose-slate max-w-none">
                  <MarkdownContent content={content.content} />
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-[#1a237e] text-white rounded-lg hover:bg-[#1a237e]/90 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function MarkdownContent({ content }: { content: string }) {
  const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableRows: string[][] = [];
    let tableHeaders: string[] = [];

    const processInline = (line: string): React.ReactNode => {
      const parts: React.ReactNode[] = [];
      let remaining = line;
      let key = 0;

      while (remaining.length > 0) {
        const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
        const italicMatch = remaining.match(/\*(.+?)\*/);
        
        if (boldMatch && boldMatch.index !== undefined) {
          if (boldMatch.index > 0) {
            parts.push(remaining.slice(0, boldMatch.index));
          }
          parts.push(<strong key={key++}>{boldMatch[1]}</strong>);
          remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
        } else if (italicMatch && italicMatch.index !== undefined && !italicMatch[0].startsWith('**')) {
          if (italicMatch.index > 0) {
            parts.push(remaining.slice(0, italicMatch.index));
          }
          parts.push(<em key={key++}>{italicMatch[1]}</em>);
          remaining = remaining.slice(italicMatch.index + italicMatch[0].length);
        } else {
          parts.push(remaining);
          break;
        }
      }

      return parts.length === 1 ? parts[0] : <>{parts}</>;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('|') && line.endsWith('|')) {
        const cells = line.slice(1, -1).split('|').map(c => c.trim());
        
        if (!inTable) {
          tableHeaders = cells;
          inTable = true;
        } else if (cells.every(c => c.match(/^-+$/))) {
          continue;
        } else {
          tableRows.push(cells);
        }
        continue;
      } else if (inTable) {
        elements.push(
          <table key={i} className="w-full border-collapse my-4 text-sm">
            <thead>
              <tr className="bg-slate-100">
                {tableHeaders.map((h, idx) => (
                  <th key={idx} className="border border-slate-300 px-3 py-2 text-left font-semibold text-slate-700">
                    {processInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, ridx) => (
                <tr key={ridx} className={ridx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  {row.map((cell, cidx) => (
                    <td key={cidx} className="border border-slate-300 px-3 py-2 text-slate-600">
                      {processInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
        inTable = false;
        tableRows = [];
        tableHeaders = [];
      }

      if (line === '') {
        continue;
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-lg font-bold text-[#1a237e] mt-6 mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#f9a825] rounded-full" />
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="text-base font-semibold text-slate-700 mt-4 mb-2">
            {line.slice(4)}
          </h3>
        );
      } else if (line === '---') {
        elements.push(<hr key={i} className="my-5 border-slate-200" />);
      } else if (line.startsWith('- ')) {
        elements.push(
          <li key={i} className="ml-4 text-slate-600 mb-1.5 list-disc marker:text-[#f9a825]">
            {processInline(line.slice(2))}
          </li>
        );
      } else {
        elements.push(
          <p key={i} className="text-slate-600 mb-2 leading-relaxed">
            {processInline(line)}
          </p>
        );
      }
    }

    if (inTable && tableRows.length > 0) {
      elements.push(
        <table key="final-table" className="w-full border-collapse my-4 text-sm">
          <thead>
            <tr className="bg-slate-100">
              {tableHeaders.map((h, idx) => (
                <th key={idx} className="border border-slate-300 px-3 py-2 text-left font-semibold text-slate-700">
                  {processInline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, ridx) => (
              <tr key={ridx} className={ridx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                {row.map((cell, cidx) => (
                  <td key={cidx} className="border border-slate-300 px-3 py-2 text-slate-600">
                    {processInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return elements;
  };

  return <div className="space-y-1">{parseMarkdown(content)}</div>;
}

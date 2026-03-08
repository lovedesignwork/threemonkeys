'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Shield, 
  Save, 
  Loader2, 
  Check,
  Eye,
  X
} from 'lucide-react';
import { adminGet, adminPut } from '@/lib/auth/api-client';

interface LegalContent {
  id: string;
  type: string;
  title: string;
  content: string;
  is_active: boolean;
  updated_at: string;
}

export default function LegalContentPage() {
  const [contents, setContents] = useState<LegalContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('terms_conditions');
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const [previewModal, setPreviewModal] = useState<LegalContent | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await adminGet('/api/admin/legal');
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setContents(result.data || []);
      
      const edited: Record<string, string> = {};
      result.data?.forEach((item: LegalContent) => {
        edited[item.id] = item.content;
      });
      setEditedContent(edited);
    } catch (error) {
      console.error('Error fetching legal content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (item: LegalContent) => {
    setSaving(item.id);
    try {
      const response = await adminPut('/api/admin/legal', {
        id: item.id,
        content: editedContent[item.id],
      });

      if (!response.ok) throw new Error('Failed to save');

      setSaved(item.id);
      setTimeout(() => setSaved(null), 2000);
      
      setContents(contents.map(c => 
        c.id === item.id ? { ...c, content: editedContent[item.id], updated_at: new Date().toISOString() } : c
      ));
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content');
    } finally {
      setSaving(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'terms_conditions':
        return FileText;
      case 'privacy_policy':
        return Shield;
      default:
        return FileText;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'terms_conditions':
        return 'Terms & Conditions';
      case 'privacy_policy':
        return 'Privacy Policy';
      default:
        return type;
    }
  };

  const activeContent = contents.find(c => c.type === activeTab);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#1a237e]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Legal Content</h1>
          <p className="text-slate-600 mt-1">
            Manage Terms & Conditions and Privacy Policy displayed on the booking page
          </p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {contents.map((item) => {
          const Icon = getTypeIcon(item.type);
          return (
            <button
              key={item.type}
              onClick={() => setActiveTab(item.type)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
                activeTab === item.type
                  ? 'text-[#1a237e] border-[#1a237e]'
                  : 'text-slate-500 border-transparent hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {getTypeLabel(item.type)}
            </button>
          );
        })}
      </div>

      {activeContent && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {activeContent.title}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Last updated: {new Date(activeContent.updated_at).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewModal(activeContent)}
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <button
                  onClick={() => handleSave(activeContent)}
                  disabled={saving === activeContent.id || editedContent[activeContent.id] === activeContent.content}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    saved === activeContent.id
                      ? 'bg-green-500 text-white'
                      : editedContent[activeContent.id] === activeContent.content
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-[#1a237e] text-white hover:bg-[#1a237e]/90'
                  }`}
                >
                  {saving === activeContent.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : saved === activeContent.id ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saved === activeContent.id ? 'Saved!' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <p className="text-sm text-slate-600 mb-2">
                Use Markdown formatting for rich content. Supported: **bold**, *italic*, ## headings, - lists, | tables |
              </p>
            </div>
            <textarea
              value={editedContent[activeContent.id] || ''}
              onChange={(e) => setEditedContent({ ...editedContent, [activeContent.id]: e.target.value })}
              className="w-full h-[500px] px-4 py-3 border border-slate-200 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#1a237e]/20 focus:border-[#1a237e] resize-none"
              placeholder="Enter content using Markdown formatting..."
            />
          </div>
        </div>
      )}

      {previewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                {previewModal.title}
              </h3>
              <button
                onClick={() => setPreviewModal(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="prose prose-slate max-w-none">
                <MarkdownContent content={editedContent[previewModal.id] || previewModal.content} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
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
          <table key={i} className="w-full border-collapse my-4">
            <thead>
              <tr className="bg-slate-100">
                {tableHeaders.map((h, idx) => (
                  <th key={idx} className="border border-slate-300 px-3 py-2 text-left font-semibold">
                    {processInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, ridx) => (
                <tr key={ridx}>
                  {row.map((cell, cidx) => (
                    <td key={cidx} className="border border-slate-300 px-3 py-2">
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
          <h2 key={i} className="text-lg font-bold text-slate-800 mt-6 mb-3">
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
        elements.push(<hr key={i} className="my-4 border-slate-200" />);
      } else if (line.startsWith('- ')) {
        elements.push(
          <li key={i} className="ml-4 text-slate-600 mb-1">
            {processInline(line.slice(2))}
          </li>
        );
      } else {
        elements.push(
          <p key={i} className="text-slate-600 mb-2">
            {processInline(line)}
          </p>
        );
      }
    }

    if (inTable && tableRows.length > 0) {
      elements.push(
        <table key="final-table" className="w-full border-collapse my-4">
          <thead>
            <tr className="bg-slate-100">
              {tableHeaders.map((h, idx) => (
                <th key={idx} className="border border-slate-300 px-3 py-2 text-left font-semibold">
                  {processInline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, ridx) => (
              <tr key={ridx}>
                {row.map((cell, cidx) => (
                  <td key={cidx} className="border border-slate-300 px-3 py-2">
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

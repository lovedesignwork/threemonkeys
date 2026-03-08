'use client';

import { useState, useMemo } from 'react';
import { 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Globe,
  Share2,
  Twitter,
  Facebook,
} from 'lucide-react';

interface SEOData {
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  noIndex: boolean;
  noFollow: boolean;
}

interface SEOPanelProps {
  title: string;
  content: string;
  slug: string;
  seoData: SEOData;
  onChange: (data: Partial<SEOData>) => void;
}

interface SEOCheck {
  id: string;
  label: string;
  status: 'good' | 'warning' | 'bad';
  message: string;
}

export default function SEOPanel({ title, content, slug, seoData, onChange }: SEOPanelProps) {
  const [activeTab, setActiveTab] = useState<'seo' | 'social'>('seo');
  const [expandedSection, setExpandedSection] = useState<string | null>('focus-keyword');

  const wordCount = useMemo(() => {
    const text = content.replace(/<[^>]*>/g, '').trim();
    return text ? text.split(/\s+/).length : 0;
  }, [content]);

  const seoChecks = useMemo((): SEOCheck[] => {
    const checks: SEOCheck[] = [];
    const focusKeyword = seoData.focusKeyword.toLowerCase();
    const titleLower = title.toLowerCase();
    const contentLower = content.toLowerCase().replace(/<[^>]*>/g, '');
    const seoTitleLower = (seoData.seoTitle || title).toLowerCase();
    const seoDesc = seoData.seoDescription || '';

    // Focus keyword in title
    if (focusKeyword) {
      checks.push({
        id: 'keyword-title',
        label: 'Focus keyword in title',
        status: titleLower.includes(focusKeyword) ? 'good' : 'bad',
        message: titleLower.includes(focusKeyword) 
          ? 'Focus keyword appears in the title' 
          : 'Add the focus keyword to your title',
      });
    }

    // Focus keyword in SEO title
    if (focusKeyword) {
      checks.push({
        id: 'keyword-seo-title',
        label: 'Focus keyword in SEO title',
        status: seoTitleLower.includes(focusKeyword) ? 'good' : 'bad',
        message: seoTitleLower.includes(focusKeyword)
          ? 'Focus keyword appears in SEO title'
          : 'Add the focus keyword to your SEO title',
      });
    }

    // Focus keyword in meta description
    if (focusKeyword && seoDesc) {
      checks.push({
        id: 'keyword-desc',
        label: 'Focus keyword in meta description',
        status: seoDesc.toLowerCase().includes(focusKeyword) ? 'good' : 'warning',
        message: seoDesc.toLowerCase().includes(focusKeyword)
          ? 'Focus keyword appears in meta description'
          : 'Consider adding the focus keyword to your meta description',
      });
    }

    // Focus keyword in content
    if (focusKeyword) {
      const keywordCount = (contentLower.match(new RegExp(focusKeyword, 'g')) || []).length;
      const density = wordCount > 0 ? (keywordCount / wordCount) * 100 : 0;
      
      checks.push({
        id: 'keyword-content',
        label: 'Focus keyword in content',
        status: keywordCount > 0 ? (density < 0.5 ? 'warning' : density > 3 ? 'warning' : 'good') : 'bad',
        message: keywordCount === 0
          ? 'Focus keyword not found in content'
          : `Focus keyword appears ${keywordCount} times (${density.toFixed(1)}% density)`,
      });
    }

    // Focus keyword in first paragraph
    if (focusKeyword) {
      const firstPara = contentLower.split('</p>')[0] || '';
      checks.push({
        id: 'keyword-intro',
        label: 'Focus keyword in introduction',
        status: firstPara.includes(focusKeyword) ? 'good' : 'warning',
        message: firstPara.includes(focusKeyword)
          ? 'Focus keyword appears in the first paragraph'
          : 'Add focus keyword to your introduction',
      });
    }

    // SEO Title length
    const seoTitleLength = (seoData.seoTitle || title).length;
    checks.push({
      id: 'title-length',
      label: 'SEO title length',
      status: seoTitleLength >= 50 && seoTitleLength <= 60 ? 'good' : seoTitleLength >= 40 && seoTitleLength <= 70 ? 'warning' : 'bad',
      message: `${seoTitleLength} characters (recommended: 50-60)`,
    });

    // Meta description length
    const descLength = seoDesc.length;
    checks.push({
      id: 'desc-length',
      label: 'Meta description length',
      status: descLength >= 150 && descLength <= 160 ? 'good' : descLength >= 120 && descLength <= 180 ? 'warning' : descLength === 0 ? 'bad' : 'warning',
      message: descLength === 0 ? 'Add a meta description' : `${descLength} characters (recommended: 150-160)`,
    });

    // Content length
    checks.push({
      id: 'content-length',
      label: 'Content length',
      status: wordCount >= 300 ? 'good' : wordCount >= 150 ? 'warning' : 'bad',
      message: `${wordCount} words (recommended: 300+)`,
    });

    // Slug contains keyword
    if (focusKeyword) {
      const slugLower = slug.toLowerCase();
      checks.push({
        id: 'keyword-slug',
        label: 'Focus keyword in URL',
        status: slugLower.includes(focusKeyword.replace(/\s+/g, '-')) ? 'good' : 'warning',
        message: slugLower.includes(focusKeyword.replace(/\s+/g, '-'))
          ? 'Focus keyword appears in URL'
          : 'Consider adding focus keyword to URL',
      });
    }

    return checks;
  }, [title, content, slug, seoData, wordCount]);

  const seoScore = useMemo(() => {
    if (seoChecks.length === 0) return 0;
    const goodCount = seoChecks.filter(c => c.status === 'good').length;
    return Math.round((goodCount / seoChecks.length) * 100);
  }, [seoChecks]);

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const StatusIcon = ({ status }: { status: 'good' | 'warning' | 'bad' }) => {
    if (status === 'good') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'warning') return <AlertCircle className="w-4 h-4 text-orange-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <div className="border-b border-slate-200 last:border-0">
      <button
        type="button"
        onClick={() => setExpandedSection(expandedSection === id ? null : id)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
      >
        <span className="font-medium text-slate-800">{title}</span>
        {expandedSection === id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {expandedSection === id && (
        <div className="px-4 pb-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header with Score */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Search className="w-5 h-5 text-[#1a237e]" />
            SEO Analysis
          </h3>
          <div className={`text-2xl font-bold ${getScoreColor(seoScore)}`}>
            {seoScore}%
          </div>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getScoreBg(seoScore)} transition-all duration-500`}
            style={{ width: `${seoScore}%` }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('seo')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'seo' 
              ? 'text-[#1a237e] border-b-2 border-[#1a237e] bg-white' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Globe className="w-4 h-4 inline mr-2" />
          SEO
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('social')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'social' 
              ? 'text-[#1a237e] border-b-2 border-[#1a237e] bg-white' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Share2 className="w-4 h-4 inline mr-2" />
          Social
        </button>
      </div>

      {activeTab === 'seo' && (
        <div>
          {/* Focus Keyword */}
          <Section id="focus-keyword" title="Focus Keyword">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Focus Keyword</label>
              <input
                type="text"
                value={seoData.focusKeyword}
                onChange={(e) => onChange({ focusKeyword: e.target.value })}
                placeholder="Enter focus keyword"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:border-[#1a237e]"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Secondary Keywords</label>
              <input
                type="text"
                value={seoData.secondaryKeywords.join(', ')}
                onChange={(e) => onChange({ secondaryKeywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) })}
                placeholder="keyword1, keyword2, keyword3"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:border-[#1a237e]"
              />
            </div>
          </Section>

          {/* SEO Title & Description */}
          <Section id="meta" title="Meta Title & Description">
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                SEO Title <span className="text-slate-400">({(seoData.seoTitle || title).length}/60)</span>
              </label>
              <input
                type="text"
                value={seoData.seoTitle}
                onChange={(e) => onChange({ seoTitle: e.target.value })}
                placeholder={title || 'Enter SEO title'}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:border-[#1a237e]"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Meta Description <span className="text-slate-400">({seoData.seoDescription.length}/160)</span>
              </label>
              <textarea
                value={seoData.seoDescription}
                onChange={(e) => onChange({ seoDescription: e.target.value })}
                placeholder="Enter meta description"
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:border-[#1a237e] resize-none"
              />
            </div>
          </Section>

          {/* Google Preview */}
          <Section id="preview" title="Google Preview">
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="text-blue-600 text-lg hover:underline cursor-pointer truncate">
                {seoData.seoTitle || title || 'Page Title'}
              </div>
              <div className="text-green-700 text-sm">
                hanumanworldphuket.com/blog/{slug || 'your-post-url'}
              </div>
              <div className="text-slate-600 text-sm mt-1 line-clamp-2">
                {seoData.seoDescription || 'Add a meta description to see how your post will appear in search results.'}
              </div>
            </div>
          </Section>

          {/* Advanced */}
          <Section id="advanced" title="Advanced">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Canonical URL</label>
              <input
                type="text"
                value={seoData.canonicalUrl}
                onChange={(e) => onChange({ canonicalUrl: e.target.value })}
                placeholder="https://hanumanworldphuket.com/blog/..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:border-[#1a237e]"
              />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={seoData.noIndex}
                  onChange={(e) => onChange({ noIndex: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <span className="text-sm text-slate-600">No Index</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={seoData.noFollow}
                  onChange={(e) => onChange({ noFollow: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <span className="text-sm text-slate-600">No Follow</span>
              </label>
            </div>
          </Section>

          {/* Analysis Results */}
          <Section id="analysis" title="SEO Analysis">
            <div className="space-y-2">
              {seoChecks.map((check) => (
                <div key={check.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50">
                  <StatusIcon status={check.status} />
                  <div>
                    <div className="text-sm font-medium text-slate-800">{check.label}</div>
                    <div className="text-xs text-slate-500">{check.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}

      {activeTab === 'social' && (
        <div>
          {/* Facebook/Open Graph */}
          <Section id="og" title="Facebook / Open Graph">
            <div>
              <label className="block text-sm text-slate-600 mb-1">OG Title</label>
              <input
                type="text"
                value={seoData.ogTitle}
                onChange={(e) => onChange({ ogTitle: e.target.value })}
                placeholder={title || 'Enter OG title'}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:border-[#1a237e]"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">OG Description</label>
              <textarea
                value={seoData.ogDescription}
                onChange={(e) => onChange({ ogDescription: e.target.value })}
                placeholder="Enter OG description"
                rows={2}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:border-[#1a237e] resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">OG Image URL</label>
              <input
                type="text"
                value={seoData.ogImage}
                onChange={(e) => onChange({ ogImage: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:border-[#1a237e]"
              />
            </div>
            {/* Facebook Preview */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Facebook className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-slate-600">Facebook Preview</span>
              </div>
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                {seoData.ogImage && (
                  <div className="h-40 bg-slate-200 bg-cover bg-center" style={{ backgroundImage: `url(${seoData.ogImage})` }} />
                )}
                <div className="p-3">
                  <div className="text-xs text-slate-400 uppercase">hanumanworldphuket.com</div>
                  <div className="font-bold text-slate-800 line-clamp-1">{seoData.ogTitle || title || 'Title'}</div>
                  <div className="text-sm text-slate-500 line-clamp-2">{seoData.ogDescription || seoData.seoDescription || 'Description'}</div>
                </div>
              </div>
            </div>
          </Section>

          {/* Twitter */}
          <Section id="twitter" title="Twitter Card">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Twitter Title</label>
              <input
                type="text"
                value={seoData.twitterTitle}
                onChange={(e) => onChange({ twitterTitle: e.target.value })}
                placeholder={title || 'Enter Twitter title'}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:border-[#1a237e]"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Twitter Description</label>
              <textarea
                value={seoData.twitterDescription}
                onChange={(e) => onChange({ twitterDescription: e.target.value })}
                placeholder="Enter Twitter description"
                rows={2}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:border-[#1a237e] resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Twitter Image URL</label>
              <input
                type="text"
                value={seoData.twitterImage}
                onChange={(e) => onChange({ twitterImage: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:border-[#1a237e]"
              />
            </div>
            {/* Twitter Preview */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Twitter className="w-5 h-5 text-sky-500" />
                <span className="text-sm font-medium text-slate-600">Twitter Preview</span>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                {seoData.twitterImage && (
                  <div className="h-40 bg-slate-200 bg-cover bg-center" style={{ backgroundImage: `url(${seoData.twitterImage})` }} />
                )}
                <div className="p-3">
                  <div className="font-bold text-slate-800 line-clamp-1">{seoData.twitterTitle || title || 'Title'}</div>
                  <div className="text-sm text-slate-500 line-clamp-2">{seoData.twitterDescription || seoData.seoDescription || 'Description'}</div>
                  <div className="text-xs text-slate-400 mt-1">hanumanworldphuket.com</div>
                </div>
              </div>
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}

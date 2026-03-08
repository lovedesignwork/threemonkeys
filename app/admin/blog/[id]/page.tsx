'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Clock, 
  Send,
  Image as ImageIcon,
  Tag,
  Folder,
  Calendar,
  Loader2,
  AlertCircle,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import SEOPanel from '@/components/admin/blog/SEOPanel';
import ImageUpload from '@/components/admin/blog/ImageUpload';
import { useAuth } from '@/contexts/AuthContext';
import { adminGet, adminPut, adminDelete } from '@/lib/auth/api-client';
import { CustomSelect } from '@/components/ui';

const RichTextEditor = dynamic(
  () => import('@/components/admin/blog/RichTextEditor'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[400px] border border-slate-200 rounded-xl flex items-center justify-center bg-slate-50">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    ),
  }
);

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

const CATEGORIES = [
  'Adventure Tips',
  'Travel Guide',
  'Safety',
  'News & Updates',
  'Nature & Wildlife',
  'Behind the Scenes',
];

export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { adminUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Post data
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');
  const [scheduledAt, setScheduledAt] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [authorId, setAuthorId] = useState<string | null>(null);

  // SEO data
  const [seoData, setSeoData] = useState<SEOData>({
    seoTitle: '',
    seoDescription: '',
    focusKeyword: '',
    secondaryKeywords: [],
    canonicalUrl: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    noIndex: false,
    noFollow: false,
  });

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await adminGet(`/api/admin/blog/${id}`);
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to load post');
      
      const data = result.data;
      if (!data) throw new Error('Post not found');

      setTitle(data.title);
      setSlug(data.slug);
      setExcerpt(data.excerpt || '');
      setContent(data.content || '');
      setFeaturedImage(data.featured_image || '');
      setCategory(data.category || '');
      setTags(data.tags || []);
      setStatus(data.status);
      setAuthorId(data.author_id);
      if (data.scheduled_at) {
        setScheduledAt(new Date(data.scheduled_at).toISOString().slice(0, 16));
      }

      setSeoData({
        seoTitle: data.seo_title || '',
        seoDescription: data.seo_description || '',
        focusKeyword: data.focus_keyword || '',
        secondaryKeywords: data.secondary_keywords || [],
        canonicalUrl: data.canonical_url || '',
        ogTitle: data.og_title || '',
        ogDescription: data.og_description || '',
        ogImage: data.og_image || '',
        twitterTitle: data.twitter_title || '',
        twitterDescription: data.twitter_description || '',
        twitterImage: data.twitter_image || '',
        noIndex: data.no_index || false,
        noFollow: data.no_follow || false,
      });
    } catch (err: any) {
      console.error('Error fetching post:', err);
      setError(err.message || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const calculateSEOScore = (): number => {
    let score = 0;
    const totalChecks = 8;
    
    if (seoData.focusKeyword && title.toLowerCase().includes(seoData.focusKeyword.toLowerCase())) score++;
    if (seoData.focusKeyword && content.toLowerCase().includes(seoData.focusKeyword.toLowerCase())) score++;
    if (seoData.seoTitle && seoData.seoTitle.length >= 50 && seoData.seoTitle.length <= 60) score++;
    if (seoData.seoDescription && seoData.seoDescription.length >= 150 && seoData.seoDescription.length <= 160) score++;
    if (content.replace(/<[^>]*>/g, '').split(/\s+/).length >= 300) score++;
    if (seoData.focusKeyword && slug.includes(seoData.focusKeyword.toLowerCase().replace(/\s+/g, '-'))) score++;
    if (featuredImage) score++;
    if (excerpt) score++;
    
    return Math.round((score / totalChecks) * 100);
  };

  const handleSave = async (saveStatus: 'draft' | 'published' | 'scheduled') => {
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!slug.trim()) {
      setError('Please enter a URL slug');
      return;
    }

    if (saveStatus === 'scheduled' && !scheduledAt) {
      setError('Please select a schedule date');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const seoScore = calculateSEOScore();
      
      const postData = {
        title,
        slug,
        excerpt,
        content,
        featured_image: featuredImage,
        category,
        tags,
        status: saveStatus,
        published_at: saveStatus === 'published' && status !== 'published' ? new Date().toISOString() : undefined,
        scheduled_at: saveStatus === 'scheduled' ? new Date(scheduledAt).toISOString() : null,
        seo_title: seoData.seoTitle,
        seo_description: seoData.seoDescription,
        focus_keyword: seoData.focusKeyword,
        secondary_keywords: seoData.secondaryKeywords,
        canonical_url: seoData.canonicalUrl,
        og_title: seoData.ogTitle,
        og_description: seoData.ogDescription,
        og_image: seoData.ogImage,
        twitter_title: seoData.twitterTitle,
        twitter_description: seoData.twitterDescription,
        twitter_image: seoData.twitterImage,
        no_index: seoData.noIndex,
        no_follow: seoData.noFollow,
        seo_score: seoScore,
      };

      const response = await adminPut('/api/admin/blog', { id, ...postData });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save post');

      setStatus(saveStatus);
      setShowScheduleModal(false);
    } catch (err: any) {
      console.error('Error saving post:', err);
      setError(err.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteInput !== 'DELETE') return;
    
    setDeleting(true);
    try {
      const response = await adminDelete(`/api/admin/blog?id=${id}`);

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to delete post');
      
      router.push('/admin/blog');
    } catch (err: any) {
      console.error('Error deleting post:', err);
      setError(err.message || 'Failed to delete post');
    } finally {
      setDeleting(false);
    }
  };

  const canDelete = adminUser?.role === 'admin' || adminUser?.role === 'superadmin';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#1a237e]" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/blog"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Edit Blog Post</h1>
            <p className="text-slate-500 flex items-center gap-2">
              {status === 'published' && (
                <>
                  <span className="inline-flex items-center gap-1 text-green-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    Published
                  </span>
                  <a 
                    href={`/blog/${slug}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                </>
              )}
              {status === 'draft' && (
                <span className="text-slate-500">Draft</span>
              )}
              {status === 'scheduled' && (
                <span className="text-blue-600">Scheduled</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {canDelete && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>
          <button
            onClick={() => setShowScheduleModal(true)}
            disabled={saving}
            className="px-4 py-2 border border-blue-200 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Clock className="w-4 h-4" />
            Schedule
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="px-4 py-2 bg-[#1a237e] hover:bg-[#1a237e]/90 text-white rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {status === 'published' ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Schedule Post</h3>
            <div className="mb-4">
              <label className="block text-sm text-slate-600 mb-2">Publish Date & Time</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#1a237e]"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave('scheduled')}
                disabled={!scheduledAt || saving}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50"
              >
                {saving ? 'Scheduling...' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Blog Post</h3>
            <p className="text-slate-600 mb-4">
              This action cannot be undone. Type <strong>DELETE</strong> to confirm.
            </p>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full px-4 py-2 border border-slate-200 rounded-xl mb-4 text-slate-800 focus:outline-none focus:border-red-500"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteInput('');
                }}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteInput !== 'DELETE' || deleting}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter post title..."
              className="w-full text-2xl font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none"
            />
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
              <span>URL:</span>
              <span className="text-slate-400">/blog/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(generateSlug(e.target.value))}
                placeholder="post-url-slug"
                className="flex-1 text-slate-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Write a brief summary of your post..."
              rows={3}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#1a237e] resize-none"
            />
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Start writing your blog post..."
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Post Settings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-4">Post Settings</h3>
            
            {/* Featured Image */}
            <ImageUpload
              value={featuredImage}
              onChange={setFeaturedImage}
              label="Featured Image"
              className="mb-4"
            />

            {/* Category */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Folder className="w-4 h-4 inline mr-1" />
                Category
              </label>
              <CustomSelect
                value={category}
                onChange={setCategory}
                placeholder="Select category"
                options={CATEGORIES.map(cat => ({ value: cat, label: cat }))}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add tag..."
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:border-[#1a237e]"
                />
                <button
                  onClick={addTag}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-full text-sm text-slate-600"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="w-4 h-4 rounded-full hover:bg-slate-200 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* SEO Panel */}
          <SEOPanel
            title={title}
            content={content}
            slug={slug}
            seoData={seoData}
            onChange={(data) => setSeoData(prev => ({ ...prev, ...data }))}
          />
        </div>
      </div>
    </div>
  );
}

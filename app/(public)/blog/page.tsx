'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, ArrowRight, Calendar, Tag } from 'lucide-react';
import { blogPosts, getAllCategories } from '@/lib/data/blog';
import { useState } from 'react';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categories = getAllCategories();
  
  const filteredPosts = selectedCategory 
    ? blogPosts.filter(post => post.category === selectedCategory)
    : blogPosts;

  const featuredPost = blogPosts[0];
  const otherPosts = selectedCategory ? filteredPosts : filteredPosts.slice(1);

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/Random images/34_resize.jpg"
            alt="Blog"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0a0a0a]" />
        </div>

        <div className="relative z-10 text-center px-4 py-32">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block text-[#b1b94c] text-sm font-medium uppercase tracking-[0.3em] mb-6"
          >
            Stories & Insights
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-[family-name:var(--font-krona)] text-white mb-6 normal-case"
          >
            Our Blog
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg max-w-2xl mx-auto font-[family-name:var(--font-inter)]"
          >
            Discover culinary stories, dining tips, and the latest news from Three Monkeys Phuket
          </motion.p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === null
                  ? 'bg-[#b1b94c] text-black'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              All Posts
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-[#b1b94c] text-black'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post - Only show when no category filter */}
      {!selectedCategory && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Link href={`/blog/${featuredPost.slug}`} className="group block">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  {/* Image */}
                  <div className="relative aspect-[16/10] rounded-3xl overflow-hidden">
                    <Image
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Featured Badge */}
                    <div className="absolute top-6 left-6 px-4 py-2 bg-[#b1b94c] rounded-full">
                      <span className="text-black text-sm font-semibold">Featured</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="lg:pl-8">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="px-3 py-1 bg-white/10 rounded-full text-[#b1b94c] text-sm">
                        {featuredPost.category}
                      </span>
                      <span className="flex items-center gap-1.5 text-white/40 text-sm">
                        <Calendar className="w-4 h-4" />
                        {formatDate(featuredPost.publishedAt)}
                      </span>
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-krona)] text-white mb-4 group-hover:text-[#b1b94c] transition-colors normal-case leading-tight">
                      {featuredPost.title}
                    </h2>
                    
                    <p className="text-white/60 text-lg leading-relaxed mb-6 font-[family-name:var(--font-inter)]">
                      {featuredPost.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-white/40 text-sm">
                        <Clock className="w-4 h-4" />
                        {featuredPost.readTime} min read
                      </span>
                      
                      <span className="flex items-center gap-2 text-[#b1b94c] font-medium group-hover:gap-3 transition-all">
                        Read Article
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="py-16 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!selectedCategory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-2xl font-[family-name:var(--font-krona)] text-white normal-case">
                Latest Articles
              </h2>
            </motion.div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/blog/${post.slug}`} className="group block h-full">
                  <article className="h-full bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/10 hover:border-[#b1b94c]/30 transition-all duration-300">
                    {/* Image */}
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-[#b1b94c] text-black text-xs font-semibold rounded-full">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Meta */}
                      <div className="flex items-center gap-4 mb-3 text-sm text-white/40">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(post.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {post.readTime} min
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-[family-name:var(--font-krona)] text-white mb-3 group-hover:text-[#b1b94c] transition-colors normal-case line-clamp-2 leading-tight">
                        {post.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-white/50 text-sm leading-relaxed mb-4 font-[family-name:var(--font-inter)] line-clamp-2">
                        {post.excerpt}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="flex items-center gap-1 px-2 py-0.5 bg-white/5 rounded text-white/40 text-xs"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* CTA */}
                      <div className="pt-4 border-t border-white/10">
                        <span className="flex items-center gap-2 text-[#b1b94c] text-sm font-medium group-hover:gap-3 transition-all">
                          Read More
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/Random images/35_resize.jpg"
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-[#b1b94c]/90" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-krona)] text-black mb-4 normal-case">
              Stay Updated
            </h2>
            <p className="text-black/60 text-lg mb-8 font-[family-name:var(--font-inter)] max-w-xl mx-auto">
              Follow us on social media for the latest news, promotions, and behind-the-scenes content
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://www.facebook.com/threemonkeysphuket" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <button className="px-8 py-4 bg-black text-[#b1b94c] font-[family-name:var(--font-krona)] rounded-full hover:bg-black/80 transition-all">
                  Follow on Facebook
                </button>
              </a>
              <a 
                href="https://www.instagram.com/threemonkeysrestaurant/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <button className="px-8 py-4 bg-transparent border-2 border-black text-black font-[family-name:var(--font-krona)] rounded-full hover:bg-black hover:text-[#b1b94c] transition-all">
                  Follow on Instagram
                </button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

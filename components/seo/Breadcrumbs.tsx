'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbSchema } from '@/lib/seo/structured-data';
import { siteConfig } from '@/lib/seo/config';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const allItems = [{ label: 'Home', href: '/' }, ...items];
  
  const schemaItems = allItems.map((item, index) => ({
    name: item.label,
    url: item.href ? `${siteConfig.url}${item.href}` : `${siteConfig.url}`,
  }));

  return (
    <>
      <BreadcrumbSchema items={schemaItems} />
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center text-sm ${className}`}
      >
        <ol className="flex items-center space-x-2">
          {allItems.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />
              )}
              {item.href && index !== allItems.length - 1 ? (
                <Link
                  href={item.href}
                  className="text-slate-600 hover:text-[#1a237e] transition-colors flex items-center gap-1"
                >
                  {index === 0 && <Home className="w-4 h-4" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className="text-slate-900 font-medium flex items-center gap-1"
                  aria-current="page"
                >
                  {index === 0 && <Home className="w-4 h-4" />}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

export function BreadcrumbsLight({ items, className = '' }: BreadcrumbsProps) {
  const allItems = [{ label: 'Home', href: '/' }, ...items];
  
  const schemaItems = allItems.map((item) => ({
    name: item.label,
    url: item.href ? `${siteConfig.url}${item.href}` : `${siteConfig.url}`,
  }));

  return (
    <>
      <BreadcrumbSchema items={schemaItems} />
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center text-sm ${className}`}
      >
        <ol className="flex items-center space-x-2">
          {allItems.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 mx-2 text-white/50" />
              )}
              {item.href && index !== allItems.length - 1 ? (
                <Link
                  href={item.href}
                  className="text-white/80 hover:text-white transition-colors flex items-center gap-1"
                >
                  {index === 0 && <Home className="w-4 h-4" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className="text-white font-medium flex items-center gap-1"
                  aria-current="page"
                >
                  {index === 0 && <Home className="w-4 h-4" />}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

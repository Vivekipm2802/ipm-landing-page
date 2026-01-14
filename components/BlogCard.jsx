'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function BlogCard({ blog }) {
  return (
    <Link href={`/blogs/${blog.slug}`} className="block">
      <div 
        className="rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 h-full"
        style={{
          backgroundColor: '#0F172B',
          border: '1px solid rgba(245, 158, 11, 0.15)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.15)';
        }}
      >
        {blog.coverImage && (
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={blog.coverImage}
              alt={blog.title}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        )}
        
        <div className="p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 text-white hover:text-[#F59E0B] transition-colors line-clamp-2">
            {blog.title}
          </h2>
          
          <p className="text-slate-400 text-sm mb-3">
            {new Date(blog.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          
          {blog.excerpt && (
            <p className="text-slate-300 mb-4 line-clamp-3 text-sm sm:text-base">
              {blog.excerpt}
            </p>
          )}
          
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    color: '#a5b4fc',
                    border: '1px solid rgba(245, 158, 11, 0.15)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

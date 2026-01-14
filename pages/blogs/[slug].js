// pages/blogs/[slug].jsx
import Image from 'next/image';
import Head from 'next/head';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

export default function BlogPage({ blog }) {
  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#050818' }}>
        <p className="text-white text-xl">Blog post not found</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{blog.title} | EduNext</title>
        <meta name="description" content={blog.excerpt || `Read ${blog.title}`} />
      </Head>

      <div className="min-h-screen w-full" style={{ backgroundColor: '#050818' }}>
        <article className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
          
          {/* Cover Image */}
          {blog.coverImage && (
            <div 
              className="relative w-full mb-6 sm:mb-8 rounded-xl overflow-hidden shadow-2xl"
              style={{ 
                border: '1px solid rgba(245, 158, 11, 0.15)',
                aspectRatio: '16/9'
              }}
            >
              <Image
                src={blog.coverImage}
                alt={blog.title}
                width={2400}
                height={1350}
                priority
                className="object-contain w-full h-full"
              />
            </div>
          )}

          {/* Header Section */}
          <header className="mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              {blog.title}
            </h1>
            
            <div className="flex items-center gap-3 sm:gap-4 text-slate-400 mb-3 sm:mb-4 text-sm md:text-base flex-wrap">
              <time className="font-medium">
                Published: {new Date(blog.date).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </time>
              
              {blog.lastModified && (
                <>
                  <span className="text-slate-600">•</span>
                  <span style={{ color: '#F59E0B' }} className="font-semibold italic">
                    Updated: {new Date(blog.lastModified).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </span>
                </>
              )}

              {blog.author && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="font-medium text-slate-300">{blog.author}</span>
                </>
              )}
            </div>
            
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
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
          </header>

          {/* Content Area with Inline Styles */}
          <div
            className="blog-content"
            style={{
              color: '#cbd5e1', // slate-300
              lineHeight: '1.75',
              fontSize: '1.125rem',
            }}
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </article>
      </div>

      {/* Add scoped styles */}
      <style jsx>{`
        .blog-content {
          max-width: none;
        }

        .blog-content :global(h1),
        .blog-content :global(h2),
        .blog-content :global(h3),
        .blog-content :global(h4),
        .blog-content :global(h5),
        .blog-content :global(h6) {
          color: #ffffff;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }

        .blog-content :global(h1) {
          font-size: 2.25rem;
        }

        .blog-content :global(h2) {
          font-size: 1.875rem;
          border-bottom: 1px solid rgba(71, 85, 105, 0.5);
          padding-bottom: 0.5rem;
        }

        .blog-content :global(h3) {
          font-size: 1.5rem;
        }

        .blog-content :global(p) {
          color: #cbd5e1;
          line-height: 1.75;
          margin-bottom: 1rem;
        }

        .blog-content :global(a) {
          color: #F59E0B;
          text-decoration: none;
          font-weight: 500;
        }

        .blog-content :global(a:hover) {
          text-decoration: underline;
          color: #D97706;
        }

        .blog-content :global(strong) {
          color: #ffffff;
          font-weight: 600;
        }

        .blog-content :global(em) {
          color: #e2e8f0;
        }

        .blog-content :global(code) {
          color: #F59E0B;
          background-color: #0F172B;
          padding: 0.125rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-family: 'Courier New', monospace;
        }

        .blog-content :global(pre) {
          background-color: #0F172B;
          border: 1px solid rgba(245, 158, 11, 0.15);
          border-radius: 0.5rem;
          padding: 1rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }

        .blog-content :global(pre code) {
          background-color: transparent;
          padding: 0;
          color: #cbd5e1;
        }

        .blog-content :global(ul),
        .blog-content :global(ol) {
          color: #cbd5e1;
          margin: 1rem 0;
          padding-left: 2rem;
        }

        .blog-content :global(li) {
          color: #cbd5e1;
          line-height: 1.75;
          margin: 0.5rem 0;
        }

        .blog-content :global(li::marker) {
          color: #F59E0B;
        }

        .blog-content :global(blockquote) {
          border-left: 4px solid #F59E0B;
          background-color: #0F172B;
          padding: 1rem;
          margin: 1.5rem 0;
          color: #cbd5e1;
          font-style: italic;
          border-radius: 0 0.25rem 0.25rem 0;
        }

        .blog-content :global(img) {
          border-radius: 0.75rem;
          border: 1px solid rgba(245, 158, 11, 0.15);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          margin: 1.5rem 0;
        }

        .blog-content :global(hr) {
          border-color: rgba(245, 158, 11, 0.15);
          margin: 2rem 0;
        }

        .blog-content :global(table) {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          overflow-x: auto;
          display: block;
        }

        .blog-content :global(thead) {
          border-bottom: 2px solid #F59E0B;
        }

        .blog-content :global(th) {
          border: 1px solid rgba(245, 158, 11, 0.15);
          padding: 0.75rem 1rem;
          background-color: #0F172B;
          color: #ffffff;
          font-weight: 600;
          text-align: left;
        }

        .blog-content :global(td) {
          border: 1px solid rgba(245, 158, 11, 0.15);
          padding: 0.75rem 1rem;
          color: #cbd5e1;
        }

        .blog-content :global(tr) {
          border-bottom: 1px solid rgba(245, 158, 11, 0.1);
        }

        .blog-content :global(tbody tr:hover) {
          background-color: rgba(245, 158, 11, 0.05);
        }
      `}</style>
    </>
  );
}

export async function getStaticPaths() {
  const blogsDirectory = path.join(process.cwd(), 'content', 'blogs');
  
  if (!fs.existsSync(blogsDirectory)) {
    return { paths: [], fallback: 'blocking' };
  }

  const fileNames = fs.readdirSync(blogsDirectory);
  const paths = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => ({
      params: { slug: fileName.replace(/\.md$/, '') },
    }));

  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  try {
    const blogsDirectory = path.join(process.cwd(), 'content', 'blogs');
    const fullPath = path.join(blogsDirectory, `${params.slug}.md`);

    if (!fs.existsSync(fullPath)) {
      return { notFound: true };
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    const processedContent = await remark()
      .use(remarkGfm)
      .use(html)
      .process(content);

    const blog = {
      slug: params.slug,
      content: processedContent.toString(),
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString(),
      lastModified: data.lastModified,
      author: data.author,
      excerpt: data.excerpt,
      coverImage: data.coverImage,
      tags: data.tags || [],
    };

    return {
      props: { blog },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error loading blog:', error);
    return { notFound: true };
  }
}
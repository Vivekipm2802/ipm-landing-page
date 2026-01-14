import Link from "next/link";
import Image from "next/image";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";

export default function BlogsPage({ blogs, error, debugInfo }) {
  return (
    <main
      className="min-h-screen w-full"
      style={{ backgroundColor: "#050818" }}
    >
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl">
        <header className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            Blog Posts
          </h1>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-slate-400">
            Exploring the latest in technology and design.
          </p>
        </header>

        {/* Debug Info */}
        {/* <div className="mb-8 p-6 rounded-xl border border-yellow-500/30 bg-yellow-900/10">
          <h2 className="text-xl font-bold text-yellow-400 mb-4">🔍 Debug</h2>
          <div className="space-y-2 text-sm text-white">
            <p><strong>Status:</strong> {error ? '❌ Error' : blogs.length > 0 ? '✅ Found' : '⚠️ None'}</p>
            <p><strong>Path:</strong> <code className="bg-slate-800 px-2 py-1 rounded text-xs">{debugInfo.contentPath}</code></p>
            <p><strong>Files:</strong> {debugInfo.filesFound.length > 0 ? 
              <span className="text-green-400">{debugInfo.filesFound.join(', ')}</span> : 
              <span className="text-red-400">None</span>}
            </p>
            <p><strong>Blogs:</strong> <span className={blogs.length > 0 ? 'text-green-400' : 'text-red-400'}>{blogs.length}</span></p>
            {error && <p className="text-red-400 mt-2 text-xs"><strong>Error:</strong> {error}</p>}
          </div>
        </div> */}

        {blogs.length === 0 ? (
          <div className="text-center py-20 rounded-2xl bg-[#0F172B] border border-[rgba(245,158,11,0.15)]">
            <p className="text-xl text-slate-400">
              No blogs found. Add .md files to content/blogs/
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Link key={blog.slug} href={`/blogs/${blog.slug}`}>
                <div className="rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 h-full cursor-pointer hover:-translate-y-1 bg-[#0F172B] border border-[rgba(245,158,11,0.15)]">
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
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-2 text-white hover:text-[#F59E0B] transition-colors line-clamp-2">
                      {blog.title}
                    </h2>
                    <p className="text-slate-400 text-sm mb-3">
                      {new Date(blog.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    {blog.excerpt && (
                      <p className="text-slate-300 mb-4 line-clamp-3">
                        {blog.excerpt}
                      </p>
                    )}
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {blog.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-3 py-1 rounded-full font-medium bg-[rgba(99,102,241,0.15)] text-[#a5b4fc] border border-[rgba(245,158,11,0.15)]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export async function getStaticProps() {
  let blogs = [];
  let error = null;
  let debugInfo = { contentPath: "", filesFound: [] };

  try {
    const blogsDirectory = path.join(process.cwd(), "content", "blogs");
    debugInfo.contentPath = blogsDirectory;

    // Check if directory exists
    if (!fs.existsSync(blogsDirectory)) {
      throw new Error(`Directory not found: ${blogsDirectory}`);
    }

    // Get all .md files
    const fileNames = fs.readdirSync(blogsDirectory);
    debugInfo.filesFound = fileNames;

    const mdFiles = fileNames.filter((fileName) => fileName.endsWith(".md"));

    // Process each markdown file
    const blogPromises = mdFiles.map(async (fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(blogsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      const processedContent = await remark()
        .use(remarkGfm)
        .use(html)
        .process(content);

      return {
        slug,
        content: processedContent.toString(),
        title: data.title || "Untitled",
        date: data.date || new Date().toISOString(),
        lastModified: data.lastModified,
        author: data.author,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        tags: data.tags || [],
      };
    });

    blogs = await Promise.all(blogPromises);

    // Sort by date
    blogs.sort((a, b) => {
      const timeA = new Date(a.date || 0).getTime();
      const timeB = new Date(b.date || 0).getTime();
      return timeB - timeA;
    });
  } catch (e) {
    error = e.message || String(e);
    console.error("Error loading blogs:", e);
  }

  return {
    props: {
      blogs: blogs.map((b) => ({
        slug: b.slug,
        title: b.title,
        date: b.date,
        excerpt: b.excerpt || null,
        coverImage: b.coverImage || null,
        tags: b.tags || [],
      })),
      error,
      debugInfo,
    },
    revalidate: 60,
  };
}

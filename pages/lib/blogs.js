const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { remark } = require('remark');
const html = require('remark-html');
const remarkGfm = require('remark-gfm');

const blogsDirectory = path.join(process.cwd(), 'content/blogs');

async function getBlogBySlug(slug) {
  const fullPath = path.join(blogsDirectory, `${slug}.md`);
  
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Blog post not found: ${slug}`);
  }
  
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const processedContent = await remark()
    .use(remarkGfm)
    .use(html)
    .process(content);
    
  const contentHtml = processedContent.toString();

  return {
    slug,
    content: contentHtml,
    title: data.title || 'Untitled',
    date: data.date || new Date().toISOString(),
    lastModified: data.lastModified,
    author: data.author,
    excerpt: data.excerpt,
    coverImage: data.coverImage,
    tags: data.tags || [],
  };
}

function getAllBlogSlugs() {
  if (!fs.existsSync(blogsDirectory)) return [];
  const fileNames = fs.readdirSync(blogsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => ({ slug: fileName.replace(/\.md$/, '') }));
}

async function getAllBlogs() {
  const slugs = getAllBlogSlugs();
  const blogs = await Promise.all(
    slugs.map(({ slug }) => getBlogBySlug(slug))
  );
  
  return blogs.sort((a, b) => {
    const timeA = new Date(a.date || 0).getTime();
    const timeB = new Date(b.date || 0).getTime();
    return timeB - timeA;
  });
}

module.exports = { getBlogBySlug, getAllBlogSlugs, getAllBlogs };
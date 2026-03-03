import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeSlug from "rehype-slug";

const postsDirectory = path.join(process.cwd(), "src/data/blog");

export type PostCategory =
  | "detrazioni"
  | "bollette"
  | "bonus"
  | "risparmio"
  | "isee";

export interface PostMeta {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: PostCategory;
  tags: string[];
  readingTime: string;
  coverImage?: string;
}

export interface Post extends PostMeta {
  content: string;
}

function getPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  return fs
    .readdirSync(postsDirectory)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeStringify)
    .process(markdown);

  return result.toString();
}

export function getAllPosts(): PostMeta[] {
  const slugs = getPostSlugs();

  const posts = slugs
    .map((slug) => {
      const filePath = path.join(postsDirectory, `${slug}.md`);
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(fileContents);
      const stats = readingTime(content);

      return {
        slug,
        title: data.title,
        excerpt: data.excerpt,
        date: data.date,
        category: data.category as PostCategory,
        tags: data.tags ?? [],
        readingTime: stats.text,
        coverImage: data.coverImage ?? undefined,
      } satisfies PostMeta;
    })
    .sort((a, b) => (a.date > b.date ? -1 : 1));

  return posts;
}

export async function getPostBySlug(slug: string): Promise<Post> {
  const filePath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);
  const stats = readingTime(content);
  const htmlContent = await markdownToHtml(content);

  return {
    slug,
    title: data.title,
    excerpt: data.excerpt,
    date: data.date,
    category: data.category as PostCategory,
    tags: data.tags ?? [],
    readingTime: stats.text,
    coverImage: data.coverImage ?? undefined,
    content: htmlContent,
  };
}

export function getPostsByCategory(category: string): PostMeta[] {
  return getAllPosts().filter((post) => post.category === category);
}

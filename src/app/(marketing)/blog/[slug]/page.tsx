import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllPosts, type PostCategory } from "@/lib/blog";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";

const categoryLabels: Record<PostCategory, string> = {
  detrazioni: "Detrazioni",
  bollette: "Bollette",
  bonus: "Bonus",
  risparmio: "Risparmio",
  isee: "ISEE",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("it-IT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface BlogPostPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  try {
    const post = await getPostBySlug(params.slug);
    return {
      title: post.title,
      description: post.excerpt,
    };
  } catch {
    return {
      title: "Articolo non trovato",
    };
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  let post;
  try {
    post = await getPostBySlug(params.slug);
  } catch {
    notFound();
  }

  const allPosts = getAllPosts();
  const relatedPosts = allPosts
    .filter((p) => p.slug !== post.slug)
    .filter(
      (p) =>
        p.category === post.category ||
        p.tags?.some((t) => post.tags?.includes(t))
    )
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: "RisparmiaMi",
    },
    publisher: {
      "@type": "Organization",
      name: "RisparmiaMi",
    },
    ...(post.coverImage && { image: post.coverImage }),
  };

  return (
    <section className="py-section-y">
      <Container>
        <article className="max-w-[720px] mx-auto">
          {/* Back Link */}
          <Link
            href="/blog"
            className="inline-flex items-center text-small text-text-secondary hover:text-accent-primary transition-colors mb-8"
          >
            &larr; Torna al blog
          </Link>

          {/* Post Header */}
          <header className="mb-10">
            <div className="mb-4">
              <Badge>{categoryLabels[post.category]}</Badge>
            </div>

            <h1 className="font-heading text-display text-text-primary mb-4">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-small text-text-muted">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span aria-hidden="true">&middot;</span>
              <span>{post.readingTime}</span>
            </div>
          </header>

          {/* Post Content */}
          <div
            className="prose prose-lg max-w-none
              prose-headings:font-heading prose-headings:text-text-primary
              prose-p:text-text-secondary prose-p:leading-relaxed
              prose-a:text-accent-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-text-primary
              prose-li:text-text-secondary
              prose-blockquote:border-accent-primary prose-blockquote:text-text-secondary"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* CTA */}
          <section className="mt-12 p-8 bg-bg-secondary rounded-lg text-center">
            <h3 className="font-heading text-xl mb-3">Scopri quanto puoi risparmiare</h3>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              Il nostro tool gratuito analizza la tua situazione e ti mostra tutte le opportunità di risparmio disponibili.
            </p>
            <a href="/tools/calcola-risparmio" className="inline-block bg-accent-primary text-white px-6 py-3 rounded-sm font-medium hover:bg-accent-primary/90 transition-colors">
              Calcola il tuo risparmio gratuito
            </a>
          </section>

          {/* Articoli correlati */}
          {relatedPosts.length > 0 && (
            <section className="mt-12 pt-8 border-t border-border-light">
              <h3 className="font-heading text-xl mb-6">Articoli correlati</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {relatedPosts.map((relPost) => (
                  <Link key={relPost.slug} href={`/blog/${relPost.slug}`} className="group">
                    <div className="p-4 rounded-lg border border-border-light hover:border-accent-primary/30 transition-colors">
                      <p className="text-xs text-accent-primary font-medium mb-1">
                        {categoryLabels[relPost.category]}
                      </p>
                      <h4 className="font-medium text-sm group-hover:text-accent-primary transition-colors mb-2">
                        {relPost.title}
                      </h4>
                      <p className="text-xs text-text-muted">{relPost.excerpt}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </Container>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}

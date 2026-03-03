import { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, type PostCategory } from "@/lib/blog";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Blog | Consigli per Risparmiare",
  description:
    "Consigli pratici per risparmiare ogni giorno: guide su detrazioni fiscali, bollette, bonus, ISEE e gestione delle spese per le famiglie italiane.",
};

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

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <section className="py-section-y">
      <Container>
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-heading text-display text-text-primary mb-4">
            Blog
          </h1>
          <p className="text-body text-text-secondary max-w-2xl mx-auto">
            Consigli pratici per risparmiare ogni giorno
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="border border-border-light bg-white rounded-md shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              <div className="p-6 flex flex-col flex-1">
                {/* Category Badge */}
                <div className="mb-3">
                  <Badge>{categoryLabels[post.category]}</Badge>
                </div>

                {/* Title */}
                <h2 className="font-heading text-h3 text-text-primary mb-2 line-clamp-2">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:text-accent-primary transition-colors"
                  >
                    {post.title}
                  </Link>
                </h2>

                {/* Excerpt */}
                <p className="text-small text-text-secondary mb-4 line-clamp-3 flex-1">
                  {post.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center justify-between text-small text-text-muted pt-4 border-t border-border-light">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  <span>{post.readingTime}</span>
                </div>

                {/* Read Link */}
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-4 inline-flex items-center text-small font-medium text-accent-primary hover:underline"
                >
                  Leggi &rarr;
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {posts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-text-secondary">
              Nessun articolo disponibile al momento.
            </p>
          </div>
        )}
      </Container>
    </section>
  );
}

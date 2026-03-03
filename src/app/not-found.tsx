import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <Container size="narrow">
        <div className="flex flex-col items-center text-center gap-6">
          <p className="font-heading text-8xl text-text-muted select-none">
            404
          </p>

          <h1 className="font-heading text-3xl md:text-4xl text-text-primary">
            Pagina non trovata
          </h1>

          <p className="text-text-secondary text-lg max-w-md">
            La pagina che stai cercando non esiste o è stata spostata.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link href="/">
              <Button size="lg">Torna alla homepage</Button>
            </Link>
            <Link href="/blog">
              <Button variant="secondary" size="lg">
                Vai al blog
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

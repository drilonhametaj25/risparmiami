# 🏗️ PROMPT MASTER — RisparmioMi: Piattaforma SaaS Completa

## ISTRUZIONI PER CLAUDE CODE

Devi costruire **RisparmioMi** (dominio: risparmio.mi.pro o risparmiomi.it), una piattaforma SaaS che aiuta italiani e aziende italiane a scoprire tutti i soldi che stanno perdendo senza saperlo: detrazioni non sfruttate, bonus non richiesti, bollette troppo care, conti bancari costosi, abbonamenti dimenticati, rimborsi voli/treni mai richiesti, errori ISEE.

**Esegui le fasi IN ORDINE. Non saltare avanti. Ogni fase ha dei deliverable chiari — completali tutti prima di passare alla successiva.**

---

## 🎨 DESIGN DIRECTION (VALE PER TUTTO IL PROGETTO)

### Estetica: "Italian Fintech Minimalism"
- Tono: **luxury minimal, pulito, professionale, autorevole**
- Ispirazione visiva: Revolut/N26 incontra la sensibilità italiana. Pensa a uno studio di architettura milanese che progetta un'app fintech.
- **NO** a: gradienti viola, illustrazioni cartoon, estetica "AI slop", pattern stock, emoji come decorazione, layout cookie-cutter
- **SÌ** a: tipografia forte e leggibile, spazio bianco generoso, accenti di colore decisi ma pochi, micro-animazioni raffinate, gerarchia visiva cristallina

### Palette Colori
```css
:root {
  /* Base */
  --bg-primary: #FAFAF8;        /* Warm off-white, non il bianco freddo */
  --bg-secondary: #F2F0EC;      /* Grigio caldo leggerissimo */
  --bg-dark: #1A1A1A;           /* Per sezioni dark/footer */

  /* Testo */
  --text-primary: #1A1A1A;      /* Nero ricco, non nero pieno */
  --text-secondary: #6B6B6B;    /* Grigio medio per testo secondario */
  --text-muted: #9B9B9B;        /* Grigio chiaro per hint */

  /* Brand */
  --accent-primary: #0066FF;    /* Blu deciso — fiducia, finanza */
  --accent-success: #00A86B;    /* Verde risparmio — usato per importi positivi */
  --accent-warning: #F5A623;    /* Ambra — per "da verificare" */
  --accent-danger: #E53E3E;     /* Rosso — per perdite/errori */

  /* Elevazione */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.06);
  --shadow-lg: 0 12px 40px rgba(0,0,0,0.08);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
}
```

### Tipografia
- **Heading**: `"Instrument Serif"` (Google Fonts) — elegante, editoriale, non banale
- **Body/UI**: `"Satoshi"` (FontShare) o `"General Sans"` — geometric sans-serif moderno, non il solito Inter
- **Numeri/Importi**: `"JetBrains Mono"` o `"Space Mono"` — monospace per importi e dati, dà un tocco fintech
- Font size base: 16px, line-height 1.6 per body text
- Heading scale: 3rem / 2.25rem / 1.75rem / 1.25rem / 1rem

### Componenti UI
- Card con border sottile `1px solid rgba(0,0,0,0.06)` + shadow-sm, NON bordi grossi
- Bottoni: filled (accent) per CTA primarie, ghost/outline per secondarie. Corner radius 8px. Mai troppo grossi.
- Input: border-bottom o contorno sottile, focus state con accent-primary. Minimal.
- Badge certezza: 🟢 Verde pieno / 🟡 Ambra pieno / 🔴 Rosso outline — piccoli, pill-shaped
- Animazioni: `framer-motion` per transizioni di pagina e reveal on scroll. Durata 0.3-0.5s, ease-out. Mai esagerate.
- No icone colorate stock. Usa `lucide-react` per icone line-style coerenti.

### Layout Principles
- Max-width contenuto: 1200px. Padding laterale generoso (24-48px mobile, 80-120px desktop).
- Grid asimmetrica dove ha senso (es. hero 60/40, non sempre 50/50)
- Sezioni alternate: sfondo chiaro / sfondo leggermente più scuro per ritmo
- Mobile-first. La dashboard DEVE funzionare perfettamente su mobile.

---

## 📐 ARCHITETTURA TECNICA

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 14+)                │
│  App Router · Server Components · TailwindCSS            │
│  framer-motion · lucide-react · react-hook-form          │
│  next-intl (i18n futuro) · next-seo                      │
├─────────────────────────────────────────────────────────┤
│                    BACKEND (Next.js API Routes)          │
│  tRPC o Server Actions · Stripe SDK · Resend (email)     │
│  puppeteer/playwright (PDF gen) · node-cron              │
├─────────────────────────────────────────────────────────┤
│                    DATA LAYER                            │
│  PostgreSQL (Hetzner) · Prisma ORM                       │
│  Redis (caching regole + sessioni)                       │
│  Meilisearch (search full-text regole/blog/leggi)        │
├─────────────────────────────────────────────────────────┤
│                    SCRAPER ENGINE (Python)                │
│  Script separato · requests + BeautifulSoup              │
│  PyPDF2 / pdfplumber per parsing PDF                     │
│  Anthropic API per estrazione strutturata                │
│  Cron: settimanale/mensile                               │
├─────────────────────────────────────────────────────────┤
│                    INFRA (Hetzner)                        │
│  Docker Compose: next + postgres + redis + meilisearch   │
│  Nginx reverse proxy · Let's Encrypt SSL                 │
│  GitHub Actions per CI/CD                                │
└─────────────────────────────────────────────────────────┘
```

### Perché queste scelte:
- **PostgreSQL** (non Supabase) perché deploy su Hetzner, pieno controllo, costo zero per il DB
- **Meilisearch** invece di Elasticsearch: più leggero, più facile da hostare, perfetto per search su regole/blog/leggi, ottimo per l'italiano. Typo-tolerant e velocissimo. Gira in un container Docker da 50MB
- **Redis**: cache delle regole matchate per utente (evita ricalcolo ogni page load), sessioni, rate limiting
- **Python per scraper**: ecosystem migliore per PDF parsing (pdfplumber è 10x migliore di qualsiasi lib Node per tabelle PDF), requests+BeautifulSoup per scraping web, ottima integrazione con Anthropic API
- **Prisma**: type-safe, migrazioni facili, ottimo DX con TypeScript

---

## FASE 0: SETUP PROGETTO E INFRASTRUTTURA
**Tempo stimato: 2-3 ore**

### Step 0.1: Inizializza il progetto Next.js
```bash
npx create-next-app@latest risparmiomi --typescript --tailwind --eslint --app --src-dir
cd risparmiomi
```

### Step 0.2: Installa dipendenze core
```bash
# UI e Design
npm install framer-motion lucide-react clsx tailwind-merge
npm install @tailwindcss/typography @tailwindcss/forms

# Backend e Data
npm install prisma @prisma/client
npm install stripe @stripe/stripe-js
npm install resend
npm install next-auth @auth/prisma-adapter
npm install zod react-hook-form @hookform/resolvers

# SEO e Content
npm install next-seo next-sitemap
npm install gray-matter remark remark-html reading-time

# Utils
npm install date-fns slugify
npm install sharp # per ottimizzazione immagini

# Dev
npm install -D @types/node prisma
```

### Step 0.3: Struttura cartelle
```
src/
├── app/
│   ├── (marketing)/          # Landing, blog, tools gratuiti
│   │   ├── page.tsx          # Homepage / Landing
│   │   ├── come-funziona/
│   │   ├── prezzi/
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── tools/            # Mini-tools gratuiti SEO
│   │   │   ├── calcola-risparmio/
│   │   │   ├── verifica-bonus/
│   │   │   ├── confronta-bollette/
│   │   │   └── checklist-abbonamenti/
│   │   └── guida-pdf/        # Landing vendita PDF
│   │
│   ├── (auth)/
│   │   ├── login/
│   │   ├── registrati/
│   │   └── reset-password/
│   │
│   ├── (dashboard)/          # Area utente autenticata
│   │   ├── layout.tsx        # Sidebar + header dashboard
│   │   ├── dashboard/
│   │   │   └── page.tsx      # Overview risparmio
│   │   ├── onboarding/       # Questionario iniziale
│   │   │   ├── personale/
│   │   │   └── azienda/
│   │   ├── azioni/           # Todo list risparmio
│   │   ├── detrazioni/       # Dettaglio detrazioni
│   │   ├── bollette/         # Analisi bollette
│   │   ├── banca/            # Analisi costi bancari
│   │   ├── abbonamenti/      # Checklist abbonamenti
│   │   ├── trasporti/        # Rimborsi voli/treni
│   │   ├── isee/             # Analisi ISEE
│   │   ├── incentivi/        # Solo per piano Azienda
│   │   ├── impostazioni/
│   │   └── abbonamento/      # Gestione piano Stripe
│   │
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   ├── stripe/
│   │   │   ├── checkout/
│   │   │   ├── portal/
│   │   │   └── webhook/
│   │   ├── rules/
│   │   │   ├── match/        # POST: calcola match per utente
│   │   │   └── search/       # GET: cerca regole
│   │   ├── pdf/
│   │   │   └── generate/     # POST: genera PDF personalizzato
│   │   └── onboarding/
│   │       └── submit/
│   │
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                   # Componenti base riutilizzabili
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── progress.tsx
│   │   ├── modal.tsx
│   │   ├── toast.tsx
│   │   ├── skeleton.tsx
│   │   └── ...
│   ├── marketing/            # Componenti landing/sito pubblico
│   │   ├── hero.tsx
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   ├── pricing-table.tsx
│   │   ├── testimonials.tsx
│   │   ├── faq-accordion.tsx
│   │   ├── savings-counter.tsx  # Animazione contatore €
│   │   └── ...
│   ├── dashboard/            # Componenti area utente
│   │   ├── sidebar.tsx
│   │   ├── savings-overview.tsx
│   │   ├── action-card.tsx
│   │   ├── rule-match-card.tsx
│   │   ├── progress-tracker.tsx
│   │   ├── certainty-badge.tsx
│   │   └── ...
│   └── onboarding/           # Componenti questionario
│       ├── step-indicator.tsx
│       ├── question-card.tsx
│       ├── range-selector.tsx
│       └── ...
│
├── lib/
│   ├── prisma.ts             # Prisma client singleton
│   ├── stripe.ts             # Stripe client + helpers
│   ├── auth.ts               # NextAuth config
│   ├── email.ts              # Resend helpers
│   ├── rule-engine.ts        # 🔥 Core: matching logic
│   ├── pdf-generator.ts      # Generazione PDF guida
│   ├── meilisearch.ts        # Client Meilisearch
│   ├── redis.ts              # Client Redis
│   ├── seo.ts                # SEO helpers
│   └── utils.ts              # Utility varie
│
├── data/
│   ├── rules/                # JSON regole (seed iniziale)
│   │   ├── detrazioni-fiscali.json
│   │   ├── bonus-inps.json
│   │   ├── bollette.json
│   │   ├── banca.json
│   │   ├── trasporti.json
│   │   ├── isee.json
│   │   └── incentivi-imprese.json
│   └── blog/                 # Post markdown
│       └── *.md
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
└── scraper/                  # Python scraper engine (separato)
    ├── requirements.txt
    ├── main.py
    ├── scrapers/
    │   ├── normattiva.py
    │   ├── agenzia_entrate.py
    │   ├── arera.py
    │   ├── banca_italia.py
    │   ├── inps.py
    │   ├── incentivi_gov.py
    │   └── trasporti.py
    ├── extractors/
    │   ├── pdf_extractor.py
    │   ├── rule_extractor.py  # Usa Claude API
    │   └── diff_checker.py    # Confronta regole nuove vs esistenti
    ├── config.py
    └── cron_schedule.py
```

### Step 0.4: Schema Database (Prisma)
Crea il file `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== AUTH ====================

model User {
  id              String    @id @default(cuid())
  email           String    @unique
  name            String?
  hashedPassword  String?
  emailVerified   DateTime?
  image           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  accounts        Account[]
  sessions        Session[]
  profile         UserProfile?
  companyProfile  CompanyProfile?
  matches         UserMatch[]
  actions         UserAction[]
  subscription    Subscription?
  pdfPurchases    PdfPurchase[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ==================== PROFILI UTENTE ====================

model UserProfile {
  id                    String   @id @default(cuid())
  userId                String   @unique
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Anagrafica
  birthYear             Int?
  region                String?
  province              String?
  maritalStatus         String?  // single, married, divorced, widowed
  childrenCount         Int?     @default(0)
  childrenAges          Int[]    // array di età
  citizenship           String?  @default("IT")

  // Lavoro e Reddito
  employmentType        String?  // dipendente, autonomo, partita_iva, disoccupato, pensionato, studente
  contractType          String?  // indeterminato, determinato, apprendistato, collaborazione
  incomeRange           String?  // "0-8000", "8001-15000", "15001-28000", "28001-50000", "50001+"
  iseeRange             String?  // range ISEE se conosciuto
  hasCommercialistaOrCaf Boolean? @default(false)

  // Abitazione
  housingType           String?  // proprietario, affittuario
  isPrimaryResidence    Boolean? @default(true)
  rentAmountRange       String?  // range mensile
  hasMortgage           Boolean? @default(false)
  hasRenovatedRecently  Boolean? @default(false)
  renovationYear        Int?
  heatingType           String?  // gas, pompa_calore, elettrico, pellet

  // Utenze
  electricityProvider   String?
  electricityBimonthly  String?  // range spesa bimestrale
  gasProvider           String?
  gasBimonthly          String?  // range spesa bimestrale

  // Banca
  bankName              String?
  accountType           String?  // tradizionale, online, postale
  accountAgeYears       String?  // <2, 2-5, 5-10, >10
  estimatedBankCost     String?  // range annuo

  // Altro
  hasInsurance          Boolean? @default(false)
  insuranceTypes        String[] // vita, casa, auto, salute
  travelFrequency       String?  // mai, raramente, mensile, settimanale
  hasPets               Boolean? @default(false)
  medicalExpensesRange  String?  // range annuo
  hasChildrenInSchool   Boolean? @default(false)
  hasChildrenInDaycare  Boolean? @default(false)
  subscriptionCount     String?  // 0, 1-3, 4-6, 7+

  // Metadata
  onboardingCompleted   Boolean  @default(false)
  onboardingStep        Int      @default(0)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model CompanyProfile {
  id                    String   @id @default(cuid())
  userId                String   @unique
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Azienda
  companyName           String?
  legalForm             String?  // srl, srls, sas, snc, ditta_individuale, cooperativa
  atecoCode             String?
  atecoDescription      String?
  region                String?
  province              String?
  foundedYear           Int?
  employeeCount         String?  // 0, 1-5, 6-15, 16-50, 50+
  revenueRange          String?  // range fatturato annuo

  // Fiscalità
  taxRegime             String?  // ordinario, forfettario, semplificato
  hasAccountant         Boolean? @default(false)
  hasRequestedTaxCredits Boolean? @default(false)

  // Investimenti
  investsInTraining     Boolean? @default(false)
  investsInRD           Boolean? @default(false)
  boughtEquipmentRecently Boolean? @default(false)

  // Costi Operativi
  energyCostRange       String?
  gasCostRange          String?
  telecomCostRange      String?
  hasCompanyVehicles    Boolean? @default(false)

  // Dipendenti
  offersWelfare         Boolean? @default(false)
  hasApprentices        Boolean? @default(false)
  hiredRecently         Boolean? @default(false)
  hiredYouth            Boolean? @default(false)
  hiredWomen            Boolean? @default(false)
  hiredDisadvantaged    Boolean? @default(false)

  // Metadata
  onboardingCompleted   Boolean  @default(false)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

// ==================== REGOLE E MATCHING ====================

model Rule {
  id                String   @id @default(cuid())
  slug              String   @unique  // identificativo leggibile
  name              String
  shortDescription  String   // descrizione breve per card
  fullDescription   String   // descrizione completa
  category          String   // detrazione, bonus, risparmio_bollette, risparmio_banca, rimborso_trasporti, abbonamenti, isee, incentivo_impresa
  subcategory       String?  // es. "ristrutturazione", "affitto", "famiglia"
  target            String   // personale, azienda, entrambi

  // Importi
  maxAmount         Decimal? // importo massimo risparmio
  percentage        Decimal? // percentuale detrazione/sconto
  estimateFormula   String?  // formula JS per calcolo stima (opzionale)

  // Certezza
  certaintyLevel    String   // certo, probabile, consiglio
  certaintyNote     String?  // nota aggiuntiva sulla certezza

  // Come fare
  howToClaim        String   // istruzioni step by step (Markdown)
  requiredDocs      String[] // documenti necessari
  whereToApply      String?  // "730 Quadro E", "INPS online", "reclamo fornitore", ecc.

  // Fonti e validità
  legalReference    String?  // "Art. 16-bis TUIR"
  officialUrl       String?  // link fonte ufficiale
  sourceName        String?  // "Agenzia delle Entrate"
  validFrom         DateTime?
  validUntil        DateTime?
  deadline          DateTime? // scadenza per richiesta

  // Status
  isActive          Boolean  @default(true)
  lastVerified      DateTime @default(now())
  version           Int      @default(1)
  changelog         String?

  // SEO (per pagina pubblica della regola)
  seoTitle          String?
  seoDescription    String?

  // Relations
  requirements      RuleRequirement[]
  matches           UserMatch[]
  tags              String[]

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([category])
  @@index([target])
  @@index([isActive])
}

model RuleRequirement {
  id        String @id @default(cuid())
  ruleId    String
  rule      Rule   @relation(fields: [ruleId], references: [id], onDelete: Cascade)

  field     String  // campo del profilo: "birthYear", "incomeRange", "housingType", ecc.
  operator  String  // eq, neq, gt, gte, lt, lte, in, not_in, exists, between
  value     String  // valore di confronto (JSON-encoded per array)
  isRequired Boolean @default(true) // se false, è un boost/penalità alla certezza

  @@index([ruleId])
}

model UserMatch {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  ruleId          String
  rule            Rule     @relation(fields: [ruleId], references: [id], onDelete: Cascade)

  estimatedSaving Decimal? // risparmio stimato per questo utente
  certainty       String   // certo, probabile, consiglio (può essere diverso dalla rule base)
  matchScore      Float?   // 0-1, quanto bene matcha
  status          String   @default("pending") // pending, in_progress, completed, skipped, not_applicable
  completedAt     DateTime?
  notes           String?  // note dell'utente

  generatedAt     DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([userId, ruleId])
  @@index([userId])
  @@index([status])
}

model UserAction {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  type        String   // checklist_item, custom
  category    String   // abbonamenti, bollette, banca, ecc.
  title       String
  description String?
  isCompleted Boolean  @default(false)
  completedAt DateTime?
  savedAmount Decimal? // importo risparmiato (inserito dall'utente)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}

// ==================== STRIPE / PAGAMENTI ====================

model Subscription {
  id                     String   @id @default(cuid())
  userId                 String   @unique
  user                   User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  stripeCustomerId       String   @unique
  stripeSubscriptionId   String?  @unique
  stripePriceId          String?
  plan                   String   // free, personale_monthly, personale_yearly, azienda_monthly, azienda_yearly
  status                 String   // active, canceled, past_due, trialing, incomplete
  currentPeriodStart     DateTime?
  currentPeriodEnd       DateTime?
  cancelAtPeriodEnd      Boolean  @default(false)

  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt
}

model PdfPurchase {
  id                String   @id @default(cuid())
  userId            String?
  user              User?    @relation(fields: [userId], references: [id])
  email             String
  stripePaymentId   String   @unique
  amount            Decimal
  downloadUrl       String?
  downloadCount     Int      @default(0)
  maxDownloads      Int      @default(5)

  createdAt         DateTime @default(now())
}

// ==================== BLOG ====================

model BlogPost {
  id              String   @id @default(cuid())
  slug            String   @unique
  title           String
  excerpt         String
  content         String   // Markdown
  coverImage      String?
  category        String   // risparmio, detrazioni, bollette, bonus, guide
  tags            String[]
  author          String   @default("RisparmioMi")
  isPublished     Boolean  @default(false)
  publishedAt     DateTime?
  readingTime     Int?     // minuti
  seoTitle        String?
  seoDescription  String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([slug])
  @@index([isPublished])
  @@index([category])
}

// ==================== SCRAPER ====================

model ScraperLog {
  id          String   @id @default(cuid())
  source      String   // normattiva, agenzia_entrate, arera, etc.
  status      String   // success, error, partial
  rulesFound  Int?
  rulesNew    Int?
  rulesUpdated Int?
  errorMessage String?
  duration    Int?     // secondi
  runAt       DateTime @default(now())
}

// ==================== ANALYTICS ====================

model QuizResult {
  id              String   @id @default(cuid())
  sessionId       String   // cookie-based, non richiede auth
  answers         Json     // risposte del mini-quiz
  estimatedMin    Decimal
  estimatedMax    Decimal
  convertedToUser Boolean  @default(false)
  convertedToPdf  Boolean  @default(false)
  createdAt       DateTime @default(now())

  @@index([createdAt])
}
```

### Step 0.5: File .env
```env
DATABASE_URL="postgresql://user:password@localhost:5432/risparmiomi"
REDIS_URL="redis://localhost:6379"
MEILISEARCH_URL="http://localhost:7700"
MEILISEARCH_KEY="your-meilisearch-key"

NEXTAUTH_SECRET="generate-a-secret"
NEXTAUTH_URL="http://localhost:3000"

STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_PERSONALE_MONTHLY="price_..."
STRIPE_PRICE_PERSONALE_YEARLY="price_..."
STRIPE_PRICE_AZIENDA_MONTHLY="price_..."
STRIPE_PRICE_AZIENDA_YEARLY="price_..."
STRIPE_PRICE_PDF="price_..."

RESEND_API_KEY="re_..."
EMAIL_FROM="RisparmioMi <info@risparmiomi.it>"

ANTHROPIC_API_KEY="sk-ant-..."  # Per lo scraper
```

### Step 0.6: Docker Compose per development + production
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: risparmiomi
      POSTGRES_USER: risparmiomi
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  meilisearch:
    image: getmeili/meilisearch:v1.6
    environment:
      MEILI_MASTER_KEY: ${MEILISEARCH_KEY}
    volumes:
      - meili_data:/meili_data
    ports:
      - "7700:7700"

volumes:
  postgres_data:
  redis_data:
  meili_data:
```

### Step 0.7: Genera Prisma Client e migra
```bash
npx prisma generate
npx prisma db push  # per development
# oppure npx prisma migrate dev --name init per production
```

**DELIVERABLE FASE 0:**
- [x] Progetto Next.js inizializzato con tutte le dipendenze
- [x] Schema Prisma completo e migrato
- [x] Docker compose funzionante con PG + Redis + Meilisearch
- [x] File .env configurato
- [x] Struttura cartelle completa

---

## FASE 1: SITO MARKETING (Landing + Blog + Tools Gratuiti)
**Tempo stimato: 8-12 ore**

Questa è la prima cosa che il mondo vede. DEVE essere impeccabile.

### Step 1.1: Layout e Navbar
- Navbar fissa, trasparente su hero, diventa solida allo scroll
- Logo "RisparmioMi" con logotype in Instrument Serif (non servono icone elaborate, il testo stesso è il logo)
- Link: Come funziona · Prezzi · Blog · Strumenti Gratuiti · [Accedi] [Prova Gratis →]
- Mobile: hamburger menu con drawer animation da destra
- Sticky CTA bar su mobile (piccola barra in basso con "Calcola il tuo risparmio →")

### Step 1.2: Homepage / Landing Page
La homepage è la pagina più importante. Struttura sezioni:

**1. Hero Section**
- Headline grande (Instrument Serif, 3rem+): "Scopri quanto stai perdendo ogni anno. Senza saperlo."
- Sottotitolo (Satoshi, grigio secondario): "Detrazioni non sfruttate, bonus mai richiesti, bollette troppo care, abbonamenti dimenticati. Gli italiani perdono in media €2.000-3.000/anno."
- CTA principale: "Calcola il tuo risparmio →" (bottone accent-primary, grande)
- CTA secondaria: "Scopri come funziona" (link con freccia)
- A destra/sotto: preview della dashboard (screenshot realistico o mockup animato in CSS/SVG — NON un'immagine stock)
- Background: texture grain sottilissima, gradiente warm-white → leggermente più scuro in basso

**2. Social Proof Bar**
- Striscia sottile con numeri animati (contano su al load):
  "€2.4M di risparmi individuati · 12.000+ utenti · 150+ regole aggiornate"
- Sotto: loghi "dati da fonti ufficiali": Agenzia Entrate, INPS, ARERA, Banca d'Italia (usa i nomi in testo, non loghi effettivi per evitare problemi)

**3. Le 7 Aree di Risparmio**
- Grid 2-3 colonne (o slider su mobile)
- Per ogni area una card con:
  - Icona lucide-react monocromatica
  - Titolo: "Detrazioni Fiscali" / "Bollette Luce e Gas" / "Costi Bancari" / ecc.
  - Sottotitolo: "Risparmio medio: €500-5.000/anno"
  - Frase breve: "Il 37% degli italiani non conosce le detrazioni a cui ha diritto"
  - Hover: leggero lift + cambio colore bordo

**4. Come Funziona (3 step)**
- Layout: 3 card numerate con linea connettiva
  1. "Rispondi a 5 domande" → icona questionario
  2. "Ricevi il tuo report" → icona dashboard
  3. "Agisci e risparmia" → icona check/money
- Sotto: "Tempo medio: 2 minuti" in grigio piccolo

**5. Mini-Quiz Embed**
- Sezione con sfondo leggermente diverso (bg-secondary)
- Titolo: "Prova ora — è gratis e ci vogliono 2 minuti"
- Inline: le prime 2-3 domande del mini-quiz direttamente nella landing
- Al completamento → mostra risultato + CTA per report completo
- Questo è il CONVERSION POINT principale

**6. Sezione PDF Guida**
- Card speciale con mockup 3D del PDF
- "La Guida Definitiva al Risparmio: 80+ pagine, 100+ consigli, template pronti"
- Prezzo: "€19 (offerta lancio)" con prezzo barrato "€29"
- CTA: "Acquista la guida →"
- Bullet: "Checklist detrazioni · Template reclami · Guide bollette · Aggiornamenti 12 mesi"

**7. Pricing Section**
- 3 colonne: PDF (one-shot) · Personale (abbonamento) · Azienda (abbonamento)
- Card centrale (Personale) evidenziata come "Più popolare"
- Toggle mensile/annuale con risparmio evidenziato
- Feature list per ogni piano
- CTA per ogni piano

```
PIANO PDF:
€19 (intro) / €29
- Guida 80+ pagine
- Checklist complete
- Template pronti
- Aggiornamenti 12 mesi via email
[Acquista →]

PIANO PERSONALE:                    ★ PIÙ POPOLARE
€4,99/mese (€49,99/anno — risparmi 2 mesi)
- Tutto del PDF +
- Dashboard personalizzata
- Report su misura per la tua situazione
- Alert scadenze e nuovi bonus
- Tracking risparmi ottenuti
- Analisi bollette
- Checklist abbonamenti interattiva
- Aggiornamenti in tempo reale
[Inizia prova gratuita →]

PIANO AZIENDA:
€29/mese (€290/anno)
Da €99/mese per versione Pro con monitor bandi
- Tutto del Personale +
- Crediti d'imposta e incentivi per imprese
- Monitor bandi regionali e nazionali
- Incentivi assunzione
- Calendario fiscale personalizzato
- Export per il commercialista
[Contattaci →]
```

**8. Testimonials / Trust**
- 2-3 testimonials (inizialmente puoi crearli come casi d'uso realistici, tipo "Marco, 34 anni, Firenze — Ha scoperto €1.840 di detrazioni non sfruttate")
- Card con avatar generato (iniziali), citazione, risparmio trovato
- NOTA LEGALE: aggiungi piccolo disclaimer "Casi illustrativi basati su scenari reali"

**9. FAQ Accordion**
- 8-10 domande frequenti
- Animazione smooth apertura/chiusura
- Include: "RisparmioMi sostituisce il commercialista?", "Come fate a essere precisi?", "I miei dati sono al sicuro?", "Posso cancellare quando voglio?"

**10. CTA Finale**
- Sfondo dark (bg-dark) con testo bianco
- "Non perdere un altro euro. Scopri il tuo risparmio in 2 minuti."
- Bottone grande: "Inizia ora — è gratis →"

**11. Footer**
- Colonne: Prodotto · Risorse · Legale · Contatti
- Link a: privacy policy, termini di servizio, cookie policy
- Disclaimer: "RisparmioMi organizza informazioni pubbliche. Non sostituisce consulenza professionale."
- Social icons (se esistono)
- © 2026 RisparmioMi — P.IVA XXXXXXXXXX

### Step 1.3: Pagina "Come Funziona"
- Spiega il processo in dettaglio
- Sezione sulla precisione: "Da dove prendiamo i dati" con link alle fonti
- Sezione sui 3 livelli di certezza (certo/probabile/consiglio)
- CTA al quiz

### Step 1.4: Pagina Prezzi
- Stessa tabella prezzi della landing ma più dettagliata
- Comparison table feature-by-feature
- FAQ specifiche sui prezzi

### Step 1.5: Blog
- Layout: grid di card (immagine, titolo, excerpt, data, reading time, categoria)
- Filtro per categoria
- Singolo post: layout editoriale, largo, con tipografia curata (usa @tailwindcss/typography)
- Sidebar con: post correlati, CTA abbonamento, newsletter signup
- Il blog si legge da file Markdown in `src/data/blog/` con frontmatter
- SEO: ogni post ha title, description, OpenGraph image auto-generata
- Crea almeno 5 post iniziali:
  1. "Detrazioni fiscali 2026: la guida completa a tutte le agevolazioni"
  2. "Come capire se stai pagando troppo di luce e gas"
  3. "ISEE 2026: i 5 errori che ti fanno perdere i bonus"
  4. "Abbonamenti fantasma: come trovare (e cancellare) quelli che non usi"
  5. "Bonus per famiglie 2026: tutti i contributi a cui hai diritto"

### Step 1.6: Mini-Tools Gratuiti (SEO magnets + Lead gen)
Questi sono strumenti funzionanti e gratuiti che attirano traffico SEO e convertono in utenti.

**Tool 1: "Calcola il Tuo Risparmio" (il Mini-Quiz)**
- URL: /tools/calcola-risparmio
- 5 domande rapide (le stesse dell'onboarding ma semplificate)
- Alla fine: stima del risparmio potenziale con range
- CTA: "Vuoi il report completo? Registrati gratis" o "Acquista la guida PDF"
- Questo tool è anche embeddabile nella landing page

**Tool 2: "Verifica Bonus" (Bonus Checker)**
- URL: /tools/verifica-bonus
- L'utente seleziona la sua situazione (età, reddito, famiglia)
- Mostra lista di bonus attivi a cui potrebbe avere diritto
- Per ogni bonus: nome, importo max, una riga di requisiti
- CTA: "Registrati per vedere il dettaglio e le istruzioni step-by-step"

**Tool 3: "Confronta la Tua Bolletta"**
- URL: /tools/confronta-bollette
- L'utente inserisce: regione, tipo utenza, spesa bimestrale
- Mostra confronto con media regionale/nazionale (dati ARERA pubblici)
- Se sopra media: "Potresti risparmiare €X/anno. Ecco come."
- CTA a registrazione

**Tool 4: "Checklist Abbonamenti"**
- URL: /tools/checklist-abbonamenti
- Checklist interattiva e guidata
- L'utente spunta man mano che controlla iPhone/Android/PayPal/ecc.
- Alla fine: "Hai trovato X abbonamenti da verificare"
- CTA: "Registrati per il tracking completo"

Ogni tool deve avere:
- H1 SEO-optimized
- Meta description
- Schema markup FAQ
- Condivisibilità (Open Graph con risultato)
- Link interni al blog e alla landing

**DELIVERABLE FASE 1:**
- [x] Landing page completa e responsive con tutte le 11 sezioni
- [x] Pagina Come Funziona
- [x] Pagina Prezzi
- [x] Blog funzionante con 5 post
- [x] 4 mini-tools gratuiti funzionanti
- [x] Footer con link legali
- [x] SEO meta tags su tutte le pagine
- [x] Sitemap generata
- [x] Performance: Lighthouse >90 su tutte le metriche

---

## FASE 2: AUTENTICAZIONE E PAGAMENTI
**Tempo stimato: 4-6 ore**

### Step 2.1: NextAuth Setup
- Provider: Email (magic link via Resend) + Google OAuth
- Pagine custom per login/registrazione (non le default di NextAuth)
- Design coerente con il sito
- Redirect post-login: se nuovo utente → /onboarding, se esistente → /dashboard
- Rate limiting su tentativi di login

### Step 2.2: Stripe Integration
- Crea i prodotti/prezzi su Stripe:
  - PDF Guida: €19 (pagamento singolo)
  - Personale Mensile: €4,99/mese
  - Personale Annuale: €49,99/anno
  - Azienda Mensile: €29/mese
  - Azienda Annuale: €290/anno
  - Azienda Pro Mensile: €99/mese
  - Azienda Pro Annuale: €990/anno
- Checkout Session per ogni piano
- Customer Portal per gestione abbonamento (cambio piano, cancellazione, fatture)
- Webhook handler per eventi:
  - `checkout.session.completed` → attiva abbonamento
  - `customer.subscription.updated` → aggiorna piano
  - `customer.subscription.deleted` → disattiva
  - `invoice.payment_failed` → email notifica + grace period
- Middleware che verifica il piano dell'utente per l'accesso alle sezioni protette
- Trial period: 7 giorni gratuiti per il piano Personale

### Step 2.3: Middleware di autorizzazione
```typescript
// Logica:
// /dashboard/* → richiede autenticazione
// /dashboard/incentivi/* → richiede piano "azienda"
// /dashboard/* (oltre onboarding) → richiede onboarding completato
// /api/rules/match → richiede piano attivo (non free)
// /tools/* → pubblico (lead gen)
```

### Step 2.4: Pagina gestione abbonamento
- Mostra piano attuale, prossimo rinnovo, metodo di pagamento
- Bottone "Gestisci abbonamento" → Stripe Customer Portal
- Storico pagamenti
- Opzione upgrade/downgrade

**DELIVERABLE FASE 2:**
- [x] Login/registrazione funzionante (email + Google)
- [x] Stripe checkout per tutti i piani
- [x] Webhook handler funzionante
- [x] Customer Portal integrato
- [x] Middleware autorizzazione
- [x] Trial 7 giorni funzionante
- [x] Acquisto PDF singolo funzionante

---

## FASE 3: ONBOARDING E RULE ENGINE
**Tempo stimato: 10-14 ore**

Questa è la parte più importante del prodotto.

### Step 3.1: Questionario Onboarding Personale
- Multi-step form con progress bar animata
- 5-6 step, ognuno con 3-5 domande
- Ogni step in una card centrata, grande, con animazione di transizione
- Input types: range slider, radio cards (grandi, cliccabili), toggle, select dropdown
- Validazione in tempo reale con react-hook-form + zod
- Salvataggio intermedio (l'utente può uscire e riprendere)
- Alla fine: animazione di "calcolo in corso" → redirect alla dashboard

**Step del questionario personale:**
```
Step 1: "Parliamo di te"
- Anno di nascita (range slider con anno corrente - 18 come default)
- Stato civile (radio cards: Single · Sposato/a · Convivente · Divorziato/a · Vedovo/a)
- Figli (counter: 0, 1, 2, 3, 4+) → se >0: età di ciascuno
- Regione di residenza (select con tutte le regioni)

Step 2: "Casa e abitazione"
- Proprietario o affittuario? (radio cards grandi con icona)
- Prima casa? (toggle)
- Se affittuario: fascia affitto mensile (range: <300, 300-500, 500-800, 800-1200, 1200+)
- Se proprietario: hai un mutuo? (toggle) → rata mensile range
- Ristrutturazioni negli ultimi 5 anni? (toggle) → anno
- Tipo riscaldamento (select)

Step 3: "Lavoro e reddito"
- Situazione lavorativa (radio cards: Dipendente · Autonomo/P.IVA · Disoccupato · Pensionato · Studente)
- Se dipendente: tipo contratto
- Fascia reddito annuo lordo (range slider: 0-8k, 8-15k, 15-28k, 28-50k, 50k+)
- Fascia ISEE se conosciuta (opzionale, con "Non lo so")
- Ricevi il trattamento integrativo in busta paga? (Sì / No / Non so)

Step 4: "Utenze e spese"
- Fornitore luce (text o select con principali)
- Spesa bimestrale luce (range)
- Fornitore gas (text o select)
- Spesa bimestrale gas (range)
- Banca principale (text o select con principali)
- Tipo conto (radio: Tradizionale sportello · Online · Postale · Non so)
- Da quanti anni hai il conto? (<2, 2-5, 5-10, 10+)

Step 5: "Salute e famiglia"
- Spese mediche annue stimate (range)
- Figli a scuola/università? (toggle)
- Figli all'asilo nido? (toggle)
- Animali domestici? (toggle)
- Quanti abbonamenti attivi (stima: 0, 1-3, 4-6, 7+)
- Viaggi treno/aereo frequenza (mai, raramente, mensile, settimanale)

Step 6: "Ultimo passo"
- Hai un commercialista o ti rivolgi al CAF? (radio)
- Hai assicurazioni? (multi-select: vita, casa, auto, salute, nessuna)
- [Bottone grande] "Calcola il mio risparmio →"
```

### Step 3.2: Questionario Onboarding Azienda
- Stessa UX ma domande diverse (quelle definite nel CompanyProfile)
- 4 step: Profilo Azienda → Fiscalità → Costi Operativi → Dipendenti
- Accessibile solo con piano Azienda

### Step 3.3: Rule Engine (IL CUORE — `lib/rule-engine.ts`)

```typescript
// Pseudocodice della logica core:

interface MatchResult {
  ruleId: string;
  estimatedSaving: number | null;
  certainty: 'certo' | 'probabile' | 'consiglio';
  matchScore: number; // 0-1
  matchedRequirements: string[];
  failedRequirements: string[];
}

function matchRulesForUser(
  profile: UserProfile | CompanyProfile,
  rules: RuleWithRequirements[]
): MatchResult[] {

  const results: MatchResult[] = [];

  for (const rule of rules) {
    // Filtra per target (personale/azienda)
    if (!matchesTarget(rule, profile)) continue;

    // Controlla tutti i requirements
    const { matched, failed, optional } = evaluateRequirements(
      rule.requirements,
      profile
    );

    // Se tutti i required sono soddisfatti → match
    const requiredMet = failed.filter(r => r.isRequired).length === 0;

    if (requiredMet) {
      // Calcola certezza basata su quanti optional sono soddisfatti
      const certainty = calculateCertainty(rule, matched, failed);

      // Calcola stima risparmio
      const saving = calculateEstimatedSaving(rule, profile);

      results.push({
        ruleId: rule.id,
        estimatedSaving: saving,
        certainty,
        matchScore: matched.length / (matched.length + failed.length),
        matchedRequirements: matched.map(r => r.field),
        failedRequirements: failed.map(r => r.field),
      });
    }
  }

  // Ordina per risparmio stimato decrescente
  return results.sort((a, b) =>
    (b.estimatedSaving ?? 0) - (a.estimatedSaving ?? 0)
  );
}

// Operatori di confronto
function evaluateRequirement(req: RuleRequirement, profile: any): boolean {
  const fieldValue = getNestedField(profile, req.field);
  const compareValue = JSON.parse(req.value);

  switch (req.operator) {
    case 'eq': return fieldValue === compareValue;
    case 'neq': return fieldValue !== compareValue;
    case 'gt': return Number(fieldValue) > Number(compareValue);
    case 'gte': return Number(fieldValue) >= Number(compareValue);
    case 'lt': return Number(fieldValue) < Number(compareValue);
    case 'lte': return Number(fieldValue) <= Number(compareValue);
    case 'in': return compareValue.includes(fieldValue);
    case 'not_in': return !compareValue.includes(fieldValue);
    case 'exists': return fieldValue !== null && fieldValue !== undefined;
    case 'between': return fieldValue >= compareValue[0] && fieldValue <= compareValue[1];
    case 'contains': return String(fieldValue).includes(compareValue);
    // Per i range di reddito, converte "15001-28000" in numeri
    case 'range_overlaps': return rangeOverlaps(fieldValue, compareValue);
    default: return false;
  }
}
```

Il rule engine deve:
1. Caricare tutte le regole attive dal DB (con caching Redis, TTL 1 ora)
2. Per ogni regola, valutare tutti i requirements contro il profilo utente
3. Generare i match con stima risparmio e livello di certezza
4. Salvare i match nel DB (`UserMatch`)
5. Calcolare il totale risparmio potenziale
6. Inviare il risultato alla dashboard

### Step 3.4: Seed del Database con Regole Iniziali
Crea i file JSON in `src/data/rules/` con almeno 100 regole iniziali divise per categoria. Per ogni regola segui lo schema `Rule` + `RuleRequirement` del Prisma schema.

**Regole minime da includere nel seed (almeno queste):**

Detrazioni Fiscali (~30 regole):
- Detrazione affitto giovani under 31 (€1.200 max)
- Bonus ristrutturazione 50% (abitazione principale)
- Bonus ristrutturazione 36% (seconda casa)
- Ecobonus 50%/36%
- Bonus mobili €5.000
- Spese sanitarie 19% sopra €129,11
- Spese veterinarie 19% fino a €750
- Interessi passivi mutuo prima casa (19% fino a €4.000)
- Spese scolastiche/università (19%)
- Spese sport figli 5-18 anni (19% fino a €210)
- Assicurazione vita/infortuni (19% fino a €530)
- Contributi previdenza complementare (deducibili fino a €5.164,57)
- Spese funebri (19% fino a €1.550)
- Canone affitto lavoratori fuori sede
- Detrazione formazione professionale 2026
- Trattamento integrativo (<€28.000)
- Detrazione lavoro dipendente
- Detrazione redditi da pensione
- Bonus prima casa under 36 (se ancora attivo)
- Superbonus condomini (quote residue)

Bonus INPS/Statali (~15 regole):
- Assegno Unico Universale (con scaglioni ISEE)
- Bonus nascita €1.000 (ISEE <€40.000)
- Bonus asilo nido (€1.500-3.600 per ISEE)
- Bonus psicologo
- Carta Valore Cultura per diplomati/laureati
- Bonus mamme (esonero contributi)
- ADI (Assegno di Inclusione)
- Bonus sociale luce (automatico ISEE <€9.530)
- Bonus sociale gas (automatico ISEE <€9.530)
- Bonus sociale idrico
- Reddito di libertà
- Supporto formazione lavoro
- Indennità di disoccupazione NASpI

Bollette (~10 regole):
- Bolletta luce sopra media nazionale
- Bolletta gas sopra media regionale
- Conto in mercato tutelato (verifica se conviene passare a libero)
- Bonus sociale non attivato (per ISEE basso)
- Prescrizione bollette >2 anni
- Reclamo per fatturazione stimata vs reale

Banca (~8 regole):
- Conto tradizionale troppo costoso (vs media online)
- Imposta di bollo evitabile
- Commissioni scoperto elevate
- Conto aperto da >10 anni (probabilmente condizioni obsolete)
- Canone carta di credito rinegoziabile

Trasporti (~12 regole):
- Rimborso volo ritardo >3h (<1500km = €250)
- Rimborso volo ritardo >3h (1500-3500km = €400)
- Rimborso volo ritardo >3h (>3500km = €600)
- Rimborso volo cancellato
- Rimborso volo overbooking
- Rimborso Trenitalia Frecce >60min (25%)
- Rimborso Trenitalia Frecce >120min (50%)
- Rimborso Italo >60min
- Rimborso treno regionale >60min
- Rimborso per sciopero (quando dovuto)

ISEE (~8 regole):
- ISEE corrente disponibile (reddito calato >25%)
- Errore comune: saldo vs giacenza media
- Bonus non richiesti per fascia ISEE
- Aggiornamento nucleo familiare

Incentivi Imprese (~20 regole):
- Credito d'imposta Formazione 4.0
- Credito d'imposta R&S
- Nuova Sabatini
- Transizione 5.0
- Incentivo assunzione giovani under 36
- Incentivo assunzione donne
- Incentivo assunzione percettori ADI
- Decontribuzione Sud
- Bonus export (SIMEST)
- Patent Box
- Startup innovative (agevolazioni fiscali)
- Fondo Impresa Femminile
- Resto al Sud
- ON - Nuove Imprese a tasso zero
- Smart&Start Italia
- SELFIEmployment
- Conto Termico 3.0

### Step 3.5: Script di Seed
`prisma/seed.ts` che:
1. Legge tutti i JSON da `src/data/rules/`
2. Per ogni regola: crea la Rule + i RuleRequirement associati
3. Indicizza le regole su Meilisearch per la ricerca
4. Log: quante regole create per categoria

**DELIVERABLE FASE 3:**
- [x] Onboarding personale multi-step completo e funzionante
- [x] Onboarding aziendale multi-step completo
- [x] Rule engine funzionante e testato
- [x] Database seeded con 100+ regole
- [x] Meilisearch indicizzato
- [x] API `/api/rules/match` che restituisce match per utente

---

## FASE 4: DASHBOARD UTENTE
**Tempo stimato: 10-14 ore**

### Step 4.1: Layout Dashboard
- Sidebar sinistra (collassabile su mobile) con:
  - Logo piccolo
  - Nav: Overview · Azioni · Detrazioni · Bollette · Banca · Abbonamenti · Trasporti · ISEE · [Incentivi — solo azienda]
  - In basso: Impostazioni · Abbonamento · Aiuto
- Header con: nome utente, avatar/iniziali, notifiche, piano attuale (badge)
- Contenuto principale con breadcrumb

### Step 4.2: Pagina Overview (Dashboard principale)
La prima cosa che l'utente vede dopo l'onboarding.

```
┌─────────────────────────────────────────────────────┐
│ Ciao [Nome]! Ecco il tuo report di risparmio        │
│ Ultimo aggiornamento: [data]                         │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │  💰 RISPARMIO POTENZIALE TOTALE              │    │
│  │  €2.847 /anno                                │    │
│  │  [████████████████░░░░] €340 recuperati       │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │
│  │ 🟢 CERTI    │ │ 🟡 PROBABILI│ │ 📋 CONSIGLI │    │
│  │ 4 azioni    │ │ 3 da verif. │ │ 6 checklist │    │
│  │ €1.640      │ │ €807        │ │ €400 stima  │    │
│  └─────────────┘ └─────────────┘ └─────────────┘    │
│                                                      │
│  📌 AZIONI PRIORITARIE                              │
│  ┌──────────────────────────────────────────────┐    │
│  │ 🟢 Detrazione affitto giovani     €1.200     │    │
│  │ Sei under 31 e affittuario →                  │    │
│  │ Indica nel 730 · Scadenza: 30/09/2026        │    │
│  │ [Vedi come fare →]             [✓ Fatto]      │    │
│  └──────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────┐    │
│  │ 🟢 Bonus mobili                   €340       │    │
│  │ Hai ristrutturato nel 2025 →                  │    │
│  │ ...                                           │    │
│  └──────────────────────────────────────────────┘    │
│  ...                                                 │
│                                                      │
│  🔔 SCADENZE PROSSIME                               │
│  ├── 30/06/2026: Termine per 730 precompilato        │
│  ├── 30/09/2026: Termine per 730 ordinario           │
│  └── 31/12/2026: Ultimo giorno bonus mobili 2026     │
│                                                      │
│  📊 RIEPILOGO PER AREA                              │
│  [bar chart orizzontale per categoria di risparmio]   │
└─────────────────────────────────────────────────────┘
```

### Step 4.3: Pagina Azioni (Todo List)
- Lista di tutte le azioni da compiere
- Filtri: Tutte · Certi · Probabili · Consigli · Completate
- Ogni azione è una card espandibile con:
  - Badge certezza (🟢🟡🔴)
  - Titolo e importo
  - Descrizione breve
  - Espanso: istruzioni step-by-step (Markdown rendered)
  - Documenti necessari
  - Link alla fonte ufficiale
  - Bottoni: "Fatto ✓" / "Non applicabile" / "Dettagli"
  - Se "Fatto": chiedi importo effettivamente risparmiato (opzionale)
- Progress bar in alto: X/Y azioni completate

### Step 4.4: Pagine per Categoria
Ogni categoria (detrazioni, bollette, banca, ecc.) ha una pagina dedicata con:
- Intro specifica alla categoria
- Lista delle regole matchate per quella categoria
- Risorse aggiuntive (link a guide, tools)
- Per bollette: possibilità di inserire dettagli bolletta per confronto più preciso
- Per abbonamenti: checklist interattiva
- Per banca: confronto con benchmark Banca d'Italia

### Step 4.5: Pagina Impostazioni
- Aggiorna profilo (ricalcola match)
- Preferenze notifiche email (on/off per tipo)
- Cambio password
- Elimina account (con conferma)
- Export dati (GDPR)

### Step 4.6: Sistema di Notifiche Email
Usa Resend per inviare:
- **Welcome email** dopo registrazione
- **Report iniziale** dopo completamento onboarding
- **Alert mensile** con riepilogo + nuove regole/scadenze
- **Alert scadenze** 30 giorni prima di scadenze importanti
- **Nuovi bonus/detrazioni** quando vengono aggiunti al DB
- Template email HTML pulito, stesso brand della piattaforma

**DELIVERABLE FASE 4:**
- [x] Dashboard overview con stats, azioni prioritarie, scadenze
- [x] Pagina azioni con filtri e tracking completamento
- [x] 7 pagine di categoria funzionanti
- [x] Sistema notifiche email (almeno welcome + report)
- [x] Pagina impostazioni completa
- [x] Dashboard responsive (funziona bene su mobile)

---

## FASE 5: GENERAZIONE PDF
**Tempo stimato: 4-6 ore**

### Step 5.1: PDF Guida Completa (prodotto €19-29)
Genera un PDF di ~80-100 pagine con Puppeteer/Playwright:
1. Crea una route nascosta `/pdf/guida-completa` che renderizza l'HTML della guida
2. Usa Puppeteer per generare il PDF da quell'HTML
3. Styling: usa una CSS dedicata per il print (margini, page breaks, header/footer)
4. Il PDF include tutti i 7 capitoli come descritto nel documento architettura precedente
5. Copertina con branding RisparmioMi
6. Indice interattivo (con link interni)
7. Template scaricabili (lettere reclamo, richieste rimborso) come appendice
8. Footer su ogni pagina: "© 2026 RisparmioMi · Aggiornato al [data] · risparmiomi.it"

### Step 5.2: PDF Report Personalizzato (per utenti SaaS)
Per gli abbonati, genera un PDF personalizzato dal loro profilo:
- Riepilogo risparmio potenziale
- Lista azioni con certezza
- Istruzioni personalizzate per le loro azioni specifiche
- Scadenze rilevanti
- Questo PDF è scaricabile dalla dashboard ("Scarica il tuo report")

### Step 5.3: Flow di acquisto PDF standalone
1. Landing page dedicata `/guida-pdf`
2. CTA → Stripe Checkout (pagamento singolo €19)
3. Dopo pagamento → email con link download (max 5 download)
4. Il link è protetto e tracciato (PdfPurchase nel DB)

**DELIVERABLE FASE 5:**
- [x] PDF guida completa generato e bello
- [x] PDF report personalizzato per utenti SaaS
- [x] Flow acquisto PDF con Stripe + email delivery
- [x] Download page protetta con contatore

---

## FASE 6: SCRAPER ENGINE (Python)
**Tempo stimato: 10-14 ore**

### Step 6.1: Setup progetto Python
```
scraper/
├── requirements.txt
├── config.py          # URLs, API keys, schedule config
├── main.py            # Entry point + orchestratore
├── db.py              # Connessione PostgreSQL diretta (psycopg2)
├── claude_client.py   # Wrapper Anthropic API per estrazione
├── scrapers/
│   ├── base.py        # Classe base scraper
│   ├── normattiva.py  # Scraper Normattiva API
│   ├── agenzia_entrate.py  # Download + parse guide PDF
│   ├── arera.py       # Download dati tariffe + medie
│   ├── banca_italia.py     # Download report costi CC
│   ├── inps.py        # Scrape portale INPS
│   ├── incentivi_gov.py    # Download Open Data incentivi
│   └── trasporti.py   # Scrape condizioni Trenitalia/Italo
├── extractors/
│   ├── pdf_extractor.py    # pdfplumber per estrarre testo/tabelle
│   ├── rule_extractor.py   # Claude API per strutturare regole
│   └── diff_checker.py     # Confronta nuove regole vs DB esistente
└── outputs/
    ├── raw/           # PDF e HTML scaricati (cache)
    ├── extracted/     # Testo estratto
    └── rules/         # JSON regole candidate per review
```

### Step 6.2: Scraper Base Class
```python
class BaseScraper:
    name: str
    schedule: str  # "weekly", "monthly", "quarterly"
    last_run: datetime

    def fetch(self) -> list[RawDocument]:
        """Scarica i documenti dalla fonte"""
        pass

    def extract(self, docs: list[RawDocument]) -> list[RawRule]:
        """Estrae regole candidate dai documenti"""
        pass

    def diff(self, new_rules: list[RawRule], existing_rules: list[DBRule]) -> DiffResult:
        """Confronta nuove regole con quelle nel DB"""
        pass

    def apply(self, diff: DiffResult) -> ApplyResult:
        """Applica le modifiche al DB (con flag needs_review)"""
        pass

    def run(self):
        """Esegue l'intero pipeline"""
        docs = self.fetch()
        rules = self.extract(docs)
        diff = self.diff(rules, self.get_existing_rules())
        result = self.apply(diff)
        self.log_result(result)
        return result
```

### Step 6.3: Scraper Normattiva (API)
- Usa le API REST documentate di Normattiva (dati.normattiva.it)
- Query: cerca nuovi decreti/leggi con keywords fiscali
- Scarica testi degli atti rilevanti
- Passa a Claude API per estrazione regole
- Schedule: settimanale

### Step 6.4: Scraper Agenzia delle Entrate
- Scarica le guide PDF dalla sezione "Le Guide dell'Agenzia"
- Usa pdfplumber per estrarre testo e tabelle
- Passa a Claude API con prompt strutturato:
```
"Analizza questo documento dell'Agenzia delle Entrate.
Estrai TUTTE le detrazioni/agevolazioni menzionate.
Per ognuna fornisci in formato JSON:
- nome
- categoria (detrazione_irpef, deduzione, credito_imposta, bonus)
- importo_massimo
- percentuale
- requisiti (lista condizioni)
- come_richiederlo
- riferimento_normativo
- scadenza (se presente)
Rispondi SOLO con il JSON, senza commenti."
```
- Schedule: mensile (le guide si aggiornano 1-2 volte l'anno)

### Step 6.5: Scraper ARERA
- Scarica Open Data dal Portale Offerte
- Scarica report trimestrale tariffe
- Aggiorna tabelle medie di spesa per regione/profilo
- Schedule: trimestrale

### Step 6.6: Scraper Banca d'Italia
- Scarica il report annuale "Indagine costo conti correnti"
- Estrai con pdfplumber: spesa media per tipo conto, ICC
- Aggiorna benchmark nel DB
- Schedule: annuale (il report esce a gennaio)

### Step 6.7: Scraper incentivi.gov.it
- Scarica Open Data dal portale incentivi
- Estrai nuovi incentivi attivi
- Confronta con incentivi già nel DB
- Schedule: settimanale

### Step 6.8: Diff Checker
Per ogni scraper, il diff checker:
1. Confronta le regole estratte con quelle nel DB
2. Identifica: NUOVE, MODIFICATE, SCADUTE
3. Per regole NUOVE e MODIFICATE: salva con flag `needs_review = true`
4. Invia email riepilogativa all'admin con le diff
5. L'admin (tu) fa review da un pannello admin e approva/rifiuta

### Step 6.9: Admin Panel per Review Regole
- Pagina `/admin/regole/review` (protetta, solo admin)
- Lista regole pending review
- Per ognuna: mostra old vs new, fonte, confidenza
- Bottoni: Approva / Modifica / Rifiuta
- Bulk approve per regole ad alta confidenza

### Step 6.10: Cron Schedule
```python
# cron_schedule.py
SCHEDULE = {
    'normattiva': 'weekly',      # Ogni lunedì alle 3:00
    'agenzia_entrate': 'monthly', # Primo del mese alle 3:00
    'arera': 'quarterly',         # Gen, Apr, Lug, Ott
    'banca_italia': 'yearly',     # Gennaio
    'inps': 'monthly',            # Primo del mese
    'incentivi_gov': 'weekly',    # Ogni lunedì alle 4:00
    'trasporti': 'yearly',       # Stabile, check annuale
}
```

Usa `cron` di sistema o `APScheduler` in Python.

**DELIVERABLE FASE 6:**
- [x] Tutti e 7 gli scraper funzionanti
- [x] Claude API extraction funzionante per PDF
- [x] Diff checker che identifica novità
- [x] Email di report all'admin dopo ogni run
- [x] Admin panel per review e approvazione
- [x] Cron jobs configurati
- [x] Logging in tabella ScraperLog

---

## FASE 7: SEO, PERFORMANCE E POLISH
**Tempo stimato: 4-6 ore**

### Step 7.1: SEO Tecnica
- `next-sitemap` configurato con tutte le pagine
- `robots.txt` ottimizzato
- Meta tags OpenGraph + Twitter Card su ogni pagina
- Schema.org markup: Organization, Product, FAQPage, HowTo, BlogPosting
- Canonical URLs
- Hreflang (preparato per futuro multilingua)
- Core Web Vitals ottimizzati:
  - Lazy loading immagini
  - Font optimization (display swap)
  - Minimal JS bundle
  - Server Components dove possibile

### Step 7.2: Pagine SEO Dedicate
Crea landing page per le keyword principali:
- `/detrazioni-fiscali-2026` → panoramica + CTA
- `/bonus-2026-elenco-completo` → lista + CTA
- `/risparmio-bollette-luce-gas` → guide + tool
- `/costo-conto-corrente-confronto` → benchmark + CTA
- `/rimborso-volo-ritardo` → guida + CTA
- Ognuna con H1, contenuto originale, link interni, CTA

### Step 7.3: Performance
- Lighthouse score >90 su tutte le pagine
- Images: next/image con blur placeholder
- Fonts: preload dei font principali
- Bundle: analisi con `@next/bundle-analyzer`
- Redis caching per le API pesanti (rule matching)
- ISR (Incremental Static Regeneration) per blog e pagine statiche

### Step 7.4: Polish Finale
- Animazioni di entrata su tutte le sezioni (framer-motion InView)
- Skeleton loading su dashboard
- Toast notifications per azioni completate
- Empty states per ogni sezione (illustrazione + messaggio)
- Error boundaries con fallback graceful
- 404 page custom
- Favicon e PWA manifest
- Cookie banner GDPR compliant (semplice, non intrusivo)

**DELIVERABLE FASE 7:**
- [x] Lighthouse >90 su tutte le metriche
- [x] Sitemap + robots.txt
- [x] Schema markup su pagine chiave
- [x] 5+ landing pages SEO
- [x] Animazioni e micro-interactions
- [x] Cookie banner
- [x] 404, loading states, error states

---

## FASE 8: DEPLOY SU HETZNER
**Tempo stimato: 3-4 ore**

### Step 8.1: Server Setup
```bash
# Su Hetzner Cloud (CPX21 o CPX31 per iniziare: 4vCPU, 8GB RAM, ~€15/mese)

# Setup iniziale
apt update && apt upgrade -y
apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx

# Docker compose production
# Crea docker-compose.prod.yml con:
# - next app (build produzione)
# - postgres
# - redis
# - meilisearch
# - nginx (reverse proxy)
```

### Step 8.2: Docker Production Config
- Dockerfile per Next.js (multi-stage build)
- Dockerfile per scraper Python
- docker-compose.prod.yml con restart policies
- Volumes per persistenza dati
- Network interna per comunicazione servizi

### Step 8.3: Nginx + SSL
- Nginx come reverse proxy
- Let's Encrypt per SSL automatico
- HTTPS redirect
- Gzip compression
- Security headers

### Step 8.4: CI/CD
- GitHub Actions workflow:
  - Push su main → build → test → deploy su Hetzner via SSH
  - Prisma migrate in CI
- Backup automatico DB (pg_dump giornaliero → storage esterno)

### Step 8.5: Monitoring
- Docker healthchecks
- Uptime monitoring (UptimeRobot free tier)
- Error tracking (Sentry free tier)
- Analytics (Plausible self-hosted o Umami — privacy-friendly, no Google Analytics)

**DELIVERABLE FASE 8:**
- [x] App live su HTTPS con dominio
- [x] Tutti i servizi Docker funzionanti
- [x] SSL automatico
- [x] CI/CD funzionante
- [x] Backup DB automatico
- [x] Monitoring attivo

---

## CHECKLIST FINALE PRE-LANCIO

```
LEGALE:
☐ Privacy Policy (GDPR compliant, menzione cookie, dati trattati)
☐ Termini di Servizio
☐ Cookie Policy
☐ Disclaimer: "Non sostituisce consulenza professionale"
☐ P.IVA visibile nel footer

TECNICO:
☐ Tutti i form funzionano (test end-to-end)
☐ Stripe: test pagamento → verifica accesso → cancellazione
☐ Email: tutte le email arrivano e sono formattate
☐ Mobile: tutto funziona su iPhone Safari e Android Chrome
☐ Performance: Lighthouse >90
☐ Security: HTTPS, CSRF, rate limiting, input sanitization

CONTENUTO:
☐ 100+ regole nel database con fonti verificate
☐ 5+ blog post pubblicati
☐ 4 mini-tools funzionanti
☐ PDF guida generato e verificato
☐ Testi landing page revisionati (no typo, tono coerente)

MARKETING:
☐ Dominio configurato
☐ Google Search Console collegato
☐ Sitemap inviata a Google
☐ Analytics installato
☐ Open Graph images per condivisione social
```

---

## NOTE FINALI PER CLAUDE CODE

1. **Ordine di esecuzione**: Segui le fasi da 0 a 8 in ordine. Non iniziare la Fase 4 prima di aver completato la Fase 3.

2. **Qualità > Velocità**: Meglio una landing page perfetta che 3 pagine mediocri. Ogni pixel conta.

3. **Mobile First**: OGNI componente deve funzionare su mobile prima che su desktop.

4. **Accessibilità**: Usa HTML semantico, aria-labels, contrasti corretti, navigazione da tastiera.

5. **TypeScript Strict**: Nessun `any`. Tipi per tutto. Prisma genera i types automaticamente.

6. **Errori**: Mai mostrare errori tecnici all'utente. Messaggi in italiano, amichevoli.

7. **Commit spesso**: Un commit per ogni step completato, con messaggio chiaro.

8. **Test**: Almeno test manuali su ogni flow principale. Se hai tempo, vitest per il rule engine.

9. **Design**: Rileggi la sezione DESIGN DIRECTION prima di creare QUALSIASI componente. Se un componente sembra "generato da AI", rifallo.

10. **Italiano**: Tutta la UI è in italiano. Codice e variabili in inglese. Commenti in inglese.
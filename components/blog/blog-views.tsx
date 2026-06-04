import Link from 'next/link'
import { BlogEndCta } from '@/components/blog/blog-end-cta'
import { BlogArticleBody } from '@/components/blog/blog-article-body'
import { BlogBreadcrumbs, BlogLayout } from '@/components/blog/blog-layout'
import { BlogPostCard } from '@/components/blog/blog-post-card'
import { Button } from '@/components/ui/button'
import { getAllBlogPosts } from '@/lib/blog/posts'
import { getBlogLocaleContent } from '@/lib/blog/content'
import { getServerLocale } from '@/lib/i18n/server'
import { ArrowRight } from 'lucide-react'

const COPY = {
  en: {
    title: 'Mercato Blog',
    subtitle:
      'Plain-language guides on vaults, yield, and supply chain finance — written for investors who do not live in crypto Twitter.',
    vaultSeries: 'DeFindex vault series',
    vaultSeriesDesc:
      'New to vaults? Start here. We explain what they are, where yield comes from, and how they fit alongside deal investing on Mercato.',
    allArticles: 'All articles',
    openVault: 'Open Mercato vault',
  },
  es: {
    title: 'Blog de Mercato',
    subtitle:
      'Guías en lenguaje claro sobre vaults, rendimiento y financiamiento de cadena de suministro — para inversionistas fuera del mundo crypto.',
    vaultSeries: 'Serie DeFindex vault',
    vaultSeriesDesc:
      '¿Nuevo en vaults? Empieza aquí. Explicamos qué son, de dónde sale el rendimiento y cómo encajan con invertir en órdenes.',
    allArticles: 'Todos los artículos',
    openVault: 'Abrir vault de Mercato',
  },
} as const

export async function BlogIndexView() {
  const locale = await getServerLocale()
  const copy = COPY[locale]
  const posts = getAllBlogPosts()
  const vaultPosts = posts.filter((post) => post.category === 'vault')

  return (
    <BlogLayout>
      <main className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
        <BlogBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: copy.title }]} />

        <div className="mb-12 max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
            Learn · Earn · Invest
          </p>
          <h1 className="font-display text-4xl font-normal tracking-tight sm:text-5xl">{copy.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{copy.subtitle}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="rounded-full bg-emerald-600 hover:bg-emerald-700">
              <Link href="/dashboard/vault">
                {copy.openVault}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/how-it-works">How Mercato works</Link>
            </Button>
          </div>
        </div>

        <section className="mb-14">
          <h2 className="mb-2 font-display text-2xl font-normal tracking-tight">{copy.vaultSeries}</h2>
          <p className="mb-6 max-w-2xl text-sm text-muted-foreground">{copy.vaultSeriesDesc}</p>
          <div className="grid gap-5 md:grid-cols-2">
            {vaultPosts.map((post) => (
              <BlogPostCard key={post.slug} post={post} locale={locale} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-6 font-display text-2xl font-normal tracking-tight">{copy.allArticles}</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {posts.map((post) => (
              <BlogPostCard key={post.slug} post={post} locale={locale} />
            ))}
          </div>
        </section>

        <BlogEndCta />
      </main>
    </BlogLayout>
  )
}

export async function BlogPostView({ slug }: { slug: string }) {
  const locale = await getServerLocale()
  const posts = getAllBlogPosts()
  const post = posts.find((item) => item.slug === slug)
  if (!post) return null

  const content = getBlogLocaleContent(post, locale)
  const related = posts.filter((item) => item.slug !== slug).slice(0, 2)

  return (
    <BlogLayout>
      <main className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
        <BlogBreadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: locale === 'es' ? 'Blog' : 'Blog', href: '/blog' },
            { label: content.title },
          ]}
        />

        <header className="mb-10 border-b border-border/60 pb-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
            {post.category === 'vault' ? 'Vault guide' : 'Mercato guide'}
          </p>
          <h1 className="font-display text-3xl font-normal tracking-tight sm:text-4xl">{content.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{content.excerpt}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <span aria-hidden>·</span>
            <span>{post.readingTimeMinutes} min read</span>
          </div>
        </header>

        <BlogArticleBody sections={content.sections} />

        <div className="mt-12 flex flex-wrap gap-3 border-t border-border/60 pt-8">
          <Button asChild className="rounded-full bg-emerald-600 hover:bg-emerald-700">
            <Link href="/dashboard/vault">Try the Mercato vault</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/blog">More articles</Link>
          </Button>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-5 font-display text-2xl font-normal tracking-tight">Continue reading</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {related.map((item) => (
                <BlogPostCard key={item.slug} post={item} locale={locale} />
              ))}
            </div>
          </section>
        )}
      </main>
    </BlogLayout>
  )
}

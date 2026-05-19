import Link from 'next/link'
import { ArrowRight, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { SupplierProductsCard } from '@/lib/dashboard/types'
import { getRoleTheme } from '@/lib/dashboard/role-theme'
import { cn } from '@/lib/utils'

type DashboardSupplierCatalogProps = {
  products: SupplierProductsCard | null
  hasCompanies: boolean
  showCatalog: boolean
  labels: {
    title: string
    descAll: string
    descPickCompany: string
    categories: string
    products: string
    moreProducts: string
    noProductsCompany: string
    hintNoCompanies: string
    hintPickCompany: string
    manageCatalog: string
  }
}

export function DashboardSupplierCatalog({
  products,
  hasCompanies,
  showCatalog,
  labels,
}: DashboardSupplierCatalogProps) {
  const theme = getRoleTheme('supplier')

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', theme.actionPrimary)}>
          <Package className={cn('h-5 w-5', theme.statIcon)} aria-hidden />
        </div>
        <div>
          <h3 className="text-base font-semibold">{labels.title}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {showCatalog ? labels.descAll : labels.descPickCompany}
          </p>
        </div>
      </div>

      {products ? (
        <div className="space-y-4">
          {products.categories.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {labels.categories}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {products.categories.map((cat) => (
                  <Badge key={cat} variant="secondary" className="capitalize text-xs">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {products.products.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {labels.products}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {products.products.slice(0, 8).map((product) => (
                  <Badge key={product} variant="outline" className="text-xs">
                    {product}
                  </Badge>
                ))}
                {products.products.length > 8 && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    {labels.moreProducts.replace('{count}', String(products.products.length - 8))}
                  </Badge>
                )}
              </div>
            </div>
          )}
          {products.categories.length === 0 && products.products.length === 0 && (
            <p className="text-sm text-muted-foreground">{labels.noProductsCompany}</p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {!hasCompanies ? labels.hintNoCompanies : labels.hintPickCompany}
        </p>
      )}

      <Button asChild variant="outline" size="sm" className="mt-5 w-full rounded-full">
        <Link href="/dashboard/supplier-profile">
          {labels.manageCatalog}
          <ArrowRight className="ml-2 h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  )
}

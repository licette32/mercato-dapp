'use client'

import { ChevronLeft, ChevronRight, Package, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getCategoryLabel } from '@/lib/categories'
import { PAGE_SIZE, type SupplierProduct } from '@/lib/supplier-profile/types'
import { useI18n } from '@/lib/i18n/provider'
import { SupplierProductCard } from './supplier-product-card'

type SortOption = { value: string; label: string }

type SupplierProductCatalogProps = {
  companyName: string | null
  products: SupplierProduct[]
  filteredCount: number
  search: string
  onSearchChange: (v: string) => void
  categoryFilter: string
  onCategoryFilterChange: (v: string) => void
  categoriesFromProducts: string[]
  sort: string
  onSortChange: (v: string) => void
  sortOptions: readonly SortOption[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onAddProduct: () => void
  onEditProduct: (p: SupplierProduct) => void
  onDeleteProduct: (p: SupplierProduct) => void
  onClearFilters: () => void
}

export function SupplierProductCatalog({
  companyName,
  products,
  filteredCount,
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  categoriesFromProducts,
  sort,
  onSortChange,
  sortOptions,
  currentPage,
  totalPages,
  onPageChange,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onClearFilters,
}: SupplierProductCatalogProps) {
  const { t } = useI18n()
  const hasFilters = search.trim() !== '' || categoryFilter !== 'all'
  const from = filteredCount === 0 ? 0 : currentPage * PAGE_SIZE + 1
  const to = Math.min((currentPage + 1) * PAGE_SIZE, filteredCount)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{t('supplierProfile.catalogTitle')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {companyName
              ? t('supplierProfile.catalogForCompany', { name: companyName })
              : t('supplierProfile.catalogDescription')}
          </p>
        </div>
        <Button onClick={onAddProduct} className="rounded-full">
          <Plus className="mr-2 h-4 w-4" aria-hidden />
          {t('supplierProfile.addProduct')}
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-[200px] flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('supplierProfile.searchProducts')}
            className="pl-9"
            aria-label={t('supplierProfile.searchProductsAria')}
          />
        </div>
        <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px]" aria-label={t('supplierProfile.categoryPlaceholder')}>
            <SelectValue placeholder={t('supplierProfile.categoryPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('supplierProfile.allCategories')}</SelectItem>
            {categoriesFromProducts.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {getCategoryLabel(cat)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className="w-full sm:w-[180px]" aria-label={t('supplierProfile.sortBy')}>
            <SelectValue placeholder={t('supplierProfile.sortBy')} />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" className="rounded-full" onClick={onClearFilters}>
            {t('supplierProfile.clearFilters')}
          </Button>
        )}
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center">
          <Package className="mb-3 h-10 w-10 text-muted-foreground/60" aria-hidden />
          {filteredCount === 0 && !hasFilters ? (
            <>
              <p className="font-medium">{t('supplierProfile.noProductsYet')}</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">{t('supplierProfile.noProductsHint')}</p>
              <Button onClick={onAddProduct} className="mt-4 rounded-full">
                <Plus className="mr-2 h-4 w-4" aria-hidden />
                {t('supplierProfile.addProduct')}
              </Button>
            </>
          ) : (
            <>
              <p className="font-medium">{t('supplierProfile.noMatches')}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t('supplierProfile.noMatchesHint')}</p>
              <Button variant="outline" onClick={onClearFilters} className="mt-4 rounded-full">
                {t('supplierProfile.clearFilters')}
              </Button>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((p) => (
              <SupplierProductCard
                key={p.id}
                product={p}
                onEdit={() => onEditProduct(p)}
                onDelete={() => onDeleteProduct(p)}
              />
            ))}
          </div>
          {filteredCount > PAGE_SIZE && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4 text-sm">
              <p className="text-muted-foreground">
                {t('supplierProfile.showingRange', { from, to, total: filteredCount })}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={currentPage === 0}
                  onClick={() => onPageChange(currentPage - 1)}
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                  {t('supplierProfile.previous')}
                </Button>
                <span className="px-2 text-muted-foreground">
                  {t('supplierProfile.pageOf', { current: currentPage + 1, total: totalPages })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => onPageChange(currentPage + 1)}
                >
                  {t('supplierProfile.next')}
                  <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'
import { ProductImage } from '@/components/media/product-image'
import { SupplierLogo } from '@/components/suppliers/supplier-logo'
import type { CreateDealFormData } from '../types'

interface DealSummaryCardProps {
  formData: Pick<CreateDealFormData, 'supplierName' | 'term' | 'fundingWindowDays'>
  productName: string
  productImageUrl?: string | null
  supplierLogoUrl?: string | null
  totalAmount: number
  baseAPR?: number
  effectiveAPR?: number
  yieldBonusApr: number
}

export function DealSummaryCard({
  formData,
  productName,
  productImageUrl,
  supplierLogoUrl,
  totalAmount,
  baseAPR,
  effectiveAPR,
  yieldBonusApr,
}: DealSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Deal Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          {productImageUrl ? (
            <ProductImage imageUrl={productImageUrl} alt={productName || 'Product'} size="sm" />
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground">Product</p>
            <p className="font-medium">{productName || 'Not set'}</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Amount</p>
          <p className="text-2xl font-bold tabular-nums">
            {totalAmount > 0 ? formatCurrency(totalAmount) : formatCurrency(0)}
          </p>
          <p className="text-xs text-muted-foreground">USDC</p>
        </div>
        <div className="flex items-start gap-3">
          <SupplierLogo
            logoUrl={supplierLogoUrl}
            companyName={formData.supplierName || 'Supplier'}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground">Supplier</p>
            <p className="font-medium">{formData.supplierName || 'Not set'}</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Term</p>
          <p className="font-medium">{formData.term} days</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Funding Window</p>
          <p className="font-medium">
            {formData.fundingWindowDays || 'Not set'} days
          </p>
        </div>
        {effectiveAPR != null && baseAPR != null && (
          <div>
            <p className="text-sm text-muted-foreground">Investor yield APR</p>
            <p className="font-medium text-success">{effectiveAPR.toFixed(2)}%</p>
            <p className="text-xs text-muted-foreground">
              Base {baseAPR.toFixed(1)}% from {formData.term} days and amount
              {yieldBonusApr > 0
                ? ` + ${yieldBonusApr.toFixed(2)}% PyME bonus`
                : ''}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

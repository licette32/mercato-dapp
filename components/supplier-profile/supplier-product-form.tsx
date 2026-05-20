'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PRODUCT_CATEGORIES } from '@/lib/categories'
import type { ProductFormState } from '@/lib/supplier-profile/types'
import { useI18n } from '@/lib/i18n/provider'

type SupplierProductFormProps = {
  formProduct: ProductFormState
  onChange: (patch: Partial<ProductFormState>) => void
}

export function SupplierProductForm({ formProduct, onChange }: SupplierProductFormProps) {
  const { t } = useI18n()

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="form-name">{t('supplierProfile.formProductName')}</Label>
          <Input
            id="form-name"
            value={formProduct.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={t('supplierProfile.formProductNamePh')}
            autoComplete="off"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="form-category">{t('supplierProfile.formCategory')}</Label>
          <Select
            value={formProduct.category || undefined}
            onValueChange={(v) => onChange({ category: v })}
          >
            <SelectTrigger id="form-category">
              <SelectValue placeholder={t('supplierProfile.formSelectCategory')} />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="form-price">{t('supplierProfile.formPriceLabel')}</Label>
        <Input
          id="form-price"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={formProduct.price_per_unit}
          onChange={(e) => onChange({ price_per_unit: e.target.value })}
          placeholder={t('supplierProfile.formPricePh')}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="form-min-order">{t('supplierProfile.formMinOrder')}</Label>
          <Input
            id="form-min-order"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={formProduct.minimum_order}
            onChange={(e) => onChange({ minimum_order: e.target.value })}
            placeholder={t('supplierProfile.formMinOrderPh')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="form-delivery">{t('supplierProfile.formDelivery')}</Label>
          <Input
            id="form-delivery"
            value={formProduct.delivery_time}
            onChange={(e) => onChange({ delivery_time: e.target.value })}
            placeholder={t('supplierProfile.formDeliveryPh')}
            autoComplete="off"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="form-desc">{t('supplierProfile.formDescription')}</Label>
        <Textarea
          id="form-desc"
          value={formProduct.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder={t('supplierProfile.formDescriptionPh')}
          rows={3}
          className="resize-none"
        />
      </div>
    </div>
  )
}

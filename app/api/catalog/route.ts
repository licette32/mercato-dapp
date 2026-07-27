import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export type CatalogProduct = {
  id: string
  supplier_id: string
  name: string
  category: string
  price_per_unit: number
  description?: string | null
  image_url?: string | null
  supplier?: {
    id: string
    company_name?: string
    address?: string
    owner_id?: string
    email?: string
    logo_url?: string | null
  } | null
}

export type CatalogResponse = {
  data: CatalogProduct[]
  hasMore: boolean
  count: number | null
}

/**
 * GET /api/catalog – returns paginated supplier products with company info.
 * Uses service role so the catalog is visible regardless of RLS (for Create Deal).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '50', 10)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''

    const start = (page - 1) * pageSize
    const end = start + pageSize - 1

    const supabase = createServiceClient()
    
    let query = supabase
      .from('supplier_products')
      .select(
        'id, supplier_id, name, category, price_per_unit, description, image_url, sku, unit, stock_quantity, reserved_quantity, reorder_point, supplier:supplier_companies(id, company_name, address, owner_id, logo_url)',
        { count: 'exact' }
      )

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }
    if (category) {
      query = query.eq('category', category)
    }

    const { data: products, error, count } = await query
      .order('category')
      .order('name')
      .range(start, end)

    if (error) {
      console.error('[catalog]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const rows = (products as unknown) as Array<{
      id: string
      supplier_id: string
      name: string
      category: string
      price_per_unit: number
      description?: string | null
      supplier?: { id: string; company_name?: string; address?: string; owner_id?: string; logo_url?: string | null } | null
    }>

    const ownerIds = [...new Set(rows.map((p) => p.supplier?.owner_id).filter(Boolean))] as string[]
    const emailByOwner: Record<string, string> = {}
    if (ownerIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', ownerIds)
      for (const p of profiles ?? []) {
        emailByOwner[p.id] = p.email ?? ''
      }
    }

    const withEmail: CatalogProduct[] = rows.map((p) => ({
      ...p,
      supplier: p.supplier
        ? { ...p.supplier, email: emailByOwner[p.supplier.owner_id ?? ''] }
        : p.supplier,
    }))

    const hasMore = count !== null && start + (products?.length || 0) < count

    return NextResponse.json({
      data: withEmail,
      hasMore,
      count
    } as CatalogResponse)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load catalog'
    console.error('[catalog]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

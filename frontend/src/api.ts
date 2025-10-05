export type Category = { id: number; name: string }
export type Fact = { id: number; fact: string; category?: string }

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch('/api/categories')
  if (!res.ok) throw new Error('Failed to load categories')
  return res.json()
}

export async function fetchFacts(category?: string, page = 0, size = 50) {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  params.set('page', String(page))
  params.set('size', String(size))
  const res = await fetch(`/api/facts?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to load facts')
  return res.json() as Promise<{ content: Fact[]; page: number; size: number; totalElements: number; totalPages: number }>
}

export async function fetchRandomFact(category?: string): Promise<Fact> {
  const qs = category ? `?category=${encodeURIComponent(category)}` : ''
  const res = await fetch(`/api/facts/random${qs}`)
  if (!res.ok) throw new Error('Failed to load random fact')
  return res.json()
}

export async function createFact(body: { fact: string; category: string }): Promise<Fact> {
  const res = await fetch('/api/facts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to create fact')
  return res.json()
}

export async function updateFact(id: number, body: { fact: string; category: string }): Promise<Fact> {
  const res = await fetch(`/api/facts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to update fact')
  return res.json()
}

export async function deleteFact(id: number): Promise<void> {
  const res = await fetch(`/api/facts/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete fact')
}



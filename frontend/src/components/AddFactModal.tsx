import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { Category } from '../api'

export default function AddFactModal({
  open,
  categories,
  onClose,
  onSubmit,
}: {
  open: boolean
  categories: Category[]
  onClose: () => void
  onSubmit: (payload: { fact: string; category: string }) => Promise<void>
}) {
  const [fact, setFact] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setFact('')
      setCategory('')
      setLoading(false)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fact.trim() || !category.trim()) return
    setLoading(true)
    try {
      await onSubmit({ fact: fact.trim(), category: category.trim() })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-xl p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-white/10 backdrop-blur-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              aria-label="Закрыть"
              className="absolute top-3 right-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 p-2 text-white"
              onClick={onClose}
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold mb-4">Добавить факт</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Факт</label>
                <textarea
                  className="w-full rounded-lg bg-black/30 border border-white/20 p-3 outline-none focus:border-neonPink min-h-28"
                  value={fact}
                  onChange={(e) => setFact(e.target.value)}
                  maxLength={2000}
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Категория</label>
                <select
                  className="w-full rounded-lg bg-black/30 border border-white/20 p-3 outline-none focus:border-neonCyan"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="" disabled>Выберите категорию</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20">Отмена</button>
                <button disabled={loading} type="submit" className="px-4 py-2 rounded-lg bg-gradient-to-r from-neonViolet to-neonPink hover:opacity-90 disabled:opacity-60">
                  {loading ? 'Сохранение…' : 'Сохранить'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}



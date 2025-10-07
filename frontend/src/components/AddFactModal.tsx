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
          className="fixed inset-0 z-50 grid place-items-center bg-black/85 backdrop-blur-2xl p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-lg border-2 border-cyber-cyan bg-dark-card backdrop-blur-md p-6"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: '0 0 40px rgba(0, 240, 255, 0.5), inset 0 0 30px rgba(0, 0, 0, 0.6)'
            }}
          >
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyber-pink" style={{ boxShadow: '0 0 5px #FF006E' }} />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyber-yellow" style={{ boxShadow: '0 0 5px #FFFF00' }} />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyber-green" style={{ boxShadow: '0 0 5px #00FF41' }} />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyber-purple" style={{ boxShadow: '0 0 5px #B000FF' }} />

            <button
              aria-label="Закрыть"
              className="absolute top-3 right-3 bg-dark-bg hover:bg-cyber-pink/20 border-2 border-cyber-pink p-2 text-cyber-pink transition-all hover:rotate-90"
              onClick={onClose}
              style={{
                boxShadow: '0 0 15px rgba(255, 0, 110, 0.5)'
              }}
            >
              <X size={20} />
            </button>

            <h3 className="text-2xl font-cyber font-black uppercase text-cyber-cyan mb-6 tracking-widest" style={{
              textShadow: '0 0 20px #00F0FF'
            }}>
              <span className="text-white/40">[</span> Добавить факт <span className="text-white/40">]</span>
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-cyber-green font-cyber uppercase tracking-wider" style={{
                  textShadow: '0 0 5px #00FF41'
                }}>
                  ФАКТ
                </label>
                <textarea
                  className="w-full bg-dark-bg border-2 border-cyber-cyan/50 p-3 outline-none focus:border-cyber-cyan text-white font-mono min-h-28 transition-all"
                  value={fact}
                  onChange={(e) => setFact(e.target.value)}
                  maxLength={2000}
                  required
                  style={{
                    boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)'
                  }}
                  onFocus={(e) => {
                    e.target.style.boxShadow = '0 0 20px rgba(0, 240, 255, 0.5)'
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = '0 0 10px rgba(0, 240, 255, 0.2)'
                  }}
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-cyber-pink font-cyber uppercase tracking-wider" style={{
                  textShadow: '0 0 5px #FF006E'
                }}>
                  КАТЕГОРИЯ
                </label>
                <select
                  className="w-full bg-dark-bg border-2 border-cyber-pink/50 p-3 outline-none focus:border-cyber-pink text-white font-mono transition-all"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  style={{
                    boxShadow: '0 0 10px rgba(255, 0, 110, 0.2)'
                  }}
                  onFocus={(e) => {
                    e.target.style.boxShadow = '0 0 20px rgba(255, 0, 110, 0.5)'
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = '0 0 10px rgba(255, 0, 110, 0.2)'
                  }}
                >
                  <option value="" disabled className="bg-dark-bg">Выберите категорию</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name} className="bg-dark-bg">{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-dark-bg border-2 border-white/30 hover:border-white/50 text-white/70 hover:text-white font-cyber uppercase text-sm transition-all"
                >
                  Отмена
                </button>
                <button
                  disabled={loading}
                  type="submit"
                  className="px-5 py-2.5 bg-dark-bg border-2 border-cyber-cyan hover:bg-cyber-cyan/20 text-cyber-cyan font-cyber uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{
                    boxShadow: '0 0 20px rgba(0, 240, 255, 0.5)'
                  }}
                >
                  {loading ? 'СОХРАНЕНИЕ...' : 'СОХРАНИТЬ'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}



import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Toast = { id: number; type: 'success' | 'error'; message: string }

export function useToaster() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = (type: Toast['type'], message: string) => {
    const id = Date.now()
    setToasts((t) => [...t, { id, type, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }
  return { push, toasts }
}

export default function Toaster({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed right-4 bottom-4 flex flex-col gap-2 z-[60]">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`rounded-xl px-4 py-3 backdrop-blur-xl border ${
              t.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-200'
            }`}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}



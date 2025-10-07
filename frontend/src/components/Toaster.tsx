import { useState } from 'react'
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
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`px-5 py-3 backdrop-blur-md border-2 font-cyber uppercase text-sm ${
              t.type === 'success'
                ? 'bg-dark-card border-cyber-green text-cyber-green'
                : 'bg-dark-card border-cyber-pink text-cyber-pink'
            }`}
            style={{
              boxShadow: t.type === 'success'
                ? '0 0 20px rgba(0, 255, 65, 0.5)'
                : '0 0 20px rgba(255, 0, 110, 0.5)'
            }}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}



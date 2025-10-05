import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { AnimatePresence, motion, useMotionValue, useScroll, useTransform, useSpring } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ChevronDown, Plus, Shuffle } from 'lucide-react'
import AddFactModal from './components/AddFactModal'
import Toaster, { useToaster } from './components/Toaster'
import { fetchCategories, fetchFacts, fetchRandomFact, createFact, type Category } from './api'

type Fact = { id: number; fact: string }

const IMAGES = Array.from({ length: 10 }, (_, i) => `/src/img/${i + 1}.png`)
const imageFor = (index: number) => (index < 10 ? IMAGES[index] : '/src/img/main.png')

// Floating Particles Component
const FloatingParticles = () => {
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 10 + 15,
    delay: Math.random() * 5,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, rgba(139,92,246,0.8), rgba(236,72,153,0.4))`,
            boxShadow: `0 0 ${p.size * 3}px rgba(139,92,246,0.6)`,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// Typing Effect Hook
const useTypingEffect = (text: string, speed = 80) => {
  const [displayText, setDisplayText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1))
        i++
      } else {
        setIsComplete(true)
        clearInterval(timer)
      }
    }, speed)
    return () => clearInterval(timer)
  }, [text, speed])

  return { displayText, isComplete }
}

// Counter Animation Hook
const useCountUp = (end: number, duration = 1000, isInView = false) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const increment = end / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [end, duration, isInView])

  return count
}

// Ripple Effect Component
const useRipple = () => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])

  const addRipple = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()
    setRipples((prev) => [...prev, { x, y, id }])
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600)
  }, [])

  const RippleContainer = useCallback(
    () => (
      <>
        {ripples.map((ripple) => (
                      <motion.span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 pointer-events-none -translate-x-1/2 -translate-y-1/2"
            style={{
              left: ripple.x,
              top: ripple.y,
            }}
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{ width: 200, height: 200, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </>
    ),
    [ripples]
  )

  return { addRipple, RippleContainer }
}

function App() {
  const [facts, setFacts] = useState<Fact[]>([])
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const { push, toasts } = useToaster()
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const touchX = useMotionValue<number>(0)
  const { scrollY, scrollYProgress } = useScroll()
  const parallax = useTransform(scrollY, [0, 600], [0, -180])
  const scaleProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  const modalRef = useRef<HTMLDivElement>(null)

  const { displayText, isComplete } = useTypingEffect(
    'Современный персональный сайт: факты, стиль и вдохновение',
    50
  )

  useEffect(() => {
    fetchCategories().then(setCategories).catch((e) => setError(e.message))
  }, [])

  const loadFacts = useCallback(() => {
    fetchFacts(selectedCategory || undefined, 0, 50)
      .then((page) => setFacts(page.content.sort((a, b) => a.id - b.id)))
      .catch((e) => setError(e.message))
  }, [selectedCategory])

  useEffect(() => { loadFacts() }, [loadFacts])

  const handleCreate = async (payload: { fact: string; category: string }) => {
    await createFact(payload)
    push('success', 'Факт добавлен')
    loadFacts()
  }

  const handleRandom = async () => {
    try {
      const rf = await fetchRandomFact(selectedCategory || undefined)
      const idx = facts.findIndex((f) => f.id === rf.id)
      if (idx >= 0) setActiveIdx(idx)
      else {
        // вставим временно в начало только для показа
        setFacts((prev) => [rf, ...prev])
        setActiveIdx(0)
      }
    } catch (e) {
      push('error', 'Не удалось получить случайный факт')
    }
  }

  // Keyboard navigation for modal
  useEffect(() => {
    if (activeIdx === null) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveIdx(null)
      } else if (e.key === 'ArrowLeft' && activeIdx > 0) {
        setActiveIdx(activeIdx - 1)
      } else if (e.key === 'ArrowRight' && activeIdx < facts.length - 1) {
        setActiveIdx(activeIdx + 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeIdx, facts.length])

  // Focus modal when opened
  useEffect(() => {
    if (activeIdx !== null && modalRef.current) {
      modalRef.current.focus()
    }
  }, [activeIdx])

  const heroImg = useMemo(() => '/src/img/main.png', [])

  const scrollToFacts = () => {
    document.getElementById('facts')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] via-[#0F172A] to-black text-white font-inter selection:bg-neonViolet/30 overflow-x-hidden">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-neonViolet via-neonPink to-neonCyan z-50 origin-left"
        style={{ scaleX: scaleProgress }}
      />

      {/* Hero */}
      <section className="relative h-[100svh] overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{ y: parallax }}
        >
          <motion.img
            src={heroImg}
            alt="Аиша — главная фотография"
            className="w-full h-full object-cover"
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <FloatingParticles />

        {/* Animated gradient orbs */}
        <motion.div
          className="absolute -top-20 -left-20 w-96 h-96 bg-neonViolet/20 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-neonCyan/20 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="backdrop-blur-2xl bg-white/[0.08] border border-white/20 rounded-[2rem] p-8 sm:p-12 max-w-4xl w-full shadow-[0_8px_32px_rgba(139,92,246,0.2)] relative overflow-hidden group"
          >
            {/* Animated border gradient */}
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-neonViolet via-neonPink to-neonCyan opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700 -z-10" />
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]">
              <motion.span
                className="inline-block bg-gradient-to-br from-neonViolet via-neonPink to-neonCyan bg-clip-text text-transparent"
                initial={{ backgroundPosition: '0% 50%' }}
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                style={{ backgroundSize: '200% 200%' }}
              >
                Калиматова Аиша
              </motion.span>
              <span className="block mt-3 text-white/90">Еркебулановна</span>
            </h1>

            <div className="mt-6 text-base sm:text-lg text-white/80 font-light h-8">
              {displayText}
              {!isComplete && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-[2px] h-5 bg-neonPink ml-1 align-middle"
                />
              )}
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.button
            onClick={scrollToFacts}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 hover:text-white/90 transition-colors cursor-pointer group"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.8 }}
          >
            <span className="text-sm font-medium tracking-wider">Узнать больше</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown className="w-6 h-6 group-hover:text-neonPink transition-colors" />
            </motion.div>
          </motion.button>
        </div>
      </section>

      {/* Facts */}
      <section id="facts" className="relative py-20 sm:py-32 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="mb-12"
        >
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              10 фактов
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20">
                <Plus className="w-4 h-4" /> Добавить факт
              </button>
              <button onClick={handleRandom} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-neonViolet to-neonPink hover:opacity-90">
                <Shuffle className="w-4 h-4" /> Случайный факт
              </button>
            </div>
          </div>
          <div className="mt-2 h-1.5 w-24 bg-gradient-to-r from-neonViolet to-neonPink rounded-full" />
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300"
          >
            {error}
          </motion.div>
        )}

        {/* Category filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full border ${selectedCategory ? 'bg-white/5 border-white/20' : 'bg-gradient-to-r from-neonViolet to-neonPink border-transparent'} `}
          >
            Все
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.name)}
              className={`px-3 py-1.5 rounded-full border ${selectedCategory === c.name ? 'bg-gradient-to-r from-neonViolet to-neonPink border-transparent' : 'bg-white/5 border-white/20'} `}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {facts.map((f, idx) => (
            <FactCard
              key={f.id}
              fact={f}
              index={idx}
              onClick={() => setActiveIdx(idx)}
            />
          ))}
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence mode="wait">
        {activeIdx !== null && (
          <motion.div
            key="backdrop"
            ref={modalRef}
            tabIndex={-1}
            className="fixed inset-0 z-50 grid place-items-center bg-black/80 backdrop-blur-2xl p-4 focus:outline-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setActiveIdx(null)}
          >
            <motion.div
              className="relative max-w-6xl w-full"
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => touchX.set(e.touches[0].clientX)}
              onTouchEnd={(e) => {
                const dx = e.changedTouches[0].clientX - touchX.get()
                if (Math.abs(dx) > 60) {
                  if (dx > 0 && activeIdx > 0) setActiveIdx(activeIdx - 1)
                  else if (dx < 0 && activeIdx < facts.length - 1) setActiveIdx(activeIdx + 1)
                }
              }}
            >
              <button
                aria-label="Закрыть"
                className="absolute top-4 right-4 z-20 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-md border border-white/30 p-2.5 text-white transition-all duration-200 hover:rotate-90 shadow-lg"
                onClick={() => setActiveIdx(null)}
              >
                <X size={22} />
              </button>

              <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/5 to-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <div className="relative">
                  <motion.img
                    key={activeIdx}
                    src={imageFor(activeIdx)}
                    alt={`Факт ${activeIdx + 1}`}
                    className="w-full max-h-[75svh] object-contain"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                <div className="p-6 sm:p-8 bg-gradient-to-t from-black/90 via-black/70 to-transparent backdrop-blur-sm">
                  <div className="text-sm text-white/60 font-medium mb-2">
                    Факт <span className="text-transparent bg-clip-text bg-gradient-to-r from-neonPink to-neonCyan font-bold">{activeIdx + 1}</span> из {facts.length}
                  </div>
                  <motion.div
                    key={`fact-${activeIdx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg sm:text-xl font-medium leading-relaxed text-white"
                  >
                    {facts[activeIdx].fact}
                  </motion.div>
                </div>
              </div>

              {/* Navigation buttons */}
              {activeIdx > 0 && (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-md border border-white/30 p-3 text-white transition-all duration-200 shadow-lg"
                  onClick={() => setActiveIdx(activeIdx - 1)}
                  aria-label="Предыдущий факт"
                >
                  <ChevronLeft size={24} />
                </motion.button>
              )}

              {activeIdx < facts.length - 1 && (
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-md border border-white/30 p-3 text-white transition-all duration-200 shadow-lg"
                  onClick={() => setActiveIdx(activeIdx + 1)}
                  aria-label="Следующий факт"
                >
                  <ChevronRight size={24} />
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Fact Modal & Toaster */}
      <AddFactModal open={addOpen} categories={categories} onClose={() => setAddOpen(false)} onSubmit={handleCreate} />
      <Toaster toasts={toasts} />
    </div>
  )
}

// Fact Card Component with all effects
const FactCard = ({ fact, index, onClick }: { fact: Fact; index: number; onClick: () => void }) => {
  const [isInView, setIsInView] = useState(false)
  const { addRipple, RippleContainer } = useRipple()
  const count = useCountUp(index + 1, 1000, isInView)

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      onViewportEnter={() => setIsInView(true)}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl cursor-pointer transition-all duration-300 hover:border-white/30 hover:shadow-[0_0_40px_rgba(139,92,246,0.3)]"
      onClick={(e) => {
        addRipple(e)
        onClick()
      }}
    >
      <RippleContainer />

      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-neonViolet/0 via-neonPink/0 to-neonCyan/0 group-hover:from-neonViolet/10 group-hover:via-neonPink/5 group-hover:to-neonCyan/10 transition-all duration-500 rounded-2xl" />

      <div className="relative aspect-[4/3] overflow-hidden">
        <motion.img
          loading="lazy"
          src={imageFor(index)}
          alt={`Факт ${index + 1}`}
          className="absolute inset-0 w-full h-full object-cover"
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        {/* Animated number badge */}
        <motion.div
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-gradient-to-br from-neonViolet to-neonPink flex items-center justify-center font-bold text-white shadow-lg"
          whileHover={{ scale: 1.15, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          {count}
        </motion.div>
      </div>

      <div className="p-4 relative z-10">
        <div className="text-xs uppercase tracking-wider text-white/50 font-semibold mb-1">
          Факт <span className="text-transparent bg-clip-text bg-gradient-to-r from-neonPink to-neonCyan">#{index + 1}</span>
        </div>
        <div className="text-white/90 font-medium leading-snug text-sm sm:text-base">
          {fact.fact}
        </div>
      </div>

      {/* Subtle inner glow */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 group-hover:ring-white/20 pointer-events-none transition-all duration-300" />
    </motion.article>
  )
}

export default App
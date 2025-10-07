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
const CyberGrid = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(to right, #00F0FF 1px, transparent 1px),
          linear-gradient(to bottom, #00F0FF 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }} />
    </div>
  )
}

const FloatingParticles = () => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 8 + 12,
    delay: Math.random() * 5,
    color: ['#00F0FF', '#FF006E', '#FFFF00', '#00FF41'][Math.floor(Math.random() * 4)],
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 8}px ${p.color}, 0 0 ${p.size * 15}px ${p.color}`,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
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

const ScanLine = () => {
  return (
    <motion.div
      className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-cyan to-transparent pointer-events-none z-50"
      style={{
        boxShadow: '0 0 10px #00F0FF, 0 0 20px #00F0FF',
      }}
      animate={{
        top: ['-2px', '100%'],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
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
    <div className="min-h-screen bg-dark-bg text-white font-mono selection:bg-cyber-cyan/30 overflow-x-hidden relative">
      <CyberGrid />
      <ScanLine />

      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyber-pink via-cyber-cyan to-cyber-yellow z-50 origin-left"
        style={{
          scaleX: scaleProgress,
          boxShadow: '0 0 10px currentColor'
        }}
      />

      {/* Hero */}
      <section className="relative h-[100svh] overflow-hidden border-b-2 border-cyber-cyan" style={{
        boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)'
      }}>
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

        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-dark-bg/70 to-black/90" />
        <FloatingParticles />

        {/* Animated gradient orbs */}
        <motion.div
          className="absolute -top-20 -left-20 w-96 h-96 bg-cyber-pink/20 rounded-full blur-[150px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-cyber-cyan/20 rounded-full blur-[150px]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.5, 0.4],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyber-purple/15 rounded-full blur-[140px]"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="backdrop-blur-md bg-dark-surface/60 border-2 border-cyber-cyan rounded-lg p-8 sm:p-12 max-w-4xl w-full relative overflow-hidden group"
            style={{
              boxShadow: '0 0 30px rgba(0, 240, 255, 0.4), inset 0 0 30px rgba(0, 240, 255, 0.1)'
            }}
          >
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyber-pink" style={{ boxShadow: '0 0 10px #FF006E' }} />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyber-yellow" style={{ boxShadow: '0 0 10px #FFFF00' }} />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyber-green" style={{ boxShadow: '0 0 10px #00FF41' }} />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyber-purple" style={{ boxShadow: '0 0 10px #B000FF' }} />
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-cyber font-black tracking-wider leading-[1.1] uppercase">
              <motion.span
                className="inline-block text-cyber-cyan"
                style={{
                  textShadow: '0 0 10px #00F0FF, 0 0 20px #00F0FF, 0 0 40px #00F0FF, 0 0 80px #00F0FF'
                }}
                animate={{
                  textShadow: [
                    '0 0 10px #00F0FF, 0 0 20px #00F0FF, 0 0 40px #00F0FF',
                    '0 0 20px #00F0FF, 0 0 30px #00F0FF, 0 0 60px #00F0FF',
                    '0 0 10px #00F0FF, 0 0 20px #00F0FF, 0 0 40px #00F0FF'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                Калиматова Аиша
              </motion.span>
              <span className="block mt-3 text-cyber-pink font-bold" style={{
                textShadow: '0 0 10px #FF006E, 0 0 20px #FF006E'
              }}>Еркебулановна</span>
            </h1>

            <div className="mt-6 text-base sm:text-lg text-cyber-green font-mono h-8" style={{
              textShadow: '0 0 5px #00FF41'
            }}>
              <span className="text-white/60">&gt;</span> {displayText}
              {!isComplete && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="inline-block w-[8px] h-5 bg-cyber-cyan ml-1 align-middle"
                  style={{ boxShadow: '0 0 5px #00F0FF' }}
                />
              )}
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.button
            onClick={scrollToFacts}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cyber-cyan cursor-pointer group"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.8 }}
            style={{
              textShadow: '0 0 5px #00F0FF'
            }}
          >
            <span className="text-sm font-bold tracking-widest uppercase font-cyber">Узнать больше</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown className="w-6 h-6 group-hover:text-cyber-pink transition-colors" style={{ filter: 'drop-shadow(0 0 5px currentColor)' }} />
            </motion.div>
          </motion.button>
        </div>
      </section>

      {/* Facts */}
      <section id="facts" className="relative py-20 sm:py-32 px-6 max-w-7xl mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="mb-12"
        >
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-4xl sm:text-6xl font-cyber font-black tracking-widest uppercase text-cyber-cyan" style={{
                textShadow: '0 0 20px #00F0FF, 0 0 40px #00F0FF'
              }}>
                10 ФАКТОВ
              </h2>
              <div className="mt-3 h-1 w-32 bg-gradient-to-r from-cyber-pink via-cyber-cyan to-cyber-yellow" style={{
                boxShadow: '0 0 10px currentColor'
              }} />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAddOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-dark-card border-2 border-cyber-pink font-cyber uppercase text-sm hover:bg-cyber-pink/20 transition-all"
                style={{
                  boxShadow: '0 0 15px rgba(255, 0, 110, 0.5)'
                }}
              >
                <Plus className="w-4 h-4" /> Добавить
              </button>
              <button
                onClick={handleRandom}
                className="inline-flex items-center gap-2 px-4 py-2 bg-dark-card border-2 border-cyber-cyan font-cyber uppercase text-sm hover:bg-cyber-cyan/20 transition-all"
                style={{
                  boxShadow: '0 0 15px rgba(0, 240, 255, 0.5)'
                }}
              >
                <Shuffle className="w-4 h-4" /> Random
              </button>
            </div>
          </div>
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
        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 font-cyber uppercase text-xs border-2 transition-all ${
              !selectedCategory
                ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan'
                : 'bg-dark-card border-white/20 text-white/70 hover:border-cyber-cyan/50'
            }`}
            style={{
              boxShadow: !selectedCategory ? '0 0 15px rgba(0, 240, 255, 0.6)' : 'none'
            }}
          >
            ВСЕ
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.name)}
              className={`px-4 py-2 font-cyber uppercase text-xs border-2 transition-all ${
                selectedCategory === c.name
                  ? 'bg-cyber-pink/20 border-cyber-pink text-cyber-pink'
                  : 'bg-dark-card border-white/20 text-white/70 hover:border-cyber-pink/50'
              }`}
              style={{
                boxShadow: selectedCategory === c.name ? '0 0 15px rgba(255, 0, 110, 0.6)' : 'none'
              }}
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
                className="absolute top-4 right-4 z-20 bg-dark-card hover:bg-cyber-pink/20 active:scale-95 border-2 border-cyber-pink p-2.5 text-cyber-pink transition-all duration-200 hover:rotate-90"
                onClick={() => setActiveIdx(null)}
                style={{
                  boxShadow: '0 0 20px rgba(255, 0, 110, 0.5)'
                }}
              >
                <X size={22} />
              </button>

              <div className="relative overflow-hidden border-2 border-cyber-cyan bg-dark-card" style={{
                boxShadow: '0 0 40px rgba(0, 240, 255, 0.4), inset 0 0 30px rgba(0, 0, 0, 0.8)'
              }}>
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

                <div className="p-6 sm:p-8 bg-gradient-to-t from-dark-bg via-dark-surface/80 to-transparent border-t-2 border-cyber-cyan/30">
                  <div className="text-sm text-cyber-cyan font-cyber uppercase tracking-widest mb-3" style={{
                    textShadow: '0 0 10px #00F0FF'
                  }}>
                    <span className="text-white/40">[</span> FACT <span className="text-cyber-pink font-bold">{activeIdx + 1}</span> / {facts.length} <span className="text-white/40">]</span>
                  </div>
                  <motion.div
                    key={`fact-${activeIdx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg sm:text-xl font-mono leading-relaxed text-white"
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
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-dark-card hover:bg-cyber-cyan/20 active:scale-95 border-2 border-cyber-cyan p-3 text-cyber-cyan transition-all duration-200"
                  onClick={() => setActiveIdx(activeIdx - 1)}
                  aria-label="Предыдущий факт"
                  style={{
                    boxShadow: '0 0 20px rgba(0, 240, 255, 0.5)'
                  }}
                >
                  <ChevronLeft size={24} />
                </motion.button>
              )}

              {activeIdx < facts.length - 1 && (
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-dark-card hover:bg-cyber-cyan/20 active:scale-95 border-2 border-cyber-cyan p-3 text-cyber-cyan transition-all duration-200"
                  onClick={() => setActiveIdx(activeIdx + 1)}
                  aria-label="Следующий факт"
                  style={{
                    boxShadow: '0 0 20px rgba(0, 240, 255, 0.5)'
                  }}
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
      className="group relative overflow-hidden border-2 border-cyber-cyan/50 bg-dark-card backdrop-blur-md cursor-pointer transition-all duration-300 hover:border-cyber-cyan"
      style={{
        boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 240, 255, 0.6), 0 0 60px rgba(255, 0, 110, 0.3)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 240, 255, 0.3)'
      }}
      onClick={(e) => {
        addRipple(e)
        onClick()
      }}
    >
      <RippleContainer />

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyber-pink" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyber-yellow" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyber-green" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyber-purple" />

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
          className="absolute top-3 right-3 w-10 h-10 bg-dark-bg border-2 border-cyber-cyan flex items-center justify-center font-cyber font-bold text-cyber-cyan"
          whileHover={{ scale: 1.15, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          style={{
            boxShadow: '0 0 15px #00F0FF',
            textShadow: '0 0 10px #00F0FF'
          }}
        >
          {count}
        </motion.div>
      </div>

      <div className="p-4 relative z-10 bg-black/40">
        <div className="text-xs uppercase tracking-widest text-cyber-green font-cyber mb-2" style={{
          textShadow: '0 0 5px #00FF41'
        }}>
          <span className="text-white/40">[</span> FACT <span className="text-cyber-cyan">#{index + 1}</span> <span className="text-white/40">]</span>
        </div>
        <div className="text-white font-mono leading-relaxed text-sm">
          {fact.fact}
        </div>
      </div>
    </motion.article>
  )
}

export default App
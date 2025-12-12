import { useState } from 'react'
import { ChevronRight, BarChart3, Zap, Users, Lock, Shield, Trash2 } from 'lucide-react'

const SLIDES = [
  {
    number: '01',
    label: 'Bienvenue',
    title: "L'argent",
    titleGray: 'simplifié.',
    description: 'Une vision claire de vos finances. Des décisions éclairées, chaque jour.',
    features: null
  },
  {
    number: '02',
    label: 'Fonctionnalités',
    title: "Tout ce qu'il",
    titleGray: 'vous faut.',
    description: null,
    features: [
      { icon: BarChart3, title: 'Suivi intelligent', desc: 'Revenus, dépenses, Mobile Money' },
      { icon: Zap, title: "Objectifs d'épargne", desc: 'Réalisez vos projets et vos rêves' },
      { icon: Users, title: 'Gestion des prêts', desc: "Suivez qui vous doit de l'argent" }
    ]
  },
  {
    number: '03',
    label: 'Sécurité',
    title: 'Vos données',
    titleGray: 'protégées.',
    description: 'Votre vie privée est notre priorité absolue.',
    features: [
      { icon: Lock, title: 'Chiffrement de bout en bout', desc: 'Données financières cryptées' },
      { icon: Shield, title: 'Aucun partage de données', desc: 'Vos infos ne sont jamais vendues' },
      { icon: Trash2, title: 'Contrôle total', desc: 'Supprimez vos données à tout moment' }
    ],
    isSecuritySlide: true
  },
  {
    number: '04',
    label: 'Prêt ?',
    title: 'Chaque franc',
    titleGradient: 'compte.',
    description: 'Prenez le contrôle de votre avenir financier dès maintenant.',
    isFinal: true
  }
]

export default function Onboarding({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const slide = SLIDES[currentSlide]
  const isLast = currentSlide === SLIDES.length - 1

  const handleNext = () => {
    if (isLast) {
      onComplete?.()
    } else {
      setCurrentSlide(prev => prev + 1)
    }
  }

  const handleSkip = () => {
    onComplete?.()
  }

  return (
    <div className="fixed inset-0 z-[100] bg-seka-dark flex flex-col">
      {/* Decorative SVG lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none" viewBox="0 0 400 800">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent"/>
            <stop offset="50%" stopColor="#00d68f"/>
            <stop offset="100%" stopColor="transparent"/>
          </linearGradient>
        </defs>
        <path d="M 0 200 Q 200 250 400 200" stroke="url(#lineGrad)" strokeWidth="0.5" fill="none"/>
        <path d="M 0 400 Q 200 450 400 400" stroke="url(#lineGrad)" strokeWidth="0.5" fill="none"/>
        <path d="M 0 600 Q 200 650 400 600" stroke="url(#lineGrad)" strokeWidth="0.5" fill="none"/>
      </svg>

      {/* Background glow for final slide */}
      {isLast && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-t from-seka-green/[0.08] to-transparent pointer-events-none" />
      )}

      <div className="relative z-10 flex-1 flex flex-col px-8 py-8 max-w-md mx-auto w-full">
        
        {/* Header */}
        {!slide.isFinal ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-seka-green to-emerald-600 flex items-center justify-center shadow-lg shadow-seka-green/20">
                <span className="text-seka-dark font-bold text-lg">S</span>
              </div>
              <div>
                <p className="font-semibold text-[15px] tracking-tight text-white">SEKA Money</p>
                <p className="text-gray-600 text-[11px] tracking-wide">Finance personnelle</p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-500 text-[11px] font-medium tracking-widest uppercase hover:text-white transition-colors"
            >
              Passer
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-seka-green to-emerald-600 flex items-center justify-center shadow-lg shadow-seka-green/20">
              <span className="text-seka-dark font-bold text-lg">S</span>
            </div>
          </div>
        )}

        {/* Big Number - Dégradé blanc original */}
        <div className={`mt-2 ${slide.isFinal ? 'flex justify-center mt-4' : 'flex justify-end -mr-4'}`}>
          <span 
            className="text-[160px] font-bold leading-[0.8]"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            {slide.number}
          </span>
        </div>

        {/* Main Content */}
        <div className={`mt-auto ${slide.isFinal ? 'text-center' : ''}`}>
          <p className="text-seka-green text-[11px] font-semibold tracking-[0.2em] uppercase mb-4">
            {slide.label}
          </p>
          
          <h1 
            className={`font-semibold tracking-tight leading-[1.15] mb-5 ${slide.isFinal ? 'text-[38px]' : 'text-[28px]'}`}
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            <span className="text-white">{slide.title}</span>
            <br/>
            {slide.titleGradient ? (
              <span className="bg-gradient-to-r from-seka-green to-emerald-400 bg-clip-text text-transparent">
                {slide.titleGradient}
              </span>
            ) : (
              <span className="text-gray-500">{slide.titleGray}</span>
            )}
          </h1>

          {slide.description && (
            <p className={`text-gray-400 text-[14px] leading-relaxed font-light ${slide.isFinal ? 'max-w-[260px] mx-auto' : 'max-w-[280px]'} mb-5`}>
              {slide.description}
            </p>
          )}

          {/* Features list */}
          {slide.features && (
            <div className="space-y-3 mt-4">
              {slide.features.map((feature, idx) => {
                const Icon = feature.icon
                return (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-3 ${slide.isSecuritySlide ? 'p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]' : ''}`}
                  >
                    <div className={`flex items-center justify-center flex-shrink-0 ${
                      slide.isSecuritySlide 
                        ? 'w-9 h-9 rounded-lg bg-seka-green/10' 
                        : 'w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06]'
                    }`}>
                      <Icon className={`text-seka-green ${slide.isSecuritySlide ? 'w-4 h-4' : 'w-5 h-5'}`} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className={`font-medium tracking-tight text-white ${slide.isSecuritySlide ? 'text-[12px]' : 'text-[14px]'}`}>
                        {feature.title}
                      </p>
                      <p className={`text-gray-500 font-light ${slide.isSecuritySlide ? 'text-[11px]' : 'text-[12px] mt-0.5'}`}>
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Trust badges for final slide */}
        {slide.isFinal && (
          <div className="flex justify-center gap-6 mb-8 mt-auto">
            {['Gratuit', 'Sécurisé', 'Simple'].map((badge, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[12px] text-gray-500">
                <div className="w-1.5 h-1.5 rounded-full bg-seka-green" />
                <span>{badge}</span>
              </div>
            ))}
          </div>
        )}

        {/* Bottom section */}
        <div className={slide.isFinal ? '' : 'mt-8'}>
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {SLIDES.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all duration-300 ${
                  idx === currentSlide 
                    ? 'w-8 bg-seka-green' 
                    : 'w-2 bg-white/10'
                }`}
              />
            ))}
          </div>

          {/* Button */}
          <button
            onClick={handleNext}
            className={`w-full py-4 font-semibold rounded-2xl text-[14px] tracking-wide transition-colors flex items-center justify-center gap-2 ${
              isLast 
                ? 'bg-seka-green text-seka-dark hover:bg-emerald-400' 
                : 'bg-white text-seka-dark hover:bg-gray-100'
            }`}
          >
            {isLast ? "C'est parti" : 'Continuer'}
            {!isLast && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}

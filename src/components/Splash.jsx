import { useState, useEffect } from 'react'

export default function Splash() {
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 bg-seka-dark flex flex-col items-center justify-center">
      {/* Fond avec gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 40%, rgba(0,208,156,0.15) 0%, transparent 50%),
                       radial-gradient(circle at 30% 60%, rgba(139,92,246,0.08) 0%, transparent 40%)`
        }}
      />

      {/* Contenu centré */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Halo autour du logo */}
        <div
          className="absolute rounded-full transition-all duration-1000"
          style={{
            width: pulse ? 140 : 120,
            height: pulse ? 140 : 120,
            background: `radial-gradient(circle, rgba(0,208,156,${pulse ? 0.3 : 0.15}) 0%, transparent 70%)`,
            filter: 'blur(12px)'
          }}
        />

        {/* Logo principal */}
        <div
          className="relative w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-500"
          style={{
            background: 'linear-gradient(145deg, #00D9A5 0%, #00B386 50%, #009973 100%)',
            boxShadow: `0 0 ${pulse ? 40 : 25}px rgba(0,217,165,${pulse ? 0.7 : 0.4}), 
                        0 0 ${pulse ? 80 : 50}px rgba(0,217,165,${pulse ? 0.4 : 0.2}), 
                        inset 0 2px 4px rgba(255,255,255,0.3)`,
            transform: `scale(${pulse ? 1.02 : 1})`
          }}
        >
          <span
            className="text-4xl font-bold text-seka-darker"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
          >
            S
          </span>
        </div>

        {/* Texte */}
        <h1
          className="mt-8 text-3xl font-bold text-seka-text text-center"
          style={{ textShadow: '0 0 20px rgba(0,217,165,0.3)' }}
        >
          SEKA Money
        </h1>
        <p className="text-seka-text-muted text-sm mt-2 text-center">
          Gérez votre argent simplement
        </p>

        {/* Spinner de chargement */}
        <div className="mt-10">
          <div className="relative w-10 h-10 flex items-center justify-center">
            {/* Cercle externe */}
            <div className="absolute inset-0 rounded-full border-2 border-seka-green/20" />
            {/* Arc animé */}
            <div
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-seka-green animate-spin"
              style={{ animationDuration: '1s' }}
            />
          </div>
        </div>

        {/* Texte chargement */}
        <p className="mt-4 text-seka-text-muted text-xs text-center">
          Chargement...
        </p>
      </div>
    </div>
  )
}

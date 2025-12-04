import { useEffect, useState } from 'react'

export default function Splash() {
  const [pulse, setPulse] = useState(true)
  
  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-seka-dark flex flex-col items-center justify-center relative overflow-hidden">
      {/* Particules flottantes */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-32 h-32 rounded-full bg-seka-green/10 blur-3xl"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animation: `float ${4 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>
      
      {/* Logo avec halo pulsant */}
      <div className="relative z-10">
        <div 
          className="absolute -inset-8 rounded-full transition-all duration-1000"
          style={{
            background: `radial-gradient(circle, rgba(0,217,165,${pulse ? 0.4 : 0.2}) 0%, rgba(0,217,165,${pulse ? 0.15 : 0.05}) 50%, transparent 70%)`,
            transform: `scale(${pulse ? 1.2 : 1})`,
            filter: 'blur(20px)'
          }}
        />
        <div 
          className="absolute -inset-4 rounded-full transition-all duration-700"
          style={{
            background: `radial-gradient(circle, rgba(0,217,165,${pulse ? 0.5 : 0.3}) 0%, transparent 70%)`,
            filter: 'blur(12px)'
          }}
        />
        <div 
          className="relative w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-500"
          style={{
            background: 'linear-gradient(145deg, #00D9A5 0%, #00B386 50%, #009973 100%)',
            boxShadow: `0 0 ${pulse ? 40 : 25}px rgba(0,217,165,${pulse ? 0.7 : 0.4}), 0 0 ${pulse ? 80 : 50}px rgba(0,217,165,${pulse ? 0.4 : 0.2}), inset 0 2px 4px rgba(255,255,255,0.3)`,
            transform: `scale(${pulse ? 1.02 : 1})`
          }}
        >
          <span className="text-4xl font-bold text-seka-darker" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>S</span>
        </div>
      </div>
      
      <h1 className="mt-8 text-3xl font-bold text-seka-text relative z-10" style={{ textShadow: '0 0 20px rgba(0,217,165,0.3)' }}>SEKA Money</h1>
      <p className="text-seka-text-muted text-sm mt-2 relative z-10">Gérez votre argent simplement</p>
      
      {/* Spinner */}
      <div className="mt-10 relative z-10">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-seka-green/20"/>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-seka-green animate-spin" style={{ animationDuration: '1s' }}/>
          <div className="absolute w-2 h-2 bg-seka-green rounded-full animate-spin" style={{ top: '0', left: '50%', marginLeft: '-4px', marginTop: '-1px', boxShadow: '0 0 10px rgba(0,217,165,0.8)', animationDuration: '1s' }}/>
        </div>
        <p className="text-seka-text-muted text-xs mt-4 animate-pulse">Chargement...</p>
      </div>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.5; }
          50% { transform: translateY(-20px) scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}

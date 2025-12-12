import { useState, useEffect } from 'react'

export default function Splash() {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    // Animation en étapes
    const timers = [
      setTimeout(() => setStage(1), 100),   // Commence à dessiner le S
      setTimeout(() => setStage(2), 1600),  // S se remplit
      setTimeout(() => setStage(3), 2100),  // Texte apparaît
    ]
    return () => timers.forEach(t => clearTimeout(t))
  }, [])

  return (
    <div className="fixed inset-0 bg-seka-dark flex flex-col items-center justify-center">
      
      {/* S qui se dessine */}
      <svg width="180" height="180" viewBox="0 0 100 100">
        <text 
          x="50" 
          y="75" 
          textAnchor="middle" 
          fontSize="100" 
          fontWeight="bold" 
          fontFamily="Arial, sans-serif"
          stroke="#00d68f"
          strokeWidth="2"
          style={{
            fill: stage >= 2 ? '#00d68f' : 'transparent',
            strokeDasharray: 200,
            strokeDashoffset: stage >= 1 ? 0 : 200,
            transition: stage >= 2 
              ? 'stroke-dashoffset 1.5s ease-out, fill 0.5s ease-out' 
              : 'stroke-dashoffset 1.5s ease-out',
          }}
        >
          S
        </text>
      </svg>
      
      {/* Texte qui apparaît */}
      <div 
        className="text-center mt-6"
        style={{
          opacity: stage >= 3 ? 1 : 0,
          transform: stage >= 3 ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
        }}
      >
        <h1 className="text-2xl font-bold text-white">SEKA Money</h1>
        <p className="text-gray-500 text-sm mt-2">Votre avenir financier commence ici</p>
      </div>
    </div>
  )
}

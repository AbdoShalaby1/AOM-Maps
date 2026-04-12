import { useTheme } from "../contexts/theme";

export default function ConsultingAI() {
  const {theme} = useTheme();
  return (
    <div className={`flex flex-col items-center justify-center py-20 space-y-10 ${theme === "light" ? "bg-white" : "bg-slate-900"} font-sans`}>
      <style>{`
        /* The original star shape morphs/pulses gently */
        @keyframes star-breathe {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25%  { transform: scale(1.06) rotate(90deg); }
          50%  { transform: scale(0.97) rotate(180deg); }
          75%  { transform: scale(1.04) rotate(270deg); }
        }

        .star-icon {
          animation: star-breathe 3s cubic-bezier(0.4,0,0.6,1) infinite;
          transform-origin: center;
        }

        /* Gradient Aura Animation */
        @keyframes aura-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }

        .gradient-aura {
          position: absolute;
          inset: 35px; /* Adjust as needed to control the aura size */
          border-radius: 50%;
          background: radial-gradient(circle, #4285F4 0%, #9C6FDE 50%, #EA4335 100%);
          filter: blur(20px); /* Adjust blur for the desired soft look */
          animation: aura-pulse 4s ease-in-out infinite;
          z-index: 0; /* Place it behind the star */
        }

        /* Simplified offline-friendly thinking pulse */
        @keyframes thinking-pulse {
          0%, 100% { opacity: 0.3; transform: scaleX(1); }
          50%      { opacity: 1;   transform: scaleX(1.15); }
        }
      `}</style>

      {/* === GEMINI SPINNER === */}
      <div className="relative w-36 h-36 flex items-center justify-center">

        {/* Soft glow underneath (offline safe CSS blur instead of SVG filter) */}
        <div className="absolute inset-0 rounded-full bg-blue-50 blur-3xl opacity-60" />

        {/* Gradient Aura */}
        <div className="gradient-aura" />

        {/* Center star with restored animation */}
        <div className="relative z-10 star-icon">
          <svg viewBox="0 0 60 60" className="w-14 h-14" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="star-grad-offline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4285F4" />
                <stop offset="50%" stopColor="#9C6FDE" />
                <stop offset="100%" stopColor="#EA4335" />
              </linearGradient>
            </defs>
            <path
              d="M30 0 C33 22 38 27 60 30 C38 33 33 38 30 60 C27 38 22 33 0 30 C22 27 27 22 30 0 Z"
              fill="url(#star-grad-offline)"
            />
          </svg>
        </div>
      </div>

      {/* === TEXT === */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-semibold text-gray-800 tracking-tight">
        <span style={{
            background: 'linear-gradient(90deg, #4285F4, #9C6FDE, #EA4335)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>Loading...</span>
        </h2>
      </div>
    </div>
  );
}
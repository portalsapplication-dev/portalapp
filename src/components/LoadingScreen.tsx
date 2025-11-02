interface LoadingScreenProps {
  text?: string;
}

const LoadingScreen = ({ text = "Loading..." }: LoadingScreenProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background animate-fade-in overflow-hidden">
      {/* Animated star field background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-foreground/40 rounded-full animate-[twinkle_3s_ease-in-out_infinite]"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-8 relative z-10">
        {/* Smooth pulsating orb with theme-responsive glow */}
        <div className="relative w-40 h-40">
          {/* Outer glow rings with seamless animation */}
          <div className="absolute inset-0 rounded-full bg-foreground/10 dark:bg-foreground/15 animate-[portal-pulse_3s_ease-in-out_infinite]" />
          <div 
            className="absolute inset-3 rounded-full bg-foreground/15 dark:bg-foreground/20 animate-[portal-pulse_3s_ease-in-out_infinite]"
            style={{ animationDelay: '0.3s' }}
          />
          <div 
            className="absolute inset-6 rounded-full bg-foreground/20 dark:bg-foreground/25 animate-[portal-pulse_3s_ease-in-out_infinite]"
            style={{ animationDelay: '0.6s' }}
          />
          
          {/* Core orb with smooth glow */}
          <div className="absolute inset-10 rounded-full bg-gradient-to-br from-foreground/40 via-foreground/25 to-foreground/15 animate-glow-pulse shadow-[0_0_60px_rgba(0,0,0,0.3)] dark:shadow-[0_0_60px_rgba(255,255,255,0.4)]" />
          
          {/* Center dot */}
          <div className="absolute inset-[4.5rem] rounded-full bg-foreground/90 animate-[pulse_2s_ease-in-out_infinite]" />
        </div>
        
        {text && (
          <p className="text-muted-foreground text-base font-medium animate-[pulse_2s_ease-in-out_infinite]">{text}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;

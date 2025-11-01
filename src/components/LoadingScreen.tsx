interface LoadingScreenProps {
  text?: string;
}

const LoadingScreen = ({ text = "Loading..." }: LoadingScreenProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background animate-fade-in">
      <div className="flex flex-col items-center gap-6">
        {/* Pulsating orb with theme-responsive glow */}
        <div className="relative w-32 h-32">
          {/* Outer glow rings */}
          <div className="absolute inset-0 rounded-full bg-foreground/5 animate-[portal-pulse_2s_ease-in-out_infinite]"></div>
          <div 
            className="absolute inset-2 rounded-full bg-foreground/10 animate-[portal-pulse_2s_ease-in-out_infinite_0.2s]"
            style={{ animationDelay: '0.2s' }}
          ></div>
          <div 
            className="absolute inset-4 rounded-full bg-foreground/15 animate-[portal-pulse_2s_ease-in-out_infinite_0.4s]"
            style={{ animationDelay: '0.4s' }}
          ></div>
          
          {/* Core orb */}
          <div className="absolute inset-8 rounded-full bg-gradient-to-br from-foreground/30 to-foreground/10 animate-glow-pulse shadow-[0_0_40px_rgba(0,0,0,0.3)] dark:shadow-[0_0_40px_rgba(255,255,255,0.3)]"></div>
          
          {/* Center dot */}
          <div className="absolute inset-[3.25rem] rounded-full bg-foreground/80 animate-pulse"></div>
        </div>
        
        {text && (
          <p className="text-muted-foreground text-sm font-medium animate-pulse">{text}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;

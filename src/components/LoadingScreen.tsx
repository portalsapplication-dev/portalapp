interface LoadingScreenProps {
  text?: string;
}

const LoadingScreen = ({ text = "Loading..." }: LoadingScreenProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background animate-fade-in">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-foreground animate-spin"></div>
        </div>
        {text && (
          <p className="text-muted-foreground text-sm animate-pulse">{text}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface NumericPadProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

const NumericPad = ({ value, onChange, maxLength }: NumericPadProps) => {
  const handleNumberClick = (num: string) => {
    if (!maxLength || value.length < maxLength) {
      onChange(value + num);
    }
  };

  const handleDelete = () => {
    onChange(value.slice(0, -1));
  };

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <div className="w-full max-w-xs mx-auto space-y-6">
      {/* Display dots for password */}
      <div className="flex justify-center gap-3 min-h-[40px] items-center">
        {[...Array(maxLength || Math.max(value.length, 6))].map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-all shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)] ${
              i < value.length
                ? "bg-foreground border-foreground scale-110"
                : "bg-background border-foreground/30"
            }`}
          />
        ))}
      </div>

      {/* Number pad */}
      <div className="grid grid-cols-3 gap-3">
        {numbers.slice(0, 9).map((num) => (
          <Button
            key={num}
            type="button"
            variant="outline"
            onClick={() => handleNumberClick(num)}
            className="h-16 text-2xl font-semibold shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all"
          >
            {num}
          </Button>
        ))}
        <div /> {/* Empty space */}
        <Button
          type="button"
          variant="outline"
          onClick={() => handleNumberClick('0')}
          className="h-16 text-2xl font-semibold shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all"
        >
          0
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleDelete}
          className="h-16 shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all"
          disabled={value.length === 0}
        >
          <X className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

export default NumericPad;

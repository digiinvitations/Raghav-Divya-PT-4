import { motion } from "motion/react";
import { Heart } from "lucide-react";

export function HeartDivider() {
  return (
    <div className="flex items-center justify-center gap-4 py-6 opacity-70">
      <div className="h-[1px] w-12 bg-pink-border"></div>
      <Heart className="w-4 h-4 text-pink-accent fill-pink-accent" />
      <div className="h-[1px] w-12 bg-pink-border"></div>
    </div>
  );
}

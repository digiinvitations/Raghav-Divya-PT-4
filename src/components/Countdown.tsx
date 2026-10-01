import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { HeartDivider } from "./HeartDivider";

interface CountdownProps {
  targetDate: string;
}

export function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setIsEnded(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <section className="py-16 px-4 bg-blush-main flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <h2 className="font-script text-4xl text-wine-dark text-center">
          Counting Down to Forever
        </h2>
        
        <HeartDivider />

        {!isEnded ? (
          <div className="flex justify-between items-center w-full gap-2 mt-4 px-2">
            <TimeUnit value={timeLeft.days} label="DAYS" />
            <TimeUnit value={timeLeft.hours} label="HOURS" />
            <TimeUnit value={timeLeft.minutes} label="MINUTES" />
            <TimeUnit value={timeLeft.seconds} label="SECONDS" />
          </div>
        ) : (
          <div className="text-center p-8 border border-pink-border rounded-xl bg-blush-light mt-4">
            <h3 className="font-script text-3xl text-wine-dark mb-2">Today is the Day!</h3>
            <p className="text-sm opacity-80 uppercase tracking-widest">Let the celebration begin</p>
          </div>
        )}
      </motion.div>
    </section>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  const formattedValue = value.toString().padStart(2, "0");
  
  return (
    <div className="flex flex-col items-center w-1/4">
      <div className="w-full aspect-square bg-blush-light rounded-xl border border-pink-border flex items-center justify-center shadow-sm mb-3">
        <span className="font-serif font-semibold text-2xl text-wine-dark">
          {formattedValue}
        </span>
      </div>
      <span className="text-[9px] uppercase tracking-widest text-text-body opacity-70">
        {label}
      </span>
    </div>
  );
}

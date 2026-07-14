import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { SliderSlide } from '../types';

interface HomeSliderProps {
  slides: SliderSlide[];
}

export const HomeSlider: React.FC<HomeSliderProps> = ({ slides }) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = next, -1 = prev
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const total = slides.length;

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      handleNext();
    }, 6000); // 6s auto-play
  };

  useEffect(() => {
    if (total > 0) {
      resetTimer();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [current, total]);

  if (total === 0) return null;

  const handleNext = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + total) % total);
  };

  const goToSlide = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  // Parallax animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 1.05,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.6 },
        scale: { duration: 0.8 },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-100%' : '100%',
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
      },
    }),
  };

  const currentSlide = slides[current];

  return (
    <div id="hero-slider" className="relative w-full h-[18rem] md:h-[24rem] lg:h-[25rem] bg-[#0c1612] overflow-hidden group rounded-3xl shadow-md border border-zinc-200/10">
      {/* Slides Container */}
      <div className="relative w-full h-full">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentSlide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full flex items-center justify-start"
          >
            {/* Ken Burns background effect */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              <motion.img
                src={currentSlide.image}
                alt={currentSlide.title}
                referrerPolicy="no-referrer"
                animate={{ scale: [1, 1.05] }}
                transition={{ duration: 6, ease: 'easeOut' }}
                className="w-full h-full object-cover object-center opacity-85 select-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </div>

            {/* Slide Content */}
            <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8 z-10 text-white select-none">
              {/* Slide Title/Subtitle block (Top Left) */}
              <div className="max-w-xl flex flex-col gap-1.5 text-left bg-black/35 backdrop-blur-md p-4 rounded-2xl border border-white/15 shadow-lg">
                <span className="text-[9px] uppercase font-bold tracking-widest text-red-500">🔥 Premium AI Solutions</span>
                <h2 className="text-xl md:text-2xl font-black font-sans leading-tight tracking-tight text-white">{currentSlide.title}</h2>
                <p className="text-[11px] text-zinc-200 line-clamp-2 md:line-clamp-none font-medium leading-relaxed">{currentSlide.subtitle}</p>
              </div>

              {/* Orange Action CTA Button (Bottom Left) */}
              <div className="flex items-end justify-between w-full mt-auto">
                <a
                  id={`slider-btn-${currentSlide.id}`}
                  href={currentSlide.buttonLink}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#f97316] hover:bg-[#ea580c] active:scale-95 text-xs font-black uppercase tracking-wider rounded-lg shadow-lg shadow-orange-600/30 text-white transition-all duration-200 cursor-pointer"
                >
                  <span>SHOP NOW</span>
                  <ArrowRight className="w-4 h-4 text-white stroke-[2.5px]" />
                </a>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <button
        id="slider-prev-arrow"
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/60 active:scale-90 border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        id="slider-next-arrow"
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/60 active:scale-90 border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 cursor-pointer"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Pagination Dots (Bottom Right) */}
      <div className="absolute bottom-6 right-6 flex items-center gap-1.5 z-20 bg-black/40 backdrop-blur-md px-3 py-2 rounded-full border border-white/10 shadow-md">
        {slides.map((_, idx) => (
          <button
            id={`slider-dot-${idx}`}
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
              idx === current ? 'w-6 bg-[#10b981] shadow-sm shadow-[#10b981]/50' : 'w-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

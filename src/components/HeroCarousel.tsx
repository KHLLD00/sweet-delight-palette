import { useCallback, useEffect, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";

type HeroSlide = {
  src: string;
  alt: string;
  caption: string;
};

type HeroCarouselProps = {
  slides: HeroSlide[];
  onImageClick?: (index: number) => void;
};

export function HeroCarousel({ slides, onImageClick }: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAutoPlay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startAutoPlay = useCallback(() => {
    stopAutoPlay();
    if (!emblaApi || slides.length < 2) return;
    timerRef.current = setInterval(() => emblaApi.scrollNext(), 4500);
  }, [emblaApi, slides.length, stopAutoPlay]);

  useEffect(() => {
    startAutoPlay();
    return stopAutoPlay;
  }, [startAutoPlay, stopAutoPlay]);

  return (
    <div
      className="hero-carousel reveal"
      onMouseEnter={stopAutoPlay}
      onMouseLeave={startAutoPlay}
      onFocus={stopAutoPlay}
      onBlur={startAutoPlay}
      aria-label="Ease Cakes gallery"
    >
      <div className="hero-carousel-viewport" ref={emblaRef}>
        <div className="hero-carousel-container">
          {slides.map((slide, index) => (
            <div
              className="hero-slide"
              key={slide.src}
              role={onImageClick ? "button" : undefined}
              tabIndex={onImageClick ? 0 : undefined}
              aria-label={onImageClick ? "Open gallery: " + slide.caption : undefined}
              onClick={() => onImageClick?.(index)}
              onKeyDown={(event) => {
                if (onImageClick && (event.key === "Enter" || event.key === " ")) {
                  event.preventDefault();
                  onImageClick(index);
                }
              }}
            >
              <img
                src={slide.src}
                alt={slide.alt}
                width={1440}
                height={1920}
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                decoding="async"
              />
              <span className="hero-slide-caption">{slide.caption}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="hero-carousel-controls">
        <button type="button" className="hero-carousel-button" onClick={(event) => { event.stopPropagation(); emblaApi?.scrollPrev(); }} aria-label="Previous cake image">
          ‹
        </button>
        <span aria-hidden="true">Swipe to explore our bakes</span>
        <button type="button" className="hero-carousel-button" onClick={(event) => { event.stopPropagation(); emblaApi?.scrollNext(); }} aria-label="Next cake image">
          ›
        </button>
      </div>
    </div>
  );
}

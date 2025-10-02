

"use client";
import React, { useRef, useEffect } from "react";

const companyLogos = [
  "/logos/gevernovalogo.png",
  "/logos/Pepsicologo.png",
  "/logos/Pfizerlogo.png",
  "/logos/Oraclelogo.png",
  "/logos/Uberlogo.png",
  "/logos/Sabrelogo.png",
  "/logos/Airbnblogo.png",
  // "/logos/logo8.png",
];

export default function LogoCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  // Auto-scroll logic with seamless infinite loop
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    const track = trackRef.current;
    if (!scrollContainer || !track) return;
    let reqId: number;
    let lastTimestamp = 0;
  const speed = 0.07; // px per ms (even slower for smooth scroll)

    // Get width of one logo set
    const logoSetWidth = track.scrollWidth / 2;

    function step(ts: number) {
      if (!lastTimestamp) lastTimestamp = ts;
      const dt = ts - lastTimestamp;
      lastTimestamp = ts;
      if (scrollContainer) {
        scrollContainer.scrollLeft += speed * dt;
        // If reached end of first set, reset to equivalent position in second set
        if (scrollContainer.scrollLeft >= logoSetWidth) {
          scrollContainer.scrollLeft -= logoSetWidth;
        }
      }
      reqId = requestAnimationFrame(step);
    }
    reqId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(reqId);
  }, []);

  // User scroll: seamless loop
  const handleScroll = () => {
    const scrollContainer = scrollRef.current;
    const track = trackRef.current;
    if (!scrollContainer || !track) return;
    const logoSetWidth = track.scrollWidth / 2;
    if (scrollContainer.scrollLeft >= logoSetWidth) {
      scrollContainer.scrollLeft -= logoSetWidth;
    }
    if (scrollContainer.scrollLeft < 0) {
      scrollContainer.scrollLeft += logoSetWidth;
    }
  };

  // Drag-to-scroll logic
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    function onPointerDown(e: PointerEvent) {
      if (!scrollContainer) return;
      isDown = true;
      scrollContainer.classList.add("dragging");
      startX = e.pageX - scrollContainer.offsetLeft;
      scrollLeft = scrollContainer.scrollLeft;
    }
    function onPointerMove(e: PointerEvent) {
      if (!isDown || !scrollContainer) return;
      e.preventDefault();
      const x = e.pageX - scrollContainer.offsetLeft;
      const walk = (x - startX);
      scrollContainer.scrollLeft = scrollLeft - walk;
    }
    function onPointerUp() {
      if (!scrollContainer) return;
      isDown = false;
      scrollContainer.classList.remove("dragging");
    }
    scrollContainer.addEventListener("pointerdown", onPointerDown);
    scrollContainer.addEventListener("pointermove", onPointerMove);
    scrollContainer.addEventListener("pointerup", onPointerUp);
    scrollContainer.addEventListener("pointerleave", onPointerUp);
    return () => {
      scrollContainer.removeEventListener("pointerdown", onPointerDown);
      scrollContainer.removeEventListener("pointermove", onPointerMove);
      scrollContainer.removeEventListener("pointerup", onPointerUp);
      scrollContainer.removeEventListener("pointerleave", onPointerUp);
    };
  }, []);

  // Render two sets of logos for seamless loop
  return (
    <div
  className="w-full overflow-x-auto overflow-y-hidden py-1 bg-[#131F36] shadow-lg cursor-grab"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      ref={scrollRef}
      onScroll={handleScroll}
    >
      <div className="relative">
        <div
          className="carousel-track flex items-center gap-0"
          style={{ minWidth: "max-content" }}
          ref={trackRef}
        >
          {[...companyLogos, ...companyLogos].map((src, idx) => (
            <div key={idx} className="flex-shrink-0 flex items-center justify-center">
              <img
                src={src}
                alt={`Company Logo ${(idx % companyLogos.length) + 1}`}
                className="h-40 w-40 object-contain bg-transparent"
                style={{ background: "transparent" }}
              />
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .w-full::-webkit-scrollbar {
          display: none;
        }
        .carousel-track {
          width: max-content;
          align-items: center;
        }
        .w-full.dragging {
          cursor: grabbing !important;
        }
        @media (min-width: 768px) {
          .carousel-track > div {
            width: 14.28%; /* 7 logos visible, closer together */
          }
        }
        @media (max-width: 767px) {
          .carousel-track > div {
            width: 10%; /* 4 logos visible, closer together */
          }
        }
      `}</style>
    </div>
  );
}

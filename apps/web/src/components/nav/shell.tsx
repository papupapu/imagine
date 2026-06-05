"use client";

import { useNav } from "./context";

export function ContentShell({ children }: { children: React.ReactNode }) {
  const { open, animating, clearAnimating } = useNav();

  return (
    <div
      data-nav-open={open || undefined}
      data-nav-animating={animating || undefined}
      onTransitionEnd={(e) => {
        if (
          e.target === e.currentTarget &&
          e.propertyName === "grid-template-columns"
        ) {
          clearAnimating();
        }
      }}
      className="flex-1 flex flex-col xl:grid xl:grid-cols-[0px_1fr] data-[nav-open]:xl:grid-cols-[240px_1fr] data-[nav-animating]:xl:transition-[grid-template-columns] data-[nav-animating]:xl:duration-300 data-[nav-animating]:xl:ease-in-out"
    >
      {children}
    </div>
  );
}

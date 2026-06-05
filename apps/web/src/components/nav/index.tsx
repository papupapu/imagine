"use client";

import { useNav } from "./context";

export function Nav() {
  const { open, animating, toggle, clearAnimating } = useNav();

  return (
    <>
      <nav
        data-open={open || undefined}
        data-animating={animating || undefined}
        onTransitionEnd={(e) => {
          if (e.target === e.currentTarget && e.propertyName === "transform") {
            clearAnimating();
          }
        }}
        className="fixed inset-y-0 left-0 z-40 w-3/4 md:w-[320px] md:border-r -translate-x-full data-[open]:translate-x-0 data-[animating]:transition-transform data-[animating]:duration-300 data-[animating]:ease-in-out bg-background xl:static xl:z-auto xl:w-auto xl:translate-x-0 xl:overflow-hidden"
      >
        <div className="w-[240px] xl:w-full">
          navigation
        </div>
      </nav>
      {open && (
        <div
          onClick={toggle}
          className="fixed inset-0 z-30 bg-black/50 xl:hidden"
        />
      )}
    </>
  );
}

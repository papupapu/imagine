"use client";

import { useNav } from "./context";

export function NavToggle() {
  const { open, toggle } = useNav();

  return (
    <button
      onClick={toggle}
      aria-expanded={open}
      aria-label={open ? "Close navigation" : "Open navigation"}
      className="size-9 inline-flex items-center justify-center rounded-md hover:bg-gray-light/30"
    >
      {open ? "Close" : "Menu"}
    </button>
  );
}

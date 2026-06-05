"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface NavContextValue {
  open: boolean;
  animating: boolean;
  toggle: () => void;
  clearAnimating: () => void;
}

const NavContext = createContext<NavContextValue | null>(null);

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNav must be used within NavProvider");
  return ctx;
}

const XL_BREAKPOINT = "(min-width: 1280px)";

export function NavProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(XL_BREAKPOINT);

    if (mql.matches) {
      setOpen(true);
    }

    function handleChange() {
      setOpen(false);
      setAnimating(false);
    }

    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  const toggle = useCallback(() => {
    setAnimating(true);
    setOpen((prev) => !prev);
  }, []);

  const clearAnimating = useCallback(() => {
    setAnimating(false);
  }, []);

  const value = useMemo(
    () => ({ open, animating, toggle, clearAnimating }),
    [open, animating, toggle, clearAnimating],
  );

  return <NavContext value={value}>{children}</NavContext>;
}

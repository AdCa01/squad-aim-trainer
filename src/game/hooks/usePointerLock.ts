"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function usePointerLock() {
  const [isLocked, setIsLocked] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  const requestLock = useCallback((element: HTMLElement) => {
    elementRef.current = element;
    element.requestPointerLock();
  }, []);

  const exitLock = useCallback(() => {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, []);

  useEffect(() => {
    const onChange = () => {
      setIsLocked(!!document.pointerLockElement);
    };
    document.addEventListener("pointerlockchange", onChange);
    return () => document.removeEventListener("pointerlockchange", onChange);
  }, []);

  return { isLocked, requestLock, exitLock };
}

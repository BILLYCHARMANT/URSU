"use client";

import { useState } from "react";

/**
 * URSU logo image. Hides if the image fails to load (e.g. when public/ursu-logo.png is not added).
 * Add the official URSU logo to public/ursu-logo.png to display it.
 */
export function URSULogo({
  className = "h-8 w-auto object-contain",
  alt = "URSU",
}: {
  className?: string;
  alt?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <img
      src="/ursu-logo.png"
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

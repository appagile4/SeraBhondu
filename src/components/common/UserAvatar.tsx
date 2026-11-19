"use client";

import React, { useState, useEffect } from "react";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: number | "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  borderClassName?: string;
}

export function UserAvatar({
  src,
  name = "User",
  size = "md",
  className = "",
  borderClassName = "",
}: UserAvatarProps) {
  const [hasError, setHasError] = useState(false);

  // Reset error state if src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const cleanName = (name || "User").trim();
  const initials = cleanName
    ? cleanName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("")
    : "U";

  // Dimension classes
  let dimClass = "w-10 h-10 text-sm";
  let pixelDim: number | undefined = undefined;

  if (typeof size === "number") {
    pixelDim = size;
    dimClass = "";
  } else {
    switch (size) {
      case "xs":
        dimClass = "w-6 h-6 text-[10px]";
        break;
      case "sm":
        dimClass = "w-8 h-8 text-xs";
        break;
      case "md":
        dimClass = "w-10 h-10 text-sm";
        break;
      case "lg":
        dimClass = "w-16 h-16 text-xl";
        break;
      case "xl":
        dimClass = "w-20 h-20 sm:w-24 sm:h-24 text-2xl sm:text-3xl";
        break;
    }
  }

  // Sanitize source URL
  const trimmedSrc = src?.trim();
  const isValidUrl =
    !hasError &&
    trimmedSrc &&
    trimmedSrc.length > 5 &&
    (trimmedSrc.startsWith("http://") ||
      trimmedSrc.startsWith("https://") ||
      trimmedSrc.startsWith("/") ||
      trimmedSrc.startsWith("data:"));

  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 flex items-center justify-center font-black select-none bg-gradient-to-br from-[#014923] to-[#0D532C] text-white shadow-xs ${dimClass} ${borderClassName} ${className}`}
      style={pixelDim ? { width: pixelDim, height: pixelDim, fontSize: Math.max(12, Math.floor(pixelDim * 0.38)) } : undefined}
    >
      {isValidUrl ? (
        <img
          src={trimmedSrc}
          alt={cleanName}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="tracking-tight uppercase">{initials || "U"}</span>
      )}
    </div>
  );
}

export default UserAvatar;

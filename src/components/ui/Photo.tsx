"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

interface PhotoProps {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  imageClassName?: string;
  eager?: boolean;
}

/**
 * Фото с пастельной подложкой: если изображение не загрузилось,
 * остаётся аккуратный градиент вместо «битой» картинки.
 * Позиционирование (relative/absolute) задаёт родитель через className.
 */
export function Photo({ src, alt, sizes, className, imageClassName, eager }: PhotoProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn("overflow-hidden bg-linear-to-br from-powder via-lilac to-ice", className)}>
      {!failed && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          className={cn("object-cover", imageClassName)}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

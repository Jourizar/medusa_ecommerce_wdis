"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { MedusaProduct, MedusaProductOption } from "@ecommerce/types";

interface ProductVariantsProps {
  product: MedusaProduct;
  onVariantChange?: (variantId: string) => void;
}

export function ProductVariants({
  product,
  onVariantChange,
}: ProductVariantsProps) {
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});

  if (!product.options || product.options.length === 0) {
    return null;
  }

  const handleOptionSelect = (optionId: string, value: string) => {
    const newOptions = { ...selectedOptions, [optionId]: value };
    setSelectedOptions(newOptions);

    // Only resolve a variant once every option has a selection — matching on
    // a partial selection could silently pick the wrong variant.
    const allSelected = (product.options ?? []).every(
      (opt) => newOptions[opt.id]
    );
    if (!allSelected) return;

    const matchingVariant = (product.variants ?? []).find((variant) =>
      (variant.options ?? []).every(
        (opt) => newOptions[opt.option_id] === opt.value
      )
    );

    if (matchingVariant && onVariantChange) {
      onVariantChange(matchingVariant.id);
    }
  };

  return (
    <div className="mb-6 space-y-4">
      {product.options.map((option: MedusaProductOption) => (
        <div key={option.id}>
          <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">
            {option.title}
          </label>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const isSelected = selectedOptions[option.id] === value.value;

              return (
                <button
                  key={value.id}
                  onClick={() => handleOptionSelect(option.id, value.value)}
                  aria-pressed={isSelected}
                  className={cn(
                    "min-w-[3rem] px-4 py-2 text-sm font-black uppercase tracking-widest border-[3px] border-black transition-[transform,box-shadow,background-color] duration-100",
                    isSelected
                      ? "bg-primary text-white shadow-[3px_3px_0_0_#000] -translate-x-0.5 -translate-y-0.5"
                      : "bg-cream text-black hover:bg-accent active:translate-x-0.5 active:translate-y-0.5"
                  )}
                >
                  {value.value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

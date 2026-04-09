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

    // Find the matching variant
    const matchingVariant = product.variants.find((variant) =>
      variant.options.every(
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
          <label className="block text-sm font-medium text-text mb-2">
            {option.title}
          </label>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const isSelected = selectedOptions[option.id] === value.value;

              return (
                <button
                  key={value.id}
                  onClick={() => handleOptionSelect(option.id, value.value)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border",
                    isSelected
                      ? "bg-primary border-primary text-white shadow-lg shadow-primary/25"
                      : "bg-surface border-border text-text-muted hover:border-primary hover:text-text"
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

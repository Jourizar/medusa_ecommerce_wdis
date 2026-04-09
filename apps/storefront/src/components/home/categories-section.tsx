"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shirt, Zap, Flame, Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const categories = [
  {
    title: "Tops & Tees",
    href: "/products?category=tops",
    icon: Shirt,
    gradient: "from-violet-600/20 to-purple-600/20",
  },
  {
    title: "Hoodies & Crews",
    href: "/products?category=hoodies",
    icon: Zap,
    gradient: "from-amber-600/20 to-orange-600/20",
  },
  {
    title: "Bottoms",
    href: "/products?category=bottoms",
    icon: Flame,
    gradient: "from-emerald-600/20 to-teal-600/20",
  },
  {
    title: "Accessories",
    href: "/products?category=accessories",
    icon: Star,
    gradient: "from-rose-600/20 to-pink-600/20",
  },
];

export function CategoriesSection() {
  return (
    <section className="py-16 px-4 bg-surface/30">
      <div className="container mx-auto">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-text text-center mb-10">
          Shop by Category
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link href={category.href}>
                <div
                  className={cn(
                    "relative rounded-2xl p-6 md:p-8 text-center transition-all duration-300",
                    "bg-gradient-to-br border border-border",
                    "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1",
                    category.gradient
                  )}
                >
                  <category.icon className="w-8 h-8 md:w-10 md:h-10 text-primary mx-auto mb-3" />
                  <h3 className="text-sm md:text-base font-display font-semibold text-text">
                    {category.title}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

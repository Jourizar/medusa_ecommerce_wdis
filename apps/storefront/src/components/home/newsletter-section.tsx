"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to newsletter service
    setSubmitted(true);
  };

  return (
    <section className="py-20 px-4">
      <motion.div
        className="container mx-auto max-w-2xl text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-3xl md:text-4xl font-display font-bold text-text mb-3">
          Get First Access
        </h2>
        <p className="text-text-muted mb-8">
          Be the first to know about new drops, exclusive deals, and member-only
          discounts. No spam — just fire.
        </p>

        {submitted ? (
          <motion.div
            className="glass rounded-2xl p-6 text-center"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <p className="text-lg font-medium text-success">
              You are in! Check your inbox for a welcome surprise.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" size="lg">
              Subscribe
            </Button>
          </form>
        )}
      </motion.div>
    </section>
  );
}

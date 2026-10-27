"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="py-24 px-4 bg-accent border-b-[6px] border-black">
      <div className="max-w-container mx-auto">
        <div className="max-w-3xl mx-auto bg-cream border-[6px] border-black shadow-[12px_12px_0_0_#77269A] p-8 md:p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-hotpink border-[4px] border-black mb-6 rotate-3">
            <Mail className="w-10 h-10 text-black" strokeWidth={3} />
          </div>

          <h2 className="text-brutal text-5xl md:text-7xl text-black mb-4">
            GET
            <br />
            FIRST{" "}
            <span className="bg-primary text-white px-3 inline-block border-[5px] border-black -rotate-1">
              ACCESS
            </span>
          </h2>

          <p className="text-base md:text-lg font-bold uppercase tracking-wider text-black mb-10 max-w-xl mx-auto">
            New drops · Exclusive deals · Member-only discounts.
            <br />
            <span className="bg-hotpink px-2 border-[3px] border-black inline-block mt-2">
              No spam — just fire.
            </span>
          </p>

          {submitted ? (
            <div className="bg-primary text-white border-[4px] border-black p-6 shadow-[6px_6px_0_0_#000]">
              <p className="text-xl font-black uppercase tracking-wider">
                ★ You are in! Check your inbox. ★
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
            >
              <Input
                type="email"
                placeholder="YOU@EMAIL.COM"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" size="lg" variant="primary">
                Subscribe
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

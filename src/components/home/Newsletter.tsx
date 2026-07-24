"use client";

import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/Reveal";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        setEmail("");
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-beige py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="overflow-hidden rounded-[32px] border border-ink/10 bg-white p-8 text-center shadow-[0_24px_60px_-20px_rgba(17,17,17,0.15)] sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/10">
              <Mail className="h-7 w-7 text-gold-dark" />
            </div>
            <h2 className="mt-5 font-heading text-2xl font-bold sm:text-3xl">
              Join the Rayvia family
            </h2>
            <p className="mt-3 text-base text-muted">
              Subscribe for exclusive offers, skincare tips and early access to new launches.
              Get <span className="font-semibold text-gold-dark">10% off</span> your first order.
            </p>

            {submitted ? (
              <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-3 rounded-[14px] bg-success/10 px-6 py-4">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <p className="text-sm font-semibold text-success">
                  You're subscribed! Check your inbox for the discount code.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button type="submit" variant="gold" disabled={loading}>
                  {loading ? "..." : "Subscribe"}
                </Button>
              </form>
            )}
            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
            <p className="mt-4 text-xs text-muted">
              By subscribing you agree to our Privacy Policy. Unsubscribe anytime.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

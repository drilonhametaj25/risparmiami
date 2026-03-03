"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionItem {
  id: string;
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

function Accordion({ items, className }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className={cn("divide-y divide-border-light", className)}>
      {items.map((item) => (
        <div key={item.id} className="py-4">
          <button
            onClick={() => setOpenId(openId === item.id ? null : item.id)}
            className="flex w-full items-center justify-between text-left"
            aria-expanded={openId === item.id}
          >
            <span className="text-body font-medium text-text-primary pr-4">
              {item.question}
            </span>
            <ChevronDown
              className={cn(
                "h-5 w-5 flex-shrink-0 text-text-muted transition-transform duration-300",
                openId === item.id && "rotate-180"
              )}
            />
          </button>
          <AnimatePresence>
            {openId === item.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <p className="pt-3 text-body text-text-secondary leading-relaxed">
                  {item.answer}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export { Accordion, type AccordionItem, type AccordionProps };

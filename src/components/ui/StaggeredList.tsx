"use client";

import { motion } from "framer-motion";
import React, { type ReactNode } from "react";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariant = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

interface StaggeredListProps {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
}

export function StaggeredList({ children, className, itemClassName }: StaggeredListProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      className={className}
    >
      {React.Children.map(children, (child, i) => (
        <motion.div key={i} variants={itemVariant} className={itemClassName}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

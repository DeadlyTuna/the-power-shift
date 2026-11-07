"use client";

import { motion, type HTMLMotionProps, type Variants } from "framer-motion";
import { staggerItemVariants } from "@/components/motion/Stagger";

/**
 * <StaggerList> for ordered lists: real sequences (steps, agendas) keep their
 * <ol> semantics and still enter one after another. Same timing and no-JS
 * behaviour as src/components/motion/Stagger.
 */

const container: Variants = {
  hidden: {},
  show: (stagger: number = 0.1) => ({ transition: { staggerChildren: stagger, delayChildren: 0.05 } }),
};

export function StaggerOl({
  stagger = 0.1,
  amount = 0.15,
  ...props
}: HTMLMotionProps<"ol"> & { stagger?: number; amount?: number }) {
  return (
    <motion.ol
      data-reveal=""
      variants={container}
      custom={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      {...props}
    />
  );
}

export function StaggerOlItem(props: HTMLMotionProps<"li">) {
  return <motion.li data-reveal="" variants={staggerItemVariants} {...props} />;
}

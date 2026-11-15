"use client";

import { motion, type HTMLMotionProps, type Variants } from "framer-motion";

/**
 * Staggered entrances for grids and lists.
 *
 *   <Stagger className="grid gap-6 md:grid-cols-3">
 *     {items.map((i) => <StaggerItem key={i.id}>…</StaggerItem>)}
 *   </Stagger>
 *
 *   <StaggerList>{items.map((i) => <StaggerListItem key={i}>…</StaggerListItem>)}</StaggerList>
 */

const container: Variants = {
  hidden: {},
  show: (stagger: number = 0.08) => ({ transition: { staggerChildren: stagger, delayChildren: 0.05 } }),
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

type ContainerOptions = { stagger?: number; amount?: number };

function containerProps({ stagger = 0.08, amount = 0.15 }: ContainerOptions) {
  return {
    "data-reveal": "",
    variants: container,
    custom: stagger,
    initial: "hidden",
    whileInView: "show",
    viewport: { once: true, amount },
  } as const;
}

export function Stagger({ stagger, amount, ...props }: HTMLMotionProps<"div"> & ContainerOptions) {
  return <motion.div {...containerProps({ stagger, amount })} {...props} />;
}

export function StaggerItem(props: HTMLMotionProps<"div">) {
  return <motion.div data-reveal="" variants={staggerItemVariants} {...props} />;
}

export function StaggerList({ stagger, amount, ...props }: HTMLMotionProps<"ul"> & ContainerOptions) {
  return <motion.ul {...containerProps({ stagger, amount })} {...props} />;
}

export function StaggerListItem(props: HTMLMotionProps<"li">) {
  return <motion.li data-reveal="" variants={staggerItemVariants} {...props} />;
}

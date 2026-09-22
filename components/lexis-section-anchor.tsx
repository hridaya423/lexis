"use client";

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  focus?: string;
  children: ReactNode;
};

export function SectionAnchor({ href, focus, onClick, children, ...rest }: Props) {
  function go(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (!focus || event.defaultPrevented) return;
    event.preventDefault();
    document.querySelector<HTMLElement>(href)?.scrollIntoView();
    document
      .querySelector<HTMLElement>(focus)
      ?.focus({ preventScroll: true });
  }
  return (
    <a href={href} onClick={go} {...rest}>
      {children}
    </a>
  );
}

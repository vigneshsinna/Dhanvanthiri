import { type RefObject, useEffect } from 'react';

const NESTED_REVEAL_SELECTOR = '[data-animate], .animate-on-scroll';

const DIRECTIONAL_CLASSES = ['top-down', 'slide-left', 'slide-right', 'scale-in'];

export function usePageScrollReveal(containerRef: RefObject<HTMLElement>, routeKey: string) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let reducedMotionMedia: MediaQueryList | null = null;
    if (typeof window !== 'undefined' && 'matchMedia' in window) {
      reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    }

    const observedTargets = new Set<HTMLElement>();

    const revealObserver = reducedMotionMedia?.matches
      ? null
      : new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const element = entry.target as HTMLElement;
          element.classList.add('is-visible');
          revealObserver?.unobserve(element);
        });
      },
      {
        threshold: 0.14,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    const collectTargets = () => {
      const topLevelChildren = Array.from(container.children).filter(
        (node): node is HTMLElement => node instanceof HTMLElement
      );
      const nestedTargets = Array.from(container.querySelectorAll<HTMLElement>(NESTED_REVEAL_SELECTOR));
      return Array.from(new Set<HTMLElement>([...topLevelChildren, ...nestedTargets])).filter(
        (el) => !el.hasAttribute('data-reveal-ignore')
      );
    };

    const registerTargets = () => {
      const targets = collectTargets();

      targets.forEach((el, index) => {
        const isNewTarget = !observedTargets.has(el);
        if (!isNewTarget) return;

        observedTargets.add(el);

        if (!el.classList.contains('animate-on-scroll')) {
          el.classList.add('animate-on-scroll');
        }

        const hasDirectionalClass = DIRECTIONAL_CLASSES.some((cls) => el.classList.contains(cls));
        if (!hasDirectionalClass) {
          el.classList.add('top-down');
        }

        if (!el.style.getPropertyValue('--reveal-delay')) {
          const delayMs = Math.min(index * 55, 420);
          el.style.setProperty('--reveal-delay', `${delayMs}ms`);
        }

        const customDelay = el.getAttribute('data-animate-delay');
        if (customDelay) {
          el.style.setProperty('--reveal-delay', customDelay);
        }

        if (reducedMotionMedia?.matches) {
          el.classList.add('is-visible');
          return;
        }

        el.classList.remove('is-visible');
        revealObserver?.observe(el);
      });
    };

    registerTargets();

    const mutationObserver = new MutationObserver(() => {
      registerTargets();
    });

    mutationObserver.observe(container, { childList: true, subtree: true });

    // Fail-safe: never leave content hidden if observer misses late async DOM updates.
    const revealFailSafeTimer = window.setTimeout(() => {
      observedTargets.forEach((el) => {
        el.classList.add('is-visible');
      });
    }, 2200);

    return () => {
      window.clearTimeout(revealFailSafeTimer);
      mutationObserver.disconnect();
      revealObserver?.disconnect();
    };
  }, [containerRef, routeKey]);
}

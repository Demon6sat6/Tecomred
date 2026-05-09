import { type ReactNode } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number; // ms
}

export default function AnimatedSection({ children, className = '', delay = 0 }: Props) {
  const { ref, visible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

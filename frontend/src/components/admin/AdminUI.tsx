import { useEffect, useId, useRef, useState, type ElementType, type ReactNode } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

import type { Tone } from '../../utils/adminFormat';
export type { Tone };

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h2>{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Indicador de sincronización con el servidor; se actualiza cada segundo. */
export function LiveStatus({ compact = false }: { compact?: boolean }) {
  const { lastSync, syncOnline } = useAdmin();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const seconds = lastSync ? Math.max(0, Math.round((now - lastSync.getTime()) / 1000)) : null;
  const ago = seconds === null ? 'conectando…' : seconds < 5 ? 'ahora' : seconds < 60 ? `hace ${seconds} s` : `hace ${Math.floor(seconds / 60)} min`;
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600" role="status">
      <span className={`admin-live-dot ${syncOnline ? '' : 'offline'}`} />
      {syncOnline ? 'En vivo' : 'Sin conexión'}
      {!compact && <span className="font-medium text-slate-400">· {ago}</span>}
    </span>
  );
}

export function StatCard({ label, value, icon: Icon, tone = 'blue', detail }: { label: string; value: ReactNode; icon: ElementType; tone?: Tone; detail?: ReactNode }) {
  return (
    <div className="admin-card min-w-0 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12.5px] font-semibold text-slate-500">{label}</p>
          <p className="tabular mt-1.5 truncate text-[clamp(1.3rem,2vw,1.7rem)] font-extrabold leading-tight tracking-tight text-[#0f1d33]">{value}</p>
        </div>
        <span className={`admin-kpi-icon admin-tone-${tone}`}><Icon className="h-5 w-5" strokeWidth={2} /></span>
      </div>
      {detail && <div className="mt-3 text-[11.5px] font-medium text-slate-500">{detail}</div>}
    </div>
  );
}

export function Badge({ tone = 'slate', children, dot = true }: { tone?: Tone; children: ReactNode; dot?: boolean }) {
  return <span className={`admin-badge admin-tone-${tone} ${dot ? '' : 'no-dot'}`}>{children}</span>;
}

export function EmptyState({ icon: Icon, title, text, action }: { icon: ElementType; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400"><Icon className="h-7 w-7" /></span>
      <p className="text-sm font-bold text-slate-800">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder, label, className = '' }: { value: string; onChange: (value: string) => void; placeholder: string; label?: string; className?: string }) {
  return (
    <label className={`admin-search block ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
      <input type="search" value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} aria-label={label ?? placeholder} className="admin-input" maxLength={80} />
    </label>
  );
}

export function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (value: T) => void; options: { value: T; label: string; count?: number }[]; label: string }) {
  return (
    <div className="admin-segment" role="group" aria-label={label}>
      {options.map(option => (
        <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => onChange(option.value)}>
          {option.label}{option.count !== undefined && <span className="count">{option.count}</span>}
        </button>
      ))}
    </div>
  );
}

type FieldControlProps = { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string };

/** Contenedor de campo con etiqueta, ayuda y mensaje de error accesibles. */
export function Field({ label, error, hint, required, children, className = '' }: {
  label: string; error?: string; hint?: string; required?: boolean; className?: string;
  children: (props: FieldControlProps) => ReactNode;
}) {
  const id = useId();
  const messageId = error || hint ? `${id}-msg` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="admin-label">{label}{required && <span className="req" aria-hidden="true">*</span>}</label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': messageId })}
      {error ? <p id={messageId} className="admin-field-error"><AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />{error}</p>
        : hint ? <p id={messageId} className="admin-field-hint">{hint}</p> : null}
    </div>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className="admin-switch" />;
}

export function Modal({ title, subtitle, icon: Icon, onClose, children, footer, size = 'md' }: {
  title: string; subtitle?: ReactNode; icon?: ElementType; onClose: () => void; children: ReactNode; footer?: ReactNode; size?: 'sm' | 'md' | 'lg';
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; });

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLElement>('input:not([disabled]):not([type="hidden"]), select, textarea')?.focus();
    const onKey = (event: KeyboardEvent) => {
      // SweetAlert2 gestiona su propio Escape cuando está abierto.
      if (event.key === 'Escape' && !document.querySelector('.swal2-container')) closeRef.current();
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, []);

  const width = size === 'sm' ? 'sm:max-w-md' : size === 'lg' ? 'sm:max-w-3xl' : 'sm:max-w-xl';
  return (
    <div className="admin-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} className={`admin-modal ${width}`}>
        <div className="admin-modal-header">
          <div className="flex min-w-0 items-start gap-3">
            {Icon && <span className="admin-kpi-icon admin-tone-blue !h-10 !w-10"><Icon className="h-5 w-5" /></span>}
            <div className="min-w-0">
              <h3 id={titleId} className="truncate text-base">{title}</h3>
              {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
            </div>
          </div>
          <button type="button" onClick={onClose} className="admin-icon-button -mr-2 -mt-1" aria-label="Cerrar"><X className="h-5 w-5" /></button>
        </div>
        <div className="admin-modal-body">{children}</div>
        {footer && <div className="admin-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-5" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => <div key={index} className="admin-skeleton h-10" />)}
    </div>
  );
}



import Swal, { type SweetAlertIcon } from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// Una sola apariencia para todos los diálogos del panel.
const base = Swal.mixin({
  buttonsStyling: false,
  reverseButtons: true,
  customClass: {
    popup: 'admin-swal',
    title: 'admin-swal-title',
    htmlContainer: 'admin-swal-text',
    actions: 'admin-swal-actions',
    confirmButton: 'admin-swal-btn admin-swal-confirm',
    cancelButton: 'admin-swal-btn admin-swal-cancel',
    denyButton: 'admin-swal-btn admin-swal-cancel',
  },
});

const toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2600,
  timerProgressBar: true,
  customClass: { popup: 'admin-swal-toast' },
  didOpen: popup => {
    popup.addEventListener('mouseenter', Swal.stopTimer);
    popup.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] ?? char
));

const errorMessage = (cause: unknown, fallback: string) => cause instanceof Error && cause.message ? cause.message : fallback;

export const adminAlert = {
  /** Notificación breve que no interrumpe el trabajo. */
  toast: (title: string, icon: SweetAlertIcon = 'success') => toast.fire({ icon, title }),
  success: (title: string, text?: string) => toast.fire({ icon: 'success', title, text }),
  info: (title: string, text?: string) => base.fire({ icon: 'info', title, text, confirmButtonText: 'Entendido' }),
  error: (text: string, title = 'No se pudo completar') => base.fire({ icon: 'error', title, text, confirmButtonText: 'Aceptar' }),
  /** Muestra el error de una operación fallida con un mensaje legible. */
  failure: (cause: unknown, fallback: string) => base.fire({ icon: 'error', title: 'No se pudo completar', text: errorMessage(cause, fallback), confirmButtonText: 'Aceptar' }),
  /** Lista los campos con errores de validación. */
  validation: (errors: string[]) => base.fire({
    icon: 'warning',
    title: 'Revisa el formulario',
    html: `<ul class="admin-swal-list">${errors.map(error => `<li>${escapeHtml(error)}</li>`).join('')}</ul>`,
    confirmButtonText: 'Corregir',
  }),
  confirm: async (title: string, text: string, confirmButtonText = 'Sí, continuar', icon: SweetAlertIcon = 'question') => {
    const result = await base.fire({ icon, title, text, showCancelButton: true, confirmButtonText, cancelButtonText: 'Cancelar' });
    return result.isConfirmed;
  },
  /** Confirmación destructiva con botón rojo. */
  confirmDelete: async (title: string, text: string, confirmButtonText = 'Sí, eliminar') => {
    const result = await base.fire({
      icon: 'warning', title, text, showCancelButton: true, confirmButtonText, cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'admin-swal', title: 'admin-swal-title', htmlContainer: 'admin-swal-text', actions: 'admin-swal-actions',
        confirmButton: 'admin-swal-btn admin-swal-danger', cancelButton: 'admin-swal-btn admin-swal-cancel',
      },
    });
    return result.isConfirmed;
  },
  /** Pide un texto; `validator` devuelve un mensaje de error o null. Resuelve null si se cancela. */
  prompt: async (title: string, options: { value?: string; placeholder?: string; label?: string; maxLength?: number; validator?: (value: string) => string | null } = {}) => {
    const result = await base.fire({
      title, input: 'text', inputLabel: options.label, inputValue: options.value ?? '', inputPlaceholder: options.placeholder,
      inputAttributes: { maxlength: String(options.maxLength ?? 255), autocomplete: 'off' },
      showCancelButton: true, confirmButtonText: 'Guardar', cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'admin-swal', title: 'admin-swal-title', htmlContainer: 'admin-swal-text', actions: 'admin-swal-actions',
        confirmButton: 'admin-swal-btn admin-swal-confirm', cancelButton: 'admin-swal-btn admin-swal-cancel', input: 'admin-swal-input', inputLabel: 'admin-swal-input-label',
      },
      inputValidator: value => options.validator?.(String(value ?? '')) ?? null,
    });
    return result.isConfirmed ? String(result.value ?? '').trim() : null;
  },
  /** Ejecuta una tarea mostrando un indicador de carga bloqueante. */
  loading: async <T>(title: string, task: () => Promise<T>): Promise<T> => {
    void base.fire({ title, allowOutsideClick: false, allowEscapeKey: false, showConfirmButton: false, didOpen: () => Swal.showLoading() });
    try {
      return await task();
    } finally {
      Swal.close();
    }
  },
};

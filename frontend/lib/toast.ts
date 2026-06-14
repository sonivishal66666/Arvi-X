// Lightweight toast utility — a thin wrapper over native browser notifications.
// Uses a simple DOM-based approach to avoid heavy toast library dependencies.

type ToastVariant = 'default' | 'success' | 'destructive'

interface ToastOptions {
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

let containerEl: HTMLDivElement | null = null

function getContainer(): HTMLDivElement {
  if (containerEl && document.body.contains(containerEl)) return containerEl
  containerEl = document.createElement('div')
  containerEl.id = 'arvis-toast-container'
  Object.assign(containerEl.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: '99999',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    pointerEvents: 'none',
  })
  document.body.appendChild(containerEl)
  return containerEl
}

const variantStyles: Record<ToastVariant, string> = {
  default: 'background:rgba(30,30,40,0.95);border:1px solid rgba(255,255,255,0.1);color:#fff',
  success: 'background:rgba(16,80,50,0.95);border:1px solid rgba(52,211,153,0.3);color:#6ee7b7',
  destructive: 'background:rgba(80,16,16,0.95);border:1px solid rgba(239,68,68,0.3);color:#fca5a5',
}

function showToast({ title, description, variant = 'default', duration = 4000 }: ToastOptions) {
  const container = getContainer()
  const el = document.createElement('div')
  el.style.cssText = `
    ${variantStyles[variant]};
    padding:14px 20px;border-radius:14px;backdrop-filter:blur(20px);
    font-family:Inter,system-ui,sans-serif;font-size:14px;
    box-shadow:0 8px 32px rgba(0,0,0,0.4);pointer-events:auto;
    transform:translateX(120%);transition:transform 0.35s cubic-bezier(0.22,1,0.36,1),opacity 0.35s;
    max-width:380px;min-width:260px;
  `
  el.innerHTML = `
    ${title ? `<div style="font-weight:600;margin-bottom:${description ? '4px' : '0'}">${title}</div>` : ''}
    ${description ? `<div style="opacity:0.8;font-size:13px">${description}</div>` : ''}
  `
  container.appendChild(el)

  requestAnimationFrame(() => {
    el.style.transform = 'translateX(0)'
  })

  setTimeout(() => {
    el.style.transform = 'translateX(120%)'
    el.style.opacity = '0'
    setTimeout(() => el.remove(), 400)
  }, duration)
}

/** Callable toast with convenience methods */
export function toast(opts: ToastOptions | string) {
  if (typeof opts === 'string') {
    showToast({ description: opts })
  } else {
    showToast(opts)
  }
}

toast.success = (message: string) => showToast({ title: '✓ Success', description: message, variant: 'success' })
toast.error = (message: string) => showToast({ title: 'Error', description: message, variant: 'destructive' })
toast.info = (message: string) => showToast({ description: message, variant: 'default' })

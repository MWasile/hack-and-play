import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'

export interface AccordionItemProps {
  title: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

// Accessible, animated accordion item. Independent (multiple can be open).
export function AccordionItem({ title, children, defaultOpen = true, className }: AccordionItemProps) {
  const [open, setOpen] = useState(!!defaultOpen)
  const [height, setHeight] = useState(0)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const btnId = useId()
  const panelId = `${btnId}-panel`

  // Measure content height and keep it in sync on resize/content changes
  useLayoutEffect(() => {
    const el = contentRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setHeight(el.scrollHeight + 20)
    })
    ro.observe(el)
    setHeight(el.scrollHeight + 20)
    return () => { ro.disconnect() }
  }, [])

  // In case children change significantly while closed, ensure latest height is captured
  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    setHeight(el.scrollHeight + 20)
  }, [children])

  return (
    <div className={["acc-item", className].filter(Boolean).join(' ')}>
      <button
        type="button"
        className={"acc-header" + (open ? " open" : "")}
        aria-expanded={open}
        aria-controls={panelId}
        id={btnId}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="acc-title">{title}</span>
        <span className="acc-chevron" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      <div
        role="region"
        id={panelId}
        aria-labelledby={btnId}
        className={"acc-panel" + (open ? " open" : "")}
        style={{ height: open ? height : 0 }}
      >
        <div ref={contentRef} className="acc-panel-inner">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function Accordion({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={["accordion", className].filter(Boolean).join(' ')}>{children}</div>
}


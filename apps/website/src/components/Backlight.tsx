import { useId } from 'react'

interface BacklightProps {
  blur?: number
  children?: React.ReactNode
  className?: string
}

export function Backlight({ blur = 20, children, className }: BacklightProps): React.JSX.Element {
  const id = useId()

  return (
    <div className={className}>
      <svg width="0" height="0" aria-hidden="true">
        <filter id={id} y="-50%" x="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blurred" />
          <feColorMatrix type="saturate" in="blurred" values="4" />
          <feComposite in="SourceGraphic" operator="over" />
        </filter>
      </svg>
      <div style={{ filter: `url(#${id})` }}>{children}</div>
    </div>
  )
}

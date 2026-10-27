import { CACHORRO_D, CACHORRO_VIEWBOX, PUPILAS } from './cachorro-path';

/** Desenho uma vez só no documento; cada cachorro da página usa `<use>`. */
export function CachorroDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <symbol id="cachorro-desenho" viewBox={CACHORRO_VIEWBOX}>
          <path d={CACHORRO_D} fill="currentColor" />
        </symbol>
      </defs>
    </svg>
  );
}

/** Cachorro do selo. Com `olhar`, as pupilas seguem o cursor (só com mouse). */
export function Cachorro({ className, olhar }: { className?: string; olhar?: boolean }) {
  return (
    <svg
      className={['cachorro', className].filter(Boolean).join(' ')}
      viewBox={CACHORRO_VIEWBOX}
      aria-hidden="true"
      focusable="false"
      data-olhar={olhar ? '' : undefined}
    >
      <use href="#cachorro-desenho" />
      <g className="pupilas">
        {PUPILAS.map((p) => (
          <circle key={p.cx} cx={p.cx} cy={p.cy} r={p.r} fill="currentColor" />
        ))}
      </g>
    </svg>
  );
}

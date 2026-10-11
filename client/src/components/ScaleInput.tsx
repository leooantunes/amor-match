import { useId } from 'react'
import { t } from '../content/texts'

interface Props {
  legend: string
  hint?: string
  value: number | undefined
  onChange: (v: number) => void
  name: string
}

/** Escala 1-5 acessível: radios nativos (setas do teclado funcionam). */
export function ScaleInput({ legend, hint, value, onChange, name }: Props) {
  const hintId = useId()
  return (
    <fieldset aria-describedby={hint ? hintId : undefined} className="mt-5">
      <legend className="mb-2 text-base font-semibold text-ink">{legend}</legend>
      {hint && (
        <p id={hintId} className="mb-3 text-sm text-ink-soft">
          {hint}
        </p>
      )}
      <div className="grid gap-2 sm:grid-cols-5">
        {t.quiz.scale.map((label, i) => {
          const v = i + 1
          const id = `${name}-${v}`
          return (
            <div key={v}>
              <input
                type="radio"
                id={id}
                name={name}
                value={v}
                checked={value === v}
                onChange={() => onChange(v)}
                className="peer sr-only"
              />
              <label
                htmlFor={id}
                className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-love-300 bg-white px-3 py-2 text-center text-sm font-medium text-ink transition-colors hover:bg-love-50 peer-checked:border-love-800 peer-checked:bg-love-800 peer-checked:text-white peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-love-800 sm:min-h-20 sm:flex-col sm:text-xs"
              >
                <span aria-hidden="true" className="text-lg font-bold">{v}</span>
                <span>
                  <span className="sm:hidden">{label}</span>
                  <span className="hidden sm:inline">{t.quiz.scaleShort[i]}</span>
                </span>
              </label>
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}

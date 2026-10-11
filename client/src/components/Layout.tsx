import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { t } from '../content/texts'
import { Heart } from './ui'

export function Layout() {
  const [darkTheme, setDarkTheme] = useState(
    () => ['romantic', 'coffee'].includes(window.localStorage.getItem('amor-match-theme') ?? ''),
  )

  useEffect(() => {
    if (darkTheme) {
      document.documentElement.dataset.theme = 'romantic'
      window.localStorage.setItem('amor-match-theme', 'romantic')
    } else {
      delete document.documentElement.dataset.theme
      window.localStorage.setItem('amor-match-theme', 'light')
    }
  }, [darkTheme])

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 pb-8 pt-4 sm:px-6">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-love-800"
      >
        {t.skipToContent}
      </a>
      <header className="flex items-center justify-between gap-3 py-4">
        <Link to="/" className="inline-flex items-center gap-2 font-display text-2xl font-bold text-love-800">
          <Heart className="h-7 w-7 animate-beat text-love-600" />
          {t.appName}
        </Link>
        <button
          type="button"
          aria-label={darkTheme ? 'Ativar tema claro' : 'Ativar tema romântico escuro'}
          aria-pressed={darkTheme}
          onClick={() => setDarkTheme((current) => !current)}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-love-300 bg-white text-love-800 shadow-sm transition-colors hover:bg-love-50"
        >
          {darkTheme ? (
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />
            </svg>
          )}
        </button>
      </header>
      <main id="main" className="flex-1 py-2">
        <Outlet />
      </main>
      <footer className="pt-8 text-center text-sm text-ink-soft">{t.footer}</footer>
    </div>
  )
}

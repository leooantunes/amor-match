import { Link, Outlet } from 'react-router-dom'
import { t } from '../content/texts'
import { Heart } from './ui'

export function Layout() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 pb-8 pt-4 sm:px-6">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-love-800"
      >
        {t.skipToContent}
      </a>
      <header className="py-4">
        <Link to="/" className="inline-flex items-center gap-2 font-display text-2xl font-bold text-love-800">
          <Heart className="h-7 w-7 animate-beat text-love-600" />
          {t.appName}
        </Link>
      </header>
      <main id="main" className="flex-1 py-2">
        <Outlet />
      </main>
      <footer className="pt-8 text-center text-sm text-ink-soft">{t.footer}</footer>
    </div>
  )
}

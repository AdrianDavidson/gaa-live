import { Outlet }           from 'react-router-dom'
import { useEffect }        from 'react'
import Header               from './Header'
import BottomNav            from './BottomNav'
import NotificationBanner   from '../notifications/NotificationBanner'
import { useAppStore }      from '../../store/appStore'
import { COUNTY_COLOURS }   from '../../utils/countyColours'

export default function Layout() {
  const { fontSize, darkMode, theme, favouriteCounty } = useAppStore()

  useEffect(() => {
    const html = document.documentElement

    // Font size
    html.classList.remove('font-large', 'font-xl')
    if (fontSize === 'large') html.classList.add('font-large')
    if (fontSize === 'xl')    html.classList.add('font-xl')

    // Dark mode
    html.classList.toggle('dark', darkMode)

    // Theme attribute — drives CSS variable blocks in index.css
    html.setAttribute('data-theme', theme ?? 'default')

    // County theme: inject the selected county's colours as CSS vars
    if (theme === 'county' && favouriteCounty) {
      const colours = COUNTY_COLOURS[favouriteCounty]
      if (colours) {
        html.style.setProperty('--county-primary',   colours.primary)
        html.style.setProperty('--county-secondary', colours.secondary)
      }
    } else {
      html.style.removeProperty('--county-primary')
      html.style.removeProperty('--county-secondary')
    }
  }, [fontSize, darkMode, theme, favouriteCounty])

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto">
      <Header />
      <NotificationBanner />
      <Outlet />
      <BottomNav />
    </div>
  )
}

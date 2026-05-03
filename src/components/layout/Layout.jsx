import { Outlet }           from 'react-router-dom'
import Header               from './Header'
import BottomNav            from './BottomNav'
import NotificationBanner   from '../notifications/NotificationBanner'
import { useAppStore }      from '../../store/appStore'
import { useEffect }        from 'react'

export default function Layout() {
  const { fontSize, darkMode } = useAppStore()

  useEffect(() => {
    const html = document.documentElement
    html.classList.remove('font-large', 'font-xl')
    if (fontSize === 'large')  html.classList.add('font-large')
    if (fontSize === 'xl')     html.classList.add('font-xl')
    html.classList.toggle('dark', darkMode)
  }, [fontSize, darkMode])

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto">
      <Header />
      <NotificationBanner />
      <Outlet />
      <BottomNav />
    </div>
  )
}

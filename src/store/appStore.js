import { create }  from 'zustand'
import { persist } from 'zustand/middleware'

export const useAppStore = create(
  persist(
    (set) => ({
      favouriteCounty:      null,
      fontSize:             'medium',
      darkMode:             false,
      notificationsEnabled: false,

      setFavouriteCounty:  (county) => set({ favouriteCounty: county }),
      setFontSize:         (size)   => set({ fontSize: size }),
      toggleDarkMode:      ()       => set((s) => ({ darkMode: !s.darkMode })),
      toggleNotifications: (val)    => set({ notificationsEnabled: val }),
    }),
    { name: 'gaa-app-settings' }
  )
)

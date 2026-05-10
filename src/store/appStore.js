import { create }  from 'zustand'
import { persist } from 'zustand/middleware'

export const useAppStore = create(
  persist(
    (set) => ({
      favouriteCounty:      null,
      fontSize:             'medium',
      darkMode:             false,
      theme:                'default',   // 'default' | 'county' | 'professional'
      notificationsEnabled: false,
      homeClubId:           null,
      followedClubs:        [],

      setFavouriteCounty:  (county) => set({ favouriteCounty: county }),
      setFontSize:         (size)   => set({ fontSize: size }),
      toggleDarkMode:      ()       => set((s) => ({ darkMode: !s.darkMode })),
      setTheme:            (t)      => set({ theme: t }),
      toggleNotifications: (val)    => set({ notificationsEnabled: val }),
      setHomeClub:         (id)     => set({ homeClubId: id }),
      setFollowedClubs:    (clubs)  => set({ followedClubs: clubs }),
    }),
    { name: 'gaa-app-settings' }
  )
)

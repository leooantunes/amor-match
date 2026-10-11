import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Identity {
  partnerId: string
  name: string
}

interface IdentityState {
  identities: Record<string, Identity>
  setIdentity: (code: string, identity: Identity) => void
  clearIdentity: (code: string) => void
}

/** Guarda, por sala, quem é "você" neste dispositivo. */
export const useIdentityStore = create<IdentityState>()(
  persist(
    (set) => ({
      identities: {},
      setIdentity: (code, identity) => set((s) => ({ identities: { ...s.identities, [code]: identity } })),
      clearIdentity: (code) =>
        set((s) => {
          const rest = { ...s.identities }
          delete rest[code]
          return { identities: rest }
        }),
    }),
    { name: 'amormatch-identities' },
  ),
)

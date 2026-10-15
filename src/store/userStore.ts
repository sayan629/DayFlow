import { create } from "zustand";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

interface UserStore {
  user: UserProfile | null;
  loading: boolean;
  initialized: boolean;

  setUser: (user: UserProfile) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  loading: true,
  initialized: false,

  setUser: (user) => {
    set({
      user,
      loading: false,
    });
  },

  clearUser: () => {
    set({
      user: null,
      loading: false,
    });
  },

  setLoading: (loading) => {
    set({ loading });
  },

  setInitialized: (initialized) => {
    set({ initialized });
  },
}));
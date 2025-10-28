import { create } from 'zustand';

export type UserRole = 'artist' | 'label' | 'admin';

export type ReleaseStatus = 'draft' | 'under_review' | 'approved' | 'distributed' | 'rejected';

export interface Release {
  id: string;
  trackTitle: string;
  primaryArtist: string;
  albumTitle?: string;
  albumType: 'single' | 'ep' | 'album';
  status: ReleaseStatus;
  audioFile?: File;
  artworkFile?: File;
  isrc?: string;
  upc?: string;
  composer?: string;
  lyricist?: string;
  producer?: string;
  featuringArtists?: string;
  primaryGenre?: string;
  secondaryGenre?: string;
  language?: string;
  releaseDate?: string;
  preOrderDate?: string;
  labelName?: string;
  copyrightYear?: string;
  isExplicit: boolean;
  territories?: string;
  lyrics?: string;
  createdAt: Date;
  updatedAt: Date;
  rejectionReason?: string;
}

interface AppState {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  } | null;
  releases: Release[];
  darkMode: boolean;
  setCurrentUser: (user: AppState['currentUser']) => void;
  addRelease: (release: Release) => void;
  updateRelease: (id: string, updates: Partial<Release>) => void;
  deleteRelease: (id: string) => void;
  toggleDarkMode: () => void;
}

export const useStore = create<AppState>((set) => ({
  currentUser: {
    id: '1',
    name: 'Demo Artist',
    email: 'artist@demo.com',
    role: 'artist',
  },
  releases: [],
  darkMode: false,
  setCurrentUser: (user) => set({ currentUser: user }),
  addRelease: (release) => set((state) => ({
    releases: [...state.releases, release]
  })),
  updateRelease: (id, updates) => set((state) => ({
    releases: state.releases.map((r) =>
      r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r
    ),
  })),
  deleteRelease: (id) => set((state) => ({
    releases: state.releases.filter((r) => r.id !== id),
  })),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
}));

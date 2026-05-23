import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type OnboardingStep = 1 | 2 | 3 | "done";

export type PropertyType = "" | "hotel" | "building" | "complex";

export type OrgData = {
  name: string;
  billingEmail: string;
  country: string;
};

export type PropertyData = {
  name: string;
  slug: string;
  type: PropertyType;
  city: string;
  description: string;
  photos: string[]; // data URLs (base64). May be empty after rehydration.
};

export type RoomsData = {
  typeName: string;
  adults: number;
  children: number;
  beds: string;
  pricePerNight: number;
  quantity: number;
};

type State = {
  step: OnboardingStep;
  org: OrgData;
  property: PropertyData;
  rooms: RoomsData;
  _hasHydrated: boolean;
};

type Actions = {
  setOrg: (patch: Partial<OrgData>) => void;
  setProperty: (patch: Partial<PropertyData>) => void;
  setRooms: (patch: Partial<RoomsData>) => void;
  addPhoto: (dataUrl: string) => void;
  removePhoto: (index: number) => void;
  goTo: (step: OnboardingStep) => void;
  next: () => void;
  back: () => void;
  reset: () => void;
  setHydrated: (v: boolean) => void;
};

const INITIAL: State = {
  step: 1,
  org: { name: "", billingEmail: "", country: "Colombia" },
  property: {
    name: "",
    slug: "",
    type: "hotel",
    city: "",
    description: "",
    photos: [],
  },
  rooms: {
    typeName: "",
    adults: 2,
    children: 0,
    beds: "",
    pricePerNight: 0,
    quantity: 1,
  },
  _hasHydrated: false,
};

function nextStep(s: OnboardingStep): OnboardingStep {
  if (s === 1) return 2;
  if (s === 2) return 3;
  if (s === 3) return "done";
  return "done";
}

function prevStep(s: OnboardingStep): OnboardingStep {
  if (s === 2) return 1;
  if (s === 3) return 2;
  if (s === "done") return 3;
  return 1;
}

export const useOnboardingStore = create<State & Actions>()(
  persist(
    (set) => ({
      ...INITIAL,
      setOrg: (patch) =>
        set((s) => ({ org: { ...s.org, ...patch } })),
      setProperty: (patch) =>
        set((s) => ({ property: { ...s.property, ...patch } })),
      setRooms: (patch) =>
        set((s) => ({ rooms: { ...s.rooms, ...patch } })),
      addPhoto: (dataUrl) =>
        set((s) => ({
          property: { ...s.property, photos: [...s.property.photos, dataUrl].slice(0, 5) },
        })),
      removePhoto: (index) =>
        set((s) => ({
          property: {
            ...s.property,
            photos: s.property.photos.filter((_, i) => i !== index),
          },
        })),
      goTo: (step) => set({ step }),
      next: () => set((s) => ({ step: nextStep(s.step) })),
      back: () => set((s) => ({ step: prevStep(s.step) })),
      reset: () => set({ ...INITIAL, _hasHydrated: true }),
      setHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: "eztadia-onboarding",
      storage: createJSONStorage(() => localStorage),
      // Photos are large; keep them out of localStorage to avoid quota issues.
      partialize: (state) => ({
        step: state.step,
        org: state.org,
        property: { ...state.property, photos: [] },
        rooms: state.rooms,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

/** Auto slug from a free text name. */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

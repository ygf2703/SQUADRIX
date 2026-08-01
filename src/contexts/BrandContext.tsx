import { createContext, useContext, useEffect, useState } from 'react';
import { clubService, defaultBrand, type ClubBrand } from '../services/clubService';

const BrandContext = createContext<{ brand: ClubBrand; refresh: () => Promise<void> }>({ brand: defaultBrand, refresh: async () => undefined });
export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [brand, setBrand] = useState(defaultBrand);
  const refresh = async () => { const next = await clubService.getBrand(); setBrand(next); document.documentElement.style.setProperty('--brand-primary', next.primary_color); document.documentElement.style.setProperty('--brand-secondary', next.secondary_color); };
  useEffect(() => { void refresh(); }, []);
  return <BrandContext.Provider value={{ brand, refresh }}>{children}</BrandContext.Provider>;
}
export const useBrand = () => useContext(BrandContext);

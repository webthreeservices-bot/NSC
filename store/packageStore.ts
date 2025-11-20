import { create } from 'zustand'

interface Package {
  id: string
  amount: number
  packageType: string
  status: string
  investmentDate: Date
  expiryDate: Date
  totalRoiPaid: number
  roiPaidCount: number
}

interface PackageState {
  packages: Package[]
  selectedPackage: Package | null
  setPackages: (packages: Package[]) => void
  setSelectedPackage: (pkg: Package | null) => void
  addPackage: (pkg: Package) => void
  updatePackage: (id: string, updates: Partial<Package>) => void
}

export const usePackageStore = create<PackageState>((set) => ({
  packages: [],
  selectedPackage: null,
  setPackages: (packages) => set({ packages }),
  setSelectedPackage: (pkg) => set({ selectedPackage: pkg }),
  addPackage: (pkg) => set((state) => ({ packages: [...state.packages, pkg] })),
  updatePackage: (id, updates) =>
    set((state) => ({
      packages: state.packages.map((pkg) =>
        pkg.id === id ? { ...pkg, ...updates } : pkg
      ),
    })),
}))

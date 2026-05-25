import { Brain, Ear, Footprints, HandHeart, type LucideIcon } from 'lucide-react'

const serviceIcons: Record<string, LucideIcon> = {
  soneterapi: Footprints,
  oreakupunktur: Ear,
  tankefeltterapi: Brain,
}

export function getServiceIcon(slug: string): LucideIcon {
  return serviceIcons[slug] ?? HandHeart
}

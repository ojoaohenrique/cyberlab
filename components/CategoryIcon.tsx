import {
  Archive,
  Bitcoin,
  Building2,
  Code,
  Droplets,
  Ghost,
  Globe,
  Image,
  Mail,
  Map,
  Network,
  Phone,
  Plane,
  ShieldAlert,
  Terminal,
  User,
  type LucideIcon,
} from "lucide-react";
import type { CategoryIcon as IconName } from "@/lib/catalog";

const ICONS: Record<IconName, LucideIcon> = {
  user: User,
  mail: Mail,
  globe: Globe,
  network: Network,
  phone: Phone,
  image: Image,
  map: Map,
  archive: Archive,
  leak: Droplets,
  code: Code,
  building: Building2,
  bitcoin: Bitcoin,
  plane: Plane,
  onion: Ghost,
  shield: ShieldAlert,
  terminal: Terminal,
};

export function CategoryIcon({ name, className }: { name: IconName; className?: string }) {
  const Icon = ICONS[name];
  return <Icon className={className} aria-hidden />;
}

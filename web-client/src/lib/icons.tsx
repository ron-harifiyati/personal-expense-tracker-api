import {
    Wallet,
    Landmark,
    Banknote,
    Smartphone,
    Briefcase,
    Laptop,
    Gift,
    Utensils,
    ShoppingCart,
    Car,
    Home,
    Zap,
    Film,
    Heart,
    ShoppingBag,
    Tag,
    CreditCard,
    PiggyBank,
    type LucideIcon,
} from 'lucide-react';

// Map the API's short icon identifiers to Lucide components.
const MAP: Record<string, LucideIcon> = {
    wallet: Wallet,
    bank: Landmark,
    cash: Banknote,
    phone: Smartphone,
    briefcase: Briefcase,
    laptop: Laptop,
    gift: Gift,
    utensils: Utensils,
    cart: ShoppingCart,
    car: Car,
    home: Home,
    bolt: Zap,
    film: Film,
    heart: Heart,
    bag: ShoppingBag,
    tag: Tag,
    card: CreditCard,
    piggy: PiggyBank,
};

/** All selectable icon keys, for pickers. */
export const ICON_KEYS = Object.keys(MAP);

export function iconFor(name?: string): LucideIcon {
    return (name && MAP[name]) || Tag;
}

export function IconGlyph({ name, className }: { name?: string; className?: string }) {
    const Cmp = iconFor(name);
    return <Cmp className={className} />;
}

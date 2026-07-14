import React from 'react';
import * as Lucide from 'lucide-react';

interface DynamicIconProps {
  name: string;
  className?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className }) => {
  // Fallback map for common category and system icons
  const iconMap: Record<string, React.ComponentType<any>> = {
    Laptop: Lucide.Laptop,
    Shirt: Lucide.Shirt,
    Home: Lucide.Home,
    Sparkles: Lucide.Sparkles,
    Flame: Lucide.Flame,
    Smartphone: Lucide.Smartphone,
    User: Lucide.User,
    Settings: Lucide.Settings,
    ShoppingBag: Lucide.ShoppingBag,
    Heart: Lucide.Heart,
    Search: Lucide.Search,
    ChevronRight: Lucide.ChevronRight,
    ChevronLeft: Lucide.ChevronLeft,
    Clock: Lucide.Clock,
    Truck: Lucide.Truck,
    ShieldCheck: Lucide.ShieldCheck,
    RotateCcw: Lucide.RotateCcw,
    Headphones: Lucide.Headphones,
    Sliders: Lucide.Sliders,
    Trash2: Lucide.Trash2,
    Edit: Lucide.Edit,
    Plus: Lucide.Plus,
    X: Lucide.X,
    Filter: Lucide.Filter,
    Star: Lucide.Star,
    Menu: Lucide.Menu,
    LogOut: Lucide.LogOut,
    Check: Lucide.Check,
    ArrowRight: Lucide.ArrowRight,
    MapPin: Lucide.MapPin,
    CreditCard: Lucide.CreditCard,
    DollarSign: Lucide.DollarSign,
    Users: Lucide.Users,
    ClipboardList: Lucide.ClipboardList,
    Percent: Lucide.Percent,
    SlidersHorizontal: Lucide.SlidersHorizontal,
    UploadCloud: Lucide.UploadCloud,
    FileText: Lucide.FileText,
    Grid: Lucide.Grid,
    ListFilter: Lucide.ListFilter,
    Activity: Lucide.Activity,
    Lock: Lucide.Lock,
    Eye: Lucide.Eye,
    MessageSquare: Lucide.MessageSquare,
    TrendingUp: Lucide.TrendingUp,
    Store: Lucide.Store,
    Calendar: Lucide.Calendar,
    Milk: Lucide.Milk,
    Fish: Lucide.Fish,
    Apple: Lucide.Apple,
    Beef: Lucide.Beef,
    Leaf: Lucide.Leaf,
    Bot: Lucide.Bot,
    Brain: Lucide.Brain,
    Code: Lucide.Code,
    Terminal: Lucide.Terminal,
    Video: Lucide.Video,
    Mic: Lucide.Mic,
    Cpu: Lucide.Cpu,
    Zap: Lucide.Zap,
    Brush: Lucide.Brush,
    Wand2: Lucide.Wand2,
    Image: Lucide.Image
  };

  const IconComponent = iconMap[name] || Lucide.HelpCircle;
  return <IconComponent className={className} />;
};

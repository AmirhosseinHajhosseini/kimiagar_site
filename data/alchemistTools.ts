export type AlchemistTool = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: string;
  active: boolean;
};

export const alchemistTools: AlchemistTool[] = [
  {
    id: "molar-mass",
    title: "محاسبه‌گر جرم مولی",
    description: "محاسبه جرم مولی ترکیبات شیمیایی با پشتیبانی از فرمول‌های پیچیده.",
    href: "/alchemist/molar-mass",
    icon: "⚖️",
    active: true,
  },
  {
    id: "reaction-balancer",
    title: "موازنه‌گر واکنش‌ها",
    description: "موازنه خودکار واکنش‌های شیمیایی.",
    href: "/alchemist/reaction-balancer",
    icon: "🧪",
    active: false,
  },
  {
    id: "solution-calculator",
    title: "محاسبه‌گر غلظت محلول",
    description: "محاسبه مولاریته، نرمالیته و رقیق‌سازی محلول‌ها.",
    href: "/alchemist/solution-calculator",
    icon: "💧",
    active: false,
  },
  {
    id: "unit-converter",
    title: "تبدیل واحدهای شیمی",
    description: "تبدیل بین mol، g، L و سایر واحدها.",
    href: "/alchemist/unit-converter",
    icon: "🔁",
    active: false,
  },
];

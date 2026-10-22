import type { BudgetResponse } from "./schemas";

export interface PresetScenario {
  id: string;
  title: string;
  subtitle: string;
  badgeText: string;
  rawInput: string;
  fallbackResponse: BudgetResponse;
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: "post-payday-squeeze",
    title: "Post-Payday Squeeze",
    subtitle: "$2,600 income · Tight margin pushed into -$85 deficit",
    badgeText: "$2,600/mo",
    rawInput:
      "I take home $2,600 a month after taxes. Fixed bills: rent and building fee is $1,150, utilities and fiber internet $185, phone and transit pass $145, and student loan minimum $120. Variable necessities: weekly groceries run $340, late-night rideshares and gas $120, plus $75 on pharmacy and household basics. Lately I've been leaking cash on weekend dining and takeout $240, convenience store snacks and coffee runs $115, impulse online shopping $130, and $65 in streaming and app subscriptions.",
    fallbackResponse: {
      monthlyIncome: 2600,
      currencySymbol: "$",
      parserSource: "fallback",
      items: [
        {
          id: "pps-rent",
          label: "Rent & Building Fee",
          category: "essential",
          baselineAmount: 1150,
          aiTip: "Fixed housing obligation locked for monthly baseline.",
        },
        {
          id: "pps-utilities",
          label: "Utilities & Fiber Internet",
          category: "essential",
          baselineAmount: 185,
          aiTip: "Fixed utility and connectivity baseline.",
        },
        {
          id: "pps-transit",
          label: "Phone & Transit Pass",
          category: "essential",
          baselineAmount: 145,
          aiTip: "Essential commuter and mobile plan.",
        },
        {
          id: "pps-loan",
          label: "Student Loan Minimum",
          category: "essential",
          baselineAmount: 120,
          aiTip: "Required minimum debt servicing payment.",
        },
        {
          id: "pps-groceries",
          label: "Weekly Groceries & Market",
          category: "flexible",
          baselineAmount: 340,
          aiTip: "Batch-cooking 2 dinners a week and buying store-brand staples can trim 15–20%.",
        },
        {
          id: "pps-rideshares",
          label: "Late-Night Rideshares & Gas",
          category: "flexible",
          baselineAmount: 120,
          aiTip: "Swapping 3 late-night rideshares for transit saves ~$45–$60/mo since you already pay for a transit pass.",
        },
        {
          id: "pps-household",
          label: "Household & Pharmacy Basics",
          category: "flexible",
          baselineAmount: 75,
          aiTip: "Restock non-perishables monthly instead of convenience store markups.",
        },
        {
          id: "pps-dining",
          label: "Weekend Dining & Takeout",
          category: "want",
          baselineAmount: 240,
          aiTip: "Capping takeout to once per weekend immediately recovers $100–$120/mo.",
        },
        {
          id: "pps-Impulse",
          label: "Impulse Online Shopping",
          category: "want",
          baselineAmount: 130,
          aiTip: "Use a 48-hour cart cooling rule to cut impulse checkouts in half.",
        },
        {
          id: "pps-coffee",
          label: "Convenience Snacks & Coffee Runs",
          category: "want",
          baselineAmount: 115,
          aiTip: "Brewing weekday coffee at home and packing a snack saves ~$70/mo.",
        },
        {
          id: "pps-subs",
          label: "Streaming & App Subscriptions",
          category: "want",
          baselineAmount: 65,
          aiTip: "Rotate down to 1 active video subscription at a time to save $35/mo.",
        },
      ],
    },
  },
  {
    id: "freelancer-month",
    title: "Freelancer Month",
    subtitle: "$4,200 client income · Eroded by cafe runs & SaaS creep",
    badgeText: "$4,200/mo",
    rawInput:
      "Pulled in $4,200 in freelance client retainers this month. Fixed essentials: studio rent and coworking desk $1,550, health and dental insurance $380, fiber internet and phone $130, and $100 set aside for accounting software. Flexible living costs: groceries and meal prep $460, client travel and rideshares $185, and office/household supplies $95. Discretionary leaks: $360 on late-night delivery and takeout during deadlines, $340 on desk and camera gear upgrades, $240 on unused SaaS and AI subscriptions, and $210 on daily specialty cafe runs.",
    fallbackResponse: {
      monthlyIncome: 4200,
      currencySymbol: "$",
      parserSource: "fallback",
      items: [
        {
          id: "fl-rent",
          label: "Studio Rent & Coworking",
          category: "essential",
          baselineAmount: 1550,
          aiTip: "Fixed studio and workspace lease commitment.",
        },
        {
          id: "fl-insurance",
          label: "Health & Dental Insurance",
          category: "essential",
          baselineAmount: 380,
          aiTip: "Essential monthly healthcare coverage premium.",
        },
        {
          id: "fl-internet",
          label: "Fiber Internet & Cloud Phone",
          category: "essential",
          baselineAmount: 130,
          aiTip: "Core business connectivity utility.",
        },
        {
          id: "fl-accounting",
          label: "Accounting & Bookkeeping Baseline",
          category: "essential",
          baselineAmount: 100,
          aiTip: "Fixed compliance and invoicing baseline.",
        },
        {
          id: "fl-groceries",
          label: "Groceries & Meal Prep",
          category: "flexible",
          baselineAmount: 460,
          aiTip: "Stocking ready-to-heat freezer meals prevents expensive deadline delivery orders.",
        },
        {
          id: "fl-travel",
          label: "Client Travel & Rideshares",
          category: "flexible",
          baselineAmount: 185,
          aiTip: "Batching in-person client meetings into 2 days a week cuts transit spend by 30%.",
        },
        {
          id: "fl-supplies",
          label: "Office & Household Supplies",
          category: "flexible",
          baselineAmount: 95,
          aiTip: "Consolidate consumables into a single monthly bulk order.",
        },
        {
          id: "fl-takeout",
          label: "Late-Night Delivery & Takeout",
          category: "want",
          baselineAmount: 360,
          aiTip: "Replacing delivery apps with local pickup or freezer backups saves $180+/mo in fees and tips.",
        },
        {
          id: "fl-gear",
          label: "Desk & Camera Gear Upgrades",
          category: "want",
          baselineAmount: 340,
          aiTip: "Pause non-billable hardware upgrades for 60 days to bank $340/mo straight to savings.",
        },
        {
          id: "fl-saas",
          label: "Unused SaaS & AI Subscriptions",
          category: "want",
          baselineAmount: 240,
          aiTip: "Audit recurring seats and cancel overlapping tools not used in the last 14 days.",
        },
        {
          id: "fl-cafe",
          label: "Daily Specialty Cafe Runs",
          category: "want",
          baselineAmount: 210,
          aiTip: "Limiting cafe work sessions to twice a week cuts $120/mo without losing the routine.",
        },
      ],
    },
  },
  {
    id: "shop-side-hustle",
    title: "Shop & Side-Hustle",
    subtitle: "$3,550 combined income · Supply restocks & PC upgrades",
    badgeText: "$3,550/mo",
    rawInput:
      "My day job pays $2,900 net and my weekend 3D-printing side-hustle brought in $650 ($3,550 total income). Fixed bills: apartment rent $1,320, electric, water, and internet $210, plus auto insurance and car payment $280. Flexible living: groceries and bulk club runs $480, side-hustle filament and packaging restock $240, gas and commute rideshares $160, and household/pet supplies $80. Wants: spent $420 on a PC GPU and mechanical keyboard upgrade, $265 on weekend burgers, drinks, and takeout, $95 on gaming and streaming subscriptions, and $80 on vending snacks and energy drinks.",
    fallbackResponse: {
      monthlyIncome: 3550,
      currencySymbol: "$",
      parserSource: "fallback",
      items: [
        {
          id: "ssh-rent",
          label: "Apartment Rent",
          category: "essential",
          baselineAmount: 1320,
          aiTip: "Fixed monthly housing lease.",
        },
        {
          id: "ssh-auto",
          label: "Auto Insurance & Car Payment",
          category: "essential",
          baselineAmount: 280,
          aiTip: "Fixed vehicle financing and coverage.",
        },
        {
          id: "ssh-utilities",
          label: "Electric, Water & Internet",
          category: "essential",
          baselineAmount: 210,
          aiTip: "Essential home utilities and broadband.",
        },
        {
          id: "ssh-groceries",
          label: "Groceries & Bulk Club Runs",
          category: "flexible",
          baselineAmount: 480,
          aiTip: "Stick to a strict warehouse shopping list to avoid $80+ in bulk impulse add-ons.",
        },
        {
          id: "ssh-filament",
          label: "Side-Hustle Filament & Packaging",
          category: "flexible",
          baselineAmount: 240,
          aiTip: "Order spools only against confirmed customer orders to trim idle inventory spend by 25%.",
        },
        {
          id: "ssh-gas",
          label: "Gas & Commute Rideshares",
          category: "flexible",
          baselineAmount: 160,
          aiTip: "Combining shipping drop-offs with your regular commute saves ~$35/mo in fuel.",
        },
        {
          id: "ssh-pet",
          label: "Household & Pet Supplies",
          category: "flexible",
          baselineAmount: 80,
          aiTip: "Auto-ship pet food for a 10–15% recurring discount.",
        },
        {
          id: "ssh-pc",
          label: "PC GPU & Keyboard Upgrade",
          category: "want",
          baselineAmount: 420,
          aiTip: "Fund hardware upgrades strictly from next month's side-hustle surplus rather than base cashflow.",
        },
        {
          id: "ssh-dining",
          label: "Weekend Burgers, Drinks & Takeout",
          category: "want",
          baselineAmount: 265,
          aiTip: "Hosting one weekend hangout at home instead of bar tabs saves ~$110/mo.",
        },
        {
          id: "ssh-gaming",
          label: "Gaming & Streaming Subscriptions",
          category: "want",
          baselineAmount: 95,
          aiTip: "Pause dormant game passes and bundle music streaming to save $40/mo.",
        },
        {
          id: "ssh-snacks",
          label: "Vending Snacks & Energy Drinks",
          category: "want",
          baselineAmount: 80,
          aiTip: "Buying a 24-pack of energy drinks at the grocery store cuts vending machine costs by 65%.",
        },
      ],
    },
  },
];

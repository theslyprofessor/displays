export interface BrandConfig {
  productName: string;
  slug: string;
  macBinaryName: string;
  winBinaryName: string;
  cliCommand: string;
  tagline: string;
  shortHook: string;
  price: string;
  priceIndividual: string;
  priceTeam: string;
  websiteUrl: string;
  url: string;
  parentBrand: string;
  socialHandle: string;
}

export const DEFAULT_BRAND: BrandConfig = {
  productName: "ScreenStage",
  slug: "screenstage",
  macBinaryName: "Displays.app",
  winBinaryName: "ScreenStage.exe",
  cliCommand: "displays",
  tagline: "Every Room Remembers Every Screen.",
  shortHook: "Why does your laptop forget which screen is your Desk and which is your TV?",
  price: "$19",
  priceIndividual: "$19",
  priceTeam: "$199",
  websiteUrl: "buildforwardtech.com/screenstage",
  url: "buildforwardtech.com/screenstage",
  parentBrand: "MusicMind.biz × Build Forward Tech",
  socialHandle: "@screenstageapp",
};

export const BRAND = DEFAULT_BRAND;

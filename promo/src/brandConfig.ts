export interface BrandConfig {
  productName: string;
  macBinaryName: string;
  winBinaryName: string;
  cliCommand: string;
  tagline: string;
  shortHook: string;
  price: string;
  websiteUrl: string;
  parentBrand: string;
  socialHandle: string;
}

export const DEFAULT_BRAND: BrandConfig = {
  productName: "Displays",
  macBinaryName: "Displays.app",
  winBinaryName: "Displays.exe",
  cliCommand: "displays",
  tagline: "Every Room Remembers Every Screen.",
  shortHook: "Why does your laptop forget which screen is your Desk and which is your TV?",
  price: "$19",
  websiteUrl: "buildforwardtech.com/displays",
  parentBrand: "MusicMind.biz × Build Forward Tech",
  socialHandle: "@musicmind.biz",
};

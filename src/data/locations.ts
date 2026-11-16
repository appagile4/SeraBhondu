export interface CityLocation {
  id: string;
  name: string;
  state: string;
  popular?: boolean;
}

export const POPULAR_CITIES: CityLocation[] = [
  { id: "all-bangladesh", name: "All Bangladesh", state: "Bangladesh", popular: true },
  { id: "dhaka", name: "Dhaka", state: "Dhaka Division", popular: true },
  { id: "chattogram", name: "Chattogram", state: "Chattogram Division", popular: true },
  { id: "sylhet", name: "Sylhet", state: "Sylhet Division", popular: true },
  { id: "rajshahi", name: "Rajshahi", state: "Rajshahi Division", popular: true },
  { id: "khulna", name: "Khulna", state: "Khulna Division", popular: true },
  { id: "barishal", name: "Barishal", state: "Barishal Division", popular: true },
  { id: "rangpur", name: "Rangpur", state: "Rangpur Division", popular: true },
  { id: "mymensingh", name: "Mymensingh", state: "Mymensingh Division", popular: true },
  { id: "gazipur", name: "Gazipur", state: "Dhaka Division", popular: true },
  { id: "narayanganj", name: "Narayanganj", state: "Dhaka Division", popular: true },
  { id: "cumilla", name: "Cumilla", state: "Chattogram Division", popular: true },
  { id: "bogura", name: "Bogura", state: "Rajshahi Division", popular: true },
  { id: "coxsbazar", name: "Cox's Bazar", state: "Chattogram Division", popular: true },
  { id: "tangail", name: "Tangail", state: "Dhaka Division", popular: false },
  { id: "faridpur", name: "Faridpur", state: "Dhaka Division", popular: false },
  { id: "jashore", name: "Jashore", state: "Khulna Division", popular: false },
  { id: "kushtia", name: "Kushtia", state: "Khulna Division", popular: false },
  { id: "dinajpur", name: "Dinajpur", state: "Rangpur Division", popular: false },
  { id: "feni", name: "Feni", state: "Chattogram Division", popular: false },
  { id: "noakhali", name: "Noakhali", state: "Chattogram Division", popular: false },
  { id: "brahmanbaria", name: "Brahmanbaria", state: "Chattogram Division", popular: false },
  { id: "pabna", name: "Pabna", state: "Rajshahi Division", popular: false },
  { id: "sirajganj", name: "Sirajganj", state: "Rajshahi Division", popular: false },
  { id: "moulvibazar", name: "Moulvibazar", state: "Sylhet Division", popular: false },
  { id: "habiganj", name: "Habiganj", state: "Sylhet Division", popular: false },
  { id: "jamalpur", name: "Jamalpur", state: "Mymensingh Division", popular: false },
];

export const BANGLADESH_DIVISIONS: string[] = [
  "Dhaka Division",
  "Chattogram Division",
  "Rajshahi Division",
  "Khulna Division",
  "Barishal Division",
  "Sylhet Division",
  "Rangpur Division",
  "Mymensingh Division",
];

// Alias for existing imports
export const INDIAN_STATES: string[] = BANGLADESH_DIVISIONS;

export const BANGLADESH_DIVISIONS_BN: Record<string, string> = {
  "Dhaka Division": "ঢাকা বিভাগ",
  "Chattogram Division": "চট্টগ্রাম বিভাগ",
  "Rajshahi Division": "রাজশাহী বিভাগ",
  "Khulna Division": "খুলনা বিভাগ",
  "Barishal Division": "বরিশাল বিভাগ",
  "Sylhet Division": "সিলেট বিভাগ",
  "Rangpur Division": "রংপুর বিভাগ",
  "Mymensingh Division": "ময়মনসিংহ বিভাগ",
};

export const BANGLADESH_CITIES_BN: Record<string, string> = {
  "Dhaka": "ঢাকা",
  "Chattogram": "চট্টগ্রাম",
  "Sylhet": "সিলেট",
  "Rajshahi": "রাজশাহী",
  "Khulna": "খুলনা",
  "Barishal": "বরিশাল",
  "Rangpur": "রংপুর",
  "Mymensingh": "ময়মনসিংহ",
  "Gazipur": "গাজীপুর",
  "Narayanganj": "নারায়ণগঞ্জ",
  "Cumilla": "কুমিল্লা",
  "Bogura": "বগুড়া",
  "Cox's Bazar": "কক্সবাজার",
  "Tangail": "টাঙ্গাইল",
  "Faridpur": "ফরিদপুর",
  "Jashore": "যশোর",
  "Kushtia": "কুষ্টিয়া",
  "Dinajpur": "দিনাজপুর",
  "Feni": "ফেনী",
  "Noakhali": "নোয়াখালী",
  "Brahmanbaria": "ব্রাহ্মণবাড়িয়া",
  "Pabna": "পাবনা",
  "Sirajganj": "সিরাজগঞ্জ",
  "Moulvibazar": "মৌলভীবাজার",
  "Habiganj": "হবিগঞ্জ",
  "Jamalpur": "জামালপুর",
};

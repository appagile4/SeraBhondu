export interface CityLocation {
  id: string;
  name: string;
  state: string;
  nameBn?: string;
  popular?: boolean;
}

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

export const POPULAR_CITIES: CityLocation[] = [
  { id: "all-bangladesh", name: "All Bangladesh", state: "Bangladesh", nameBn: "সমগ্র বাংলাদেশ", popular: true },
  { id: "dhaka", name: "Dhaka", state: "Dhaka Division", nameBn: "ঢাকা", popular: true },
  { id: "chattogram", name: "Chattogram", state: "Chattogram Division", nameBn: "চট্টগ্রাম", popular: true },
  { id: "sylhet", name: "Sylhet", state: "Sylhet Division", nameBn: "সিলেট", popular: true },
  { id: "rajshahi", name: "Rajshahi", state: "Rajshahi Division", nameBn: "রাজশাহী", popular: true },
  { id: "khulna", name: "Khulna", state: "Khulna Division", nameBn: "খুলনা", popular: true },
  { id: "barishal", name: "Barishal", state: "Barishal Division", nameBn: "বরিশাল", popular: true },
  { id: "rangpur", name: "Rangpur", state: "Rangpur Division", nameBn: "রংপুর", popular: true },
  { id: "mymensingh", name: "Mymensingh", state: "Mymensingh Division", nameBn: "ময়মনসিংহ", popular: true },
  { id: "gazipur", name: "Gazipur", state: "Dhaka Division", nameBn: "গাজীপুর", popular: true },
  { id: "narayanganj", name: "Narayanganj", state: "Dhaka Division", nameBn: "নারায়ণগঞ্জ", popular: true },
  { id: "cumilla", name: "Cumilla", state: "Chattogram Division", nameBn: "কুমিল্লা", popular: true },
  { id: "bogura", name: "Bogura", state: "Rajshahi Division", nameBn: "বগুড়া", popular: true },
  { id: "coxsbazar", name: "Cox's Bazar", state: "Chattogram Division", nameBn: "কক্সবাজার", popular: true },
  { id: "tangail", name: "Tangail", state: "Dhaka Division", nameBn: "টাঙ্গাইল", popular: false },
  { id: "faridpur", name: "Faridpur", state: "Dhaka Division", nameBn: "ফরিদপুর", popular: false },
  { id: "jashore", name: "Jashore", state: "Khulna Division", nameBn: "যশোর", popular: false },
  { id: "kushtia", name: "Kushtia", state: "Khulna Division", nameBn: "কুষ্টিয়া", popular: false },
  { id: "dinajpur", name: "Dinajpur", state: "Rangpur Division", nameBn: "দিনাজপুর", popular: false },
  { id: "feni", name: "Feni", state: "Chattogram Division", nameBn: "ফেনী", popular: false },
  { id: "noakhali", name: "Noakhali", state: "Chattogram Division", nameBn: "নোয়াখালী", popular: false },
  { id: "brahmanbaria", name: "Brahmanbaria", state: "Chattogram Division", nameBn: "ব্রাহ্মণবাড়িয়া", popular: false },
  { id: "pabna", name: "Pabna", state: "Rajshahi Division", nameBn: "পাবনা", popular: false },
  { id: "sirajganj", name: "Sirajganj", state: "Rajshahi Division", nameBn: "সিরাজগঞ্জ", popular: false },
  { id: "moulvibazar", name: "Moulvibazar", state: "Sylhet Division", nameBn: "মৌলভীবাজার", popular: false },
  { id: "habiganj", name: "Habiganj", state: "Sylhet Division", nameBn: "হবিগঞ্জ", popular: false },
  { id: "jamalpur", name: "Jamalpur", state: "Mymensingh Division", nameBn: "জামালপুর", popular: false },
];

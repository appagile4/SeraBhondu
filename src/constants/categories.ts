export interface SubCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  nameBn?: string;
  slug: string;
  icon: string; // vector icon fallback
  image: any;  // require asset
  description: string;
  subCategories: SubCategory[];
}

export const CATEGORIES: Category[] = [
  {
    id: "cars",
    name: "Cars",
    nameBn: "গাড়ি",
    slug: "cars",
    icon: "car-outline",
    image: require("../../assets/images/categories/cars.png"),
    description: "Buy and sell verified used cars, luxury vehicles, and hatchbacks across Bangladesh.",
    subCategories: [
      { id: "cars-all", name: "All Cars", slug: "all-cars" },
      { id: "sedans", name: "Sedans", slug: "sedans" },
      { id: "suvs", name: "SUVs & 4x4", slug: "suvs" },
      { id: "hatchbacks", name: "Hatchbacks", slug: "hatchbacks" },
      { id: "hybrid-electric", name: "Hybrid & Electric Cars", slug: "hybrid-electric" },
      { id: "car-parts", name: "Car Parts & Accessories", slug: "car-parts" },
    ],
  },
  {
    id: "bikes",
    name: "Bikes & Scooters",
    nameBn: "বাইক ও স্কুটার",
    slug: "bikes",
    icon: "bicycle-outline",
    image: require("../../assets/images/categories/bikes.png"),
    description: "Explore sportbikes, commuter motorcycles, electric scooters, and bicycles in Bangladesh.",
    subCategories: [
      { id: "motorcycles", name: "Motorcycles", slug: "motorcycles" },
      { id: "scooters", name: "Scooters", slug: "scooters" },
      { id: "electric-bikes", name: "Electric Bikes & Scooters", slug: "electric-bikes" },
      { id: "bicycles", name: "Bicycles", slug: "bicycles" },
      { id: "bike-accessories", name: "Helmets & Bike Accessories", slug: "bike-accessories" },
    ],
  },
  {
    id: "properties",
    name: "Properties",
    nameBn: "প্রপার্টি ও ফ্ল্যাট",
    slug: "properties",
    icon: "home-outline",
    image: require("../../assets/images/categories/properties.png"),
    description: "Houses, apartments, commercial shops, and residential plots for sale and rent in Bangladesh.",
    subCategories: [
      { id: "apartments-sale", name: "Apartments & Flats for Sale", slug: "apartments-sale" },
      { id: "apartments-rent", name: "Apartments & Flats for Rent", slug: "apartments-rent" },
      { id: "lands-plots", name: "Plots & Land", slug: "lands-plots" },
      { id: "commercial-properties", name: "Commercial Space & Offices", slug: "commercial-properties" },
      { id: "room-sublet", name: "Rooms & Sublets", slug: "room-sublet" },
    ],
  },
  {
    id: "electronics",
    name: "Electronics & Appliances",
    nameBn: "ইলেকট্রনিক্স",
    slug: "electronics",
    icon: "tv-outline",
    image: require("../../assets/images/categories/electronics.png"),
    description: "Smart TVs, laptops, cameras, home appliances, refrigerators, and sound systems.",
    subCategories: [
      { id: "laptops-computers", name: "Laptops & Desktop Computers", slug: "laptops-computers" },
      { id: "tvs-audio", name: "Smart TVs & Home Theaters", slug: "tvs-audio" },
      { id: "cameras", name: "Cameras & Lenses", slug: "cameras" },
      { id: "home-appliances", name: "ACs, Fridges & Washing Machines", slug: "home-appliances" },
      { id: "computer-accessories", name: "Computer Accessories", slug: "computer-accessories" },
    ],
  },
  {
    id: "mobiles",
    name: "Mobiles & Tablets",
    nameBn: "মোবাইল ও ট্যাবলেট",
    slug: "mobiles",
    icon: "phone-portrait-outline",
    image: require("../../assets/images/categories/mobiles.png"),
    description: "iPhones, Samsung, Xiaomi, smartwatches, iPads, and genuine mobile accessories.",
    subCategories: [
      { id: "smartphones", name: "Smartphones", slug: "smartphones" },
      { id: "feature-phones", name: "Feature Phones", slug: "feature-phones" },
      { id: "tablets", name: "Tablets & iPads", slug: "tablets" },
      { id: "smartwatches", name: "Smartwatches & Wearables", slug: "smartwatches" },
      { id: "mobile-accessories", name: "Cases, Chargers & Powerbanks", slug: "mobile-accessories" },
    ],
  },
  {
    id: "commercial-vehicles",
    name: "Commercial Vehicles",
    nameBn: "বাণিজ্যিক যানবাহন",
    slug: "commercial-vehicles",
    icon: "bus-outline",
    image: require("../../assets/images/categories/commercial-vehicles.png"),
    description: "Trucks, pickups, commercial tempos, buses, tractors, and spare parts across Bangladesh.",
    subCategories: [
      { id: "pickups-trucks", name: "Pickups & Trucks", slug: "pickups-trucks" },
      { id: "cng-auto", name: "CNG & Auto Rickshaws", slug: "cng-auto" },
      { id: "tractors", name: "Tractors & Heavy Machinery", slug: "tractors" },
      { id: "commercial-spares", name: "Commercial Vehicle Spares", slug: "commercial-spares" },
    ],
  },
  {
    id: "jobs",
    name: "Jobs & Careers",
    nameBn: "চাকরি",
    slug: "jobs",
    icon: "briefcase-outline",
    image: require("../../assets/images/categories/jobs.png"),
    description: "Find full-time, part-time, remote IT, sales, driver, and executive jobs in Bangladesh.",
    subCategories: [
      { id: "it-software", name: "IT & Software Jobs", slug: "it-software" },
      { id: "marketing-sales", name: "Marketing & Sales", slug: "marketing-sales" },
      { id: "accounting-finance", name: "Accounting & Finance", slug: "accounting-finance" },
      { id: "driver-delivery", name: "Driver & Delivery Riders", slug: "driver-delivery" },
      { id: "customer-service", name: "Customer Support & Call Center", slug: "customer-service" },
    ],
  },
  {
    id: "furniture",
    name: "Furniture & Decor",
    nameBn: "আসবাবপত্র",
    slug: "furniture",
    icon: "bed-outline",
    image: require("../../assets/images/categories/furniture.png"),
    description: "Solid wood beds, sofa sets, wardrobes, dining tables, and office chairs.",
    subCategories: [
      { id: "sofas-living", name: "Sofas & Living Room", slug: "sofas-living" },
      { id: "beds-wardrobes", name: "Beds, Mattresses & Wardrobes", slug: "beds-wardrobes" },
      { id: "dining-tables", name: "Dining Tables & Chairs", slug: "dining-tables" },
      { id: "office-furniture", name: "Office Furniture & Desks", slug: "office-furniture" },
      { id: "home-decor", name: "Lighting & Home Decor", slug: "home-decor" },
    ],
  },
  {
    id: "fashion",
    name: "Fashion & Beauty",
    nameBn: "ফ্যাশন ও রূপচর্চা",
    slug: "fashion",
    icon: "shirt-outline",
    image: require("../../assets/images/categories/fashion.png"),
    description: "Men and women clothing, panjabis, sarees, sneakers, jewelry, and luxury watches.",
    subCategories: [
      { id: "mens-fashion", name: "Men's Clothing & Footwear", slug: "mens-fashion" },
      { id: "womens-fashion", name: "Women's Sarees & Salwar Kameez", slug: "womens-fashion" },
      { id: "watches-jewelry", name: "Watches, Jewelry & Bags", slug: "watches-jewelry" },
      { id: "perfumes-cosmetics", name: "Fragrances & Cosmetics", slug: "perfumes-cosmetics" },
    ],
  },
  {
    id: "pets",
    name: "Pets & Animals",
    nameBn: "পোষা প্রাণী",
    slug: "pets",
    icon: "paw-outline",
    image: require("../../assets/images/categories/pets.png"),
    description: "Pet cats, dogs, aquarium fish, bird cages, and premium pet food accessories.",
    subCategories: [
      { id: "cats-kittens", name: "Persian Cats & Kittens", slug: "cats-kittens" },
      { id: "dogs-puppies", name: "Dogs & Puppies", slug: "dogs-puppies" },
      { id: "birds", name: "Caged Birds & Parrots", slug: "birds" },
      { id: "fish-aquarium", name: "Aquariums & Tropical Fish", slug: "fish-aquarium" },
      { id: "pet-supplies", name: "Pet Food & Accessories", slug: "pet-supplies" },
    ],
  },
  {
    id: "books-sports-hobbies",
    name: "Hobbies & Sports",
    nameBn: "বই, খেলাধুলা ও শখ",
    slug: "books-sports-hobbies",
    icon: "football-outline",
    image: require("../../assets/images/categories/books-sports-hobbies.png"),
    description: "Gym equipment, musical instruments, sports gear, novels, and collectibles.",
    subCategories: [
      { id: "musical-instruments", name: "Guitars & Musical Instruments", slug: "musical-instruments" },
      { id: "gym-fitness", name: "Gym & Fitness Equipment", slug: "gym-fitness" },
      { id: "sports-gear", name: "Cricket, Football & Sports Gear", slug: "sports-gear" },
      { id: "books-novels", name: "Books, Comics & Textbooks", slug: "books-novels" },
    ],
  },
  {
    id: "services",
    name: "Services",
    nameBn: "সেবাসমূহ",
    slug: "services",
    icon: "construct-outline",
    image: require("../../assets/images/categories/services.png"),
    description: "Home repair, cleaning, shifting & movers, tutoring, AC servicing, and IT repair.",
    subCategories: [
      { id: "home-repair", name: "Electrician, Plumbing & AC Repair", slug: "home-repair" },
      { id: "movers-packers", name: "Packers & Movers", slug: "movers-packers" },
      { id: "cleaning-pest", name: "Deep Cleaning & Pest Control", slug: "cleaning-pest" },
      { id: "tuition-classes", name: "Home Tutors & Education", slug: "tuition-classes" },
    ],
  },
];

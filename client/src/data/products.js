export const products = [
  {
    id: 1,
    name: "Apex Smartwatch Pro",
    price: 189.0,
    rating: 4.8,
    category: "Watches",
    stock: 18,
    storeId: "techvault",
    storeName: "TechVault",
    description:
      "A premium smartwatch with all-day battery life, fitness tracking, and a bright always-on display.",
    image:
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 2,
    name: "Velocity Running Sneakers",
    price: 129.99,
    rating: 4.7,
    category: "Shoes",
    stock: 24,
    storeId: "stride-co",
    storeName: "Stride & Co.",
    description:
      "Lightweight running sneakers with cushioned soles built for daily training and long runs.",
    image:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 3,
    name: "Pulse Wireless Earbuds",
    price: 79.5,
    rating: 4.6,
    category: "Earbuds",
    stock: 40,
    storeId: "techvault",
    storeName: "TechVault",
    description:
      "Compact wireless earbuds with clear sound, noise isolation, and a portable charging case.",
    image:
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 4,
    name: "NovaBook Ultralight Laptop",
    price: 999.0,
    rating: 4.9,
    category: "Laptops",
    stock: 9,
    storeId: "techvault",
    storeName: "TechVault",
    description:
      "An ultralight laptop for work and creative projects with fast performance and a sharp display.",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 5,
    name: "ClearVue Aviator Glasses",
    price: 89.0,
    rating: 4.5,
    category: "Glasses",
    stock: 30,
    storeId: "stride-co",
    storeName: "Stride & Co.",
    description:
      "Classic aviator frames with UV protection and a lightweight metal finish.",
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 6,
    name: "IronCore Adjustable Dumbbells",
    price: 149.0,
    rating: 4.4,
    category: "Gym Equipment",
    stock: 15,
    storeId: "stride-co",
    storeName: "Stride & Co.",
    description:
      "Space-saving adjustable dumbbells for home workouts with secure locking plates.",
    image:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 7,
    name: "PixelMax Pro Phone",
    price: 749.0,
    rating: 4.7,
    category: "Phones",
    stock: 11,
    storeId: "techvault",
    storeName: "TechVault",
    description:
      "A flagship phone with a high-resolution camera system and smooth everyday performance.",
    image:
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 8,
    name: "SlateTab 11-inch Tablet",
    price: 429.0,
    rating: 4.6,
    category: "Tablets",
    stock: 14,
    storeId: "techvault",
    storeName: "TechVault",
    description:
      "An 11-inch tablet for streaming, note-taking, and light productivity on the go.",
    image:
      "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 9,
    name: "Cityline Classic Sedan",
    price: 18500.0,
    rating: 4.3,
    category: "Cars",
    stock: 2,
    storeId: "techvault",
    storeName: "TechVault",
    description:
      "A reliable classic sedan listed by a trusted marketplace vendor for city and highway driving.",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 10,
    name: "Urban Linen Overshirt",
    price: 68.0,
    rating: 4.2,
    category: "Fashion & Clothes",
    stock: 22,
    storeId: "stride-co",
    storeName: "Stride & Co.",
    description:
      "A breathable linen overshirt with a relaxed fit for everyday style.",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 11,
    name: "Chrono Steel Dress Watch",
    price: 245.0,
    rating: 4.8,
    category: "Watches",
    stock: 10,
    storeId: "techvault",
    storeName: "TechVault",
    description:
      "A stainless steel chronograph dress watch with a clean dial and durable bracelet.",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 12,
    name: "TrailFlex Training Shoes",
    price: 110.0,
    rating: 4.5,
    category: "Shoes",
    stock: 20,
    storeId: "stride-co",
    storeName: "Stride & Co.",
    description:
      "Supportive training shoes designed for gym sessions and outdoor trails.",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&q=80",
  },
];

export const featuredProductIds = [1, 2, 3, 5, 4, 10, 7, 6];

export function getProductById(id) {
  return products.find((product) => String(product.id) === String(id));
}

export function getProductsByStore(storeId) {
  return products.filter((product) => product.storeId === storeId);
}

export function getProductImages(product) {
  if (!product?.image) return [];
  return [
    product.image,
    product.image.replace("w=600&h=600", "w=800&h=800"),
    product.image.includes("?")
      ? `${product.image}&sat=-20`
      : product.image,
  ];
}

import { faker } from '@faker-js/faker';
import { Product } from '../types/product';

const categories = {
  Electronics: ['Laptops', 'Smartphones', 'Headphones', 'Cameras', 'Tablets', 'Smartwatches'],
  Clothing: ["Men's Wear", "Women's Wear", "Kids Wear", 'Shoes', 'Accessories'],
  'Home & Garden': ['Furniture', 'Kitchen', 'Decor', 'Bedding', 'Lighting'],
  'Sports & Outdoors': ['Fitness Equipment', 'Camping & Hiking', 'Sports Gear', 'Outdoor Apparel'],
  'Books & Media': ['Fiction', 'Non-Fiction', 'Educational', 'Comics', 'Audiobooks'],
};

const brands = {
  Electronics: ['TechPro', 'SmartLife', 'DigitalMax', 'InnovateTech', 'ProGadget'],
  Clothing: ['UrbanStyle', 'FashionHub', 'TrendyWear', 'ClassicFit', 'ModernThreads'],
  'Home & Garden': ['HomeEssentials', 'CozyLiving', 'DesignPro', 'ComfortHome', 'StyleSpace'],
  'Sports & Outdoors': ['ActiveGear', 'FitPro', 'OutdoorElite', 'SportsMaster', 'AdventureX'],
  'Books & Media': ['ReadWell', 'BookMart', 'StoryTime', 'LiteraryHub', 'PageTurner'],
};

const productTemplates = {
  Electronics: {
    Laptops: [
      { prefix: 'Pro', suffix: 'Laptop', features: ['16GB RAM', '512GB SSD', 'Intel i7', '15.6" Display'] },
      { prefix: 'Ultra', suffix: 'Notebook', features: ['32GB RAM', '1TB SSD', 'AMD Ryzen 9', '14" OLED'] },
      { prefix: 'Gaming', suffix: 'Laptop', features: ['RTX 4060', '16GB RAM', '1TB SSD', '17.3" 144Hz'] },
    ],
    Smartphones: [
      { prefix: 'Pro', suffix: 'Phone', features: ['5G', '128GB Storage', '48MP Camera', '6.5" AMOLED'] },
      { prefix: 'Max', suffix: 'Smartphone', features: ['5G', '256GB Storage', '108MP Camera', '6.7" Display'] },
      { prefix: 'Lite', suffix: 'Phone', features: ['4G', '64GB Storage', '32MP Camera', '6.1" LCD'] },
    ],
    Headphones: [
      { prefix: 'Pro', suffix: 'Headphones', features: ['Active Noise Cancelling', 'Bluetooth 5.0', '30h Battery'] },
      { prefix: 'Wireless', suffix: 'Earbuds', features: ['True Wireless', 'IPX4 Waterproof', '8h Battery'] },
    ],
  },
  Clothing: {
    "Men's Wear": [
      { prefix: 'Classic', suffix: 'Shirt', features: ['100% Cotton', 'Regular Fit', 'Machine Washable'] },
      { prefix: 'Slim Fit', suffix: 'Jeans', features: ['Stretch Denim', 'Fade Resistant', 'Modern Cut'] },
    ],
    "Women's Wear": [
      { prefix: 'Elegant', suffix: 'Dress', features: ['Flowy Design', 'Comfortable Fabric', 'Versatile Style'] },
      { prefix: 'Casual', suffix: 'Blouse', features: ['Breathable', 'Easy Care', 'Modern Fit'] },
    ],
  },
};

const colors = ['Black', 'White', 'Blue', 'Red', 'Gray', 'Navy', 'Green', 'Pink', 'Brown', 'Beige'];
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function generateProduct(index: number): Product {
  const categoryName = faker.helpers.arrayElement(Object.keys(categories)) as keyof typeof categories;
  const subcategoryName = faker.helpers.arrayElement(categories[categoryName]);
  const brand = faker.helpers.arrayElement(brands[categoryName]);

  const isClothing = categoryName === 'Clothing';
  const isElectronics = categoryName === 'Electronics';

  const templates = (productTemplates as any)[categoryName]?.[subcategoryName] || [];
  const template: { prefix: string; suffix: string; features: string[] } = templates.length > 0
    ? faker.helpers.arrayElement(templates)
    : { prefix: '', suffix: subcategoryName, features: [] };

  const name = `${brand} ${template.prefix} ${template.suffix}`.trim();
  const price = faker.number.float({ min: 19.99, max: 1999.99, fractionDigits: 2 });
  const hasDiscount = faker.datatype.boolean({ probability: 0.3 });
  const discount = hasDiscount ? faker.number.int({ min: 5, max: 50 }) : undefined;
  const originalPrice = hasDiscount ? parseFloat((price / (1 - discount! / 100)).toFixed(2)) : undefined;

  const rating = faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 });
  const reviewCount = faker.number.int({ min: 5, max: 5000 });
  const inStock = faker.datatype.boolean({ probability: 0.85 });
  const stockCount = inStock ? faker.number.int({ min: 1, max: 500 }) : 0;

  const tags: string[] = [];
  if (hasDiscount) tags.push('On Sale');
  if (rating >= 4.5) tags.push('Bestseller');
  if (faker.datatype.boolean({ probability: 0.2 })) tags.push('New Arrival');
  if (faker.datatype.boolean({ probability: 0.15 })) tags.push('Limited Edition');
  if (isElectronics && faker.datatype.boolean({ probability: 0.3 })) tags.push('Free Shipping');

  const features = template.features || [];

  const imageUrl = `https://picsum.photos/seed/${index}/400/400`;

  return {
    id: `product-${index + 1}`,
    name,
    description: faker.commerce.productDescription(),
    brand,
    category: categoryName,
    subcategory: subcategoryName,
    price,
    originalPrice,
    discount,
    rating,
    reviewCount,
    imageUrl,
    images: [imageUrl, `https://picsum.photos/seed/${index + 1000}/400/400`],
    inStock,
    stockCount,
    tags,
    features,
    specifications: isElectronics
      ? {
          Weight: `${faker.number.float({ min: 0.1, max: 5.0, fractionDigits: 1 })} kg`,
          Warranty: `${faker.number.int({ min: 1, max: 3 })} year${faker.number.int({ min: 1, max: 3 }) > 1 ? 's' : ''}`,
          Model: `${brand}-${faker.string.alphanumeric(6).toUpperCase()}`,
        }
      : undefined,
    color: isClothing ? faker.helpers.arrayElement(colors) : undefined,
    size: isClothing ? faker.helpers.arrayElement(sizes) : undefined,
    createdAt: faker.date.past({ years: 2 }).toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function generateSeedData(count: number = 150): Product[] {
  return Array.from({ length: count }, (_, i) => generateProduct(i));
}

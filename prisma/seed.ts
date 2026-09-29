import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  isFinalSale: boolean;
};

const customers = [
  { name: "Adaeze Okonkwo", email: "adaeze.okonkwo@gmail.com" },
  { name: "Chinedu Eze", email: "chinedu.eze@yahoo.com" },
  { name: "Fatima Abubakar", email: "fatima.abubakar@outlook.com" },
  { name: "Kwame Mensah", email: "kwame.mensah@gmail.com" },
  { name: "Amina Diallo", email: "amina.diallo@icloud.com" },
  { name: "Tunde Bakare", email: "tunde.bakare@gmail.com" },
  { name: "Ngozi Okafor", email: "ngozi.okafor@protonmail.com" },
  { name: "Ibrahim Yusuf", email: "ibrahim.yusuf@gmail.com" },
  { name: "Zainab Mohammed", email: "zainab.mohammed@yahoo.com" },
  { name: "Kofi Asante", email: "kofi.asante@gmail.com" },
  { name: "Sarah Chen", email: "sarah.chen@gmail.com" },
  { name: "James Mitchell", email: "james.mitchell@outlook.com" },
  { name: "Maria Santos", email: "maria.santos@gmail.com" },
  { name: "Daniel Okoro", email: "daniel.okoro@hotmail.com" },
  { name: "Elena Petrova", email: "elena.petrova@gmail.com" },
];

const productCatalog: Omit<OrderItem, "quantity">[] = [
  { name: "Wireless Bluetooth Earbuds", price: 49.99, isFinalSale: false },
  { name: "USB-C Fast Charging Cable", price: 14.99, isFinalSale: false },
  { name: "Portable Power Bank 20000mAh", price: 39.99, isFinalSale: false },
  { name: "Noise-Cancelling Headphones", price: 189.99, isFinalSale: false },
  { name: "Smart Watch Series X", price: 249.99, isFinalSale: false },
  { name: "Laptop Sleeve 15-inch", price: 29.99, isFinalSale: false },
  { name: "Mechanical Keyboard RGB", price: 119.99, isFinalSale: false },
  { name: "4K Webcam with Microphone", price: 89.99, isFinalSale: false },
  { name: "Cotton Crew Neck T-Shirt", price: 24.99, isFinalSale: false },
  { name: "Slim Fit Denim Jeans", price: 59.99, isFinalSale: false },
  { name: "Running Sneakers", price: 94.99, isFinalSale: false },
  { name: "Winter Parka Jacket", price: 159.99, isFinalSale: false },
  { name: "Leather Crossbody Bag", price: 79.99, isFinalSale: false },
  { name: "Clearance Summer Dress", price: 34.99, isFinalSale: true },
  { name: "Outlet Wool Scarf", price: 19.99, isFinalSale: true },
  { name: "Final Sale Graphic Hoodie", price: 44.99, isFinalSale: true },
  { name: "Ceramic Coffee Mug Set", price: 32.99, isFinalSale: false },
  { name: "Memory Foam Pillow", price: 45.99, isFinalSale: false },
  { name: "Stainless Steel Cookware Set", price: 219.99, isFinalSale: false },
  { name: "LED Desk Lamp", price: 37.99, isFinalSale: false },
  { name: "Air Purifier Compact", price: 129.99, isFinalSale: false },
  { name: "Non-Stick Frying Pan", price: 28.99, isFinalSale: false },
  { name: "Yoga Mat Premium", price: 42.99, isFinalSale: false },
  { name: "Resistance Band Set", price: 22.99, isFinalSale: false },
  { name: "Electric Kettle 1.7L", price: 54.99, isFinalSale: false },
  { name: "Open-Box Bluetooth Speaker", price: 64.99, isFinalSale: true },
  { name: "Display Model Tablet Stand", price: 27.99, isFinalSale: true },
];

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(10 + (days % 8), (days * 7) % 60, 0, 0);
  return date;
}

function pickItems(
  count: number,
  forceFinalSale?: boolean
): OrderItem[] {
  const shuffled = [...productCatalog].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count).map((product, index) => ({
    ...product,
    quantity: (index % 3) + 1,
    isFinalSale: forceFinalSale ? true : product.isFinalSale,
  }));

  if (forceFinalSale === false) {
    return selected.map((item) => ({ ...item, isFinalSale: false }));
  }

  return selected;
}

function totalOf(items: OrderItem[]): number {
  return Number(
    items
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2)
  );
}

/** Build item sets targeting under $100, $100–500, or over $500. */
function buildOrderItems(tier: "low" | "mid" | "high", withFinalSale: boolean): OrderItem[] {
  if (tier === "low") {
    const items = pickItems(2, withFinalSale ? undefined : false);
    // Ensure total stays under $100 by taking cheaper products
    const cheap = productCatalog
      .filter((p) => p.price < 50)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)
      .map((p, i) => ({
        ...p,
        quantity: 1,
        isFinalSale: withFinalSale ? true : p.isFinalSale,
      }));
    return cheap.length >= 1 ? cheap : items;
  }

  if (tier === "mid") {
    const midProducts = productCatalog
      .filter((p) => p.price >= 30 && p.price <= 200)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((p, i) => ({
        ...p,
        quantity: i === 0 ? 2 : 1,
        isFinalSale: withFinalSale ? p.isFinalSale || i === 0 : false,
      }));
    return midProducts;
  }

  // high — aim above $500
  const expensive = [
    { name: "Noise-Cancelling Headphones", price: 189.99, isFinalSale: false, quantity: 1 },
    { name: "Smart Watch Series X", price: 249.99, isFinalSale: false, quantity: 1 },
    { name: "Stainless Steel Cookware Set", price: 219.99, isFinalSale: false, quantity: 1 },
  ];
  if (withFinalSale) {
    expensive.push({
      name: "Open-Box Bluetooth Speaker",
      price: 64.99,
      isFinalSale: true,
      quantity: 1,
    });
  }
  return expensive;
}

type OrderPlan = {
  daysAgo: number;
  tier: "low" | "mid" | "high";
  withFinalSale: boolean;
  status: string;
};

/** Varied order plans so dates, amounts, and final-sale flags differ across customers. */
const orderPlansByCustomer: OrderPlan[][] = [
  [
    { daysAgo: 5, tier: "low", withFinalSale: false, status: "delivered" },
    { daysAgo: 18, tier: "mid", withFinalSale: true, status: "delivered" },
    { daysAgo: 45, tier: "high", withFinalSale: false, status: "delivered" },
  ],
  [
    { daysAgo: 3, tier: "mid", withFinalSale: false, status: "delivered" },
    { daysAgo: 12, tier: "low", withFinalSale: true, status: "delivered" },
  ],
  [
    { daysAgo: 7, tier: "high", withFinalSale: true, status: "delivered" },
    { daysAgo: 22, tier: "low", withFinalSale: false, status: "delivered" },
    { daysAgo: 55, tier: "mid", withFinalSale: false, status: "delivered" },
    { daysAgo: 70, tier: "low", withFinalSale: true, status: "delivered" },
  ],
  [
    { daysAgo: 2, tier: "low", withFinalSale: false, status: "shipped" },
    { daysAgo: 28, tier: "mid", withFinalSale: false, status: "delivered" },
    { daysAgo: 40, tier: "high", withFinalSale: false, status: "delivered" },
  ],
  [
    { daysAgo: 9, tier: "mid", withFinalSale: true, status: "delivered" },
    { daysAgo: 35, tier: "low", withFinalSale: false, status: "delivered" },
  ],
  [
    { daysAgo: 1, tier: "high", withFinalSale: false, status: "delivered" },
    { daysAgo: 14, tier: "low", withFinalSale: false, status: "delivered" },
    { daysAgo: 60, tier: "mid", withFinalSale: true, status: "delivered" },
  ],
  [
    { daysAgo: 6, tier: "low", withFinalSale: true, status: "delivered" },
    { daysAgo: 20, tier: "mid", withFinalSale: false, status: "delivered" },
    { daysAgo: 48, tier: "high", withFinalSale: false, status: "delivered" },
    { daysAgo: 75, tier: "low", withFinalSale: false, status: "cancelled" },
  ],
  [
    { daysAgo: 4, tier: "mid", withFinalSale: false, status: "delivered" },
    { daysAgo: 25, tier: "high", withFinalSale: true, status: "delivered" },
  ],
  [
    { daysAgo: 8, tier: "low", withFinalSale: false, status: "delivered" },
    { daysAgo: 16, tier: "mid", withFinalSale: false, status: "delivered" },
    { daysAgo: 52, tier: "mid", withFinalSale: true, status: "delivered" },
  ],
  [
    { daysAgo: 11, tier: "high", withFinalSale: false, status: "delivered" },
    { daysAgo: 33, tier: "low", withFinalSale: true, status: "delivered" },
    { daysAgo: 65, tier: "mid", withFinalSale: false, status: "delivered" },
  ],
  [
    { daysAgo: 2, tier: "low", withFinalSale: false, status: "delivered" },
    { daysAgo: 19, tier: "mid", withFinalSale: false, status: "delivered" },
    { daysAgo: 42, tier: "high", withFinalSale: true, status: "delivered" },
    { daysAgo: 80, tier: "low", withFinalSale: false, status: "delivered" },
  ],
  [
    { daysAgo: 10, tier: "mid", withFinalSale: true, status: "delivered" },
    { daysAgo: 27, tier: "low", withFinalSale: false, status: "shipped" },
  ],
  [
    { daysAgo: 5, tier: "high", withFinalSale: false, status: "delivered" },
    { daysAgo: 15, tier: "low", withFinalSale: false, status: "delivered" },
    { daysAgo: 38, tier: "mid", withFinalSale: true, status: "delivered" },
  ],
  [
    { daysAgo: 3, tier: "low", withFinalSale: true, status: "delivered" },
    { daysAgo: 21, tier: "high", withFinalSale: false, status: "delivered" },
    { daysAgo: 58, tier: "mid", withFinalSale: false, status: "delivered" },
  ],
  [
    { daysAgo: 7, tier: "mid", withFinalSale: false, status: "delivered" },
    { daysAgo: 13, tier: "low", withFinalSale: false, status: "delivered" },
    { daysAgo: 44, tier: "high", withFinalSale: true, status: "delivered" },
    { daysAgo: 90, tier: "low", withFinalSale: true, status: "delivered" },
  ],
];

async function main() {
  console.log("Seeding database...");

  // Clear existing data (children first due to FK constraints)
  await prisma.refundRequest.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();

  let orderCount = 0;
  let orderSeq = 1000;

  for (let i = 0; i < customers.length; i++) {
    const customerData = customers[i];
    const plans = orderPlansByCustomer[i];

    const customer = await prisma.customer.create({
      data: {
        name: customerData.name,
        email: customerData.email,
      },
    });

    for (const plan of plans) {
      const items = buildOrderItems(plan.tier, plan.withFinalSale);
      const totalAmount = totalOf(items);
      orderSeq += 1;

      await prisma.order.create({
        data: {
          orderNumber: `WN-${orderSeq}`,
          customerId: customer.id,
          items,
          totalAmount,
          status: plan.status,
          orderDate: daysAgo(plan.daysAgo),
        },
      });
      orderCount += 1;
    }
  }

  console.log(`Created ${customers.length} customers and ${orderCount} orders.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

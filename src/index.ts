import TelegramBot from "node-telegram-bot-api";
import cron from "node-cron";
import { checkAllProducts } from "./stockChecker.js";
import { prisma } from "./prisma.js";

const BOT_TOKEN = process.env.BOT_TOKEN!;
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.onText(/\/start/, async (msg) => {
  bot.sendMessage(msg.chat.id, "👋 Hi! Send /add <url> to start tracking a product.");
});

bot.onText(/\/add (.+)/, async (msg, match) => {
  const url = match?.[1];
  if (!url) return bot.sendMessage(msg.chat.id, "Please provide a URL.");

  await prisma.product.create({
    data: { url, chatId: msg.chat.id.toString(), lastStatus: "unknown" },
  });
  bot.sendMessage(msg.chat.id, `✅ Tracking started for:\n${url}`);
});

// Cron: run every 2 minutes
cron.schedule("*/2 * * * *", async () => {
  const products = await prisma.product.findMany();
  for (const product of products) {
    const available = await checkAllProducts(product.url);
    if (available && product.lastStatus !== "in") {
      await bot.sendMessage(
        product.chatId,
        `🔔 In Stock Alert:\n${product.url}`
      );
      await prisma.product.update({
        where: { id: product.id },
        data: { lastStatus: "in" },
      });
    } else if (!available && product.lastStatus !== "out") {
      await prisma.product.update({
        where: { id: product.id },
        data: { lastStatus: "out" },
      });
    }
  }
});

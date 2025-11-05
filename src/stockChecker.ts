import axios from "axios";
import * as cheerio from "cheerio";

export async function checkAllProducts(url: string): Promise<boolean> {
  const html = (await axios.get(url, { timeout: 10000 })).data;
  const $ = cheerio.load(html);

  // Simplified selectors for demo – tune per site
  const pageText = $("body").text().toLowerCase();

  if (url.includes("amazon")) {
    return !pageText.includes("currently unavailable");
  }
  if (url.includes("argos")) {
    return pageText.includes("add to trolley") || pageText.includes("in stock");
  }
  if (url.includes("tesco")) {
    return !pageText.includes("out of stock");
  }
  if (url.includes("asda")) {
    return pageText.includes("add to basket") || pageText.includes("in stock");
  }
  if (url.includes("pokemoncenter")) {
    return !pageText.includes("sold out");
  }
  return false;
}

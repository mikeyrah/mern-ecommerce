import { useLocation } from "react-router-dom";
import Seo from "./Seo";
import { organizationSchema } from "../hooks/useSeo";

const exact = {
  "/": { title: "Thoughtful Goods for Everyday Rituals", description: "Discover small-batch skincare, handmade apparel, sweet treats, home scents, and seasonal goods from Stewart-Tate & Co." },
  "/journal": { title: "The Journal", description: "Seasonal inspiration, brand stories, and thoughtful ideas for home, body, and everyday rituals." },
  "/brands/botani-eve": { title: "Botani Eve Botanical Care", description: "Shop small-batch botanical skincare, bath and body care, lip gloss, home scents, baby care, and men's essentials." },
  "/brands/botani-eve/bath-body": { title: "Botani Eve Bath & Body", description: "Explore botanical soaps, bath bombs, body polish, sugar scrubs, and moisturizing balms made for slower rituals." },
  "/brands/botani-eve/seasonal": { title: "Botani Eve Seasonal Collection", description: "Shop limited seasonal botanical care, scents, bath rituals, and lip colors while each small batch lasts." },
  "/brands/botani-eve/home-scents": { title: "Botani Eve Home Scents", description: "Create a calmer atmosphere with thoughtfully made Botani Eve candles and botanical home fragrances." },
  "/brands/botani-eve/men": { title: "Botani Eve for Men", description: "Straightforward botanical beard, body, moisture, and massage essentials for everyday care." },
  "/brands/botani-eve/baby": { title: "Botani Eve Baby Care", description: "Gentle botanical wash, butter, oil, and diaper balm for delicate skin and quiet everyday routines." },
  "/brands/botani-eve/lip-gloss": { title: "Botani Eve Lip Gloss", description: "Shop comfortable botanical lip gloss in original favorites and limited seasonal shades." },
  "/brands/the-krafted-charm": { title: "The Krafted Charm", description: "Discover handmade apparel, accessories, and expressive everyday pieces from The Krafted Charm." },
  "/brands/the-velvet-bakery": { title: "The Velvet Bakery", description: "Explore thoughtful cakes, cookies, and sweet treats for celebrations and beautiful everyday moments." },
  "/contact": { title: "Contact Us", description: "Contact Stewart-Tate & Co. or visit our pickup location at 970 N Oak St in Jackson, Georgia." },
  "/shipping": { title: "Shipping & Local Pickup", description: "Learn about Stewart-Tate & Co. shipping, delivery timing, and local pickup in Jackson, Georgia." },
  "/returns": { title: "Returns & Refunds", description: "Review the Stewart-Tate & Co. return and refund process for eligible purchases." },
  "/privacy": { title: "Privacy Policy", description: "Read how Stewart-Tate & Co. handles and protects customer information." },
  "/terms": { title: "Terms & Conditions", description: "Review the terms and conditions for shopping with Stewart-Tate & Co." },
};
const privatePrefixes = ["/account", "/cart", "/wishlist", "/orders", "/secret-dashboard", "/purchase-", "/login", "/signup", "/forgot-password", "/reset-password", "/verify-email", "/search"];

const RouteSeo = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith("/products/") || (pathname.startsWith("/journal/") && pathname !== "/journal")) return null;
  const category = pathname.startsWith("/category/") ? decodeURIComponent(pathname.split("/").pop()).replaceAll("-", " ") : "";
  const meta = exact[pathname] || (category ? { title: `${category.replace(/\b\w/g, (letter) => letter.toUpperCase())} Collection`, description: `Shop ${category} and thoughtful everyday goods from the Stewart-Tate & Co. family of brands.` } : { title: "Stewart-Tate & Co.", description: "Thoughtful goods from our family of brands in Jackson, Georgia." });
  const noindex = privatePrefixes.some((prefix) => pathname.startsWith(prefix));
  return <Seo {...meta} path={pathname} noindex={noindex} schema={pathname === "/" ? organizationSchema : undefined} />;
};
export default RouteSeo;

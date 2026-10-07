import { useEffect } from "react";

const storeName = "Stewart-Tate & Co.";
const defaultDescription = "Shop thoughtfully selected home, body, seasonal, apparel, and bakery goods from Stewart-Tate & Co. in Jackson, Georgia.";

const setMeta = (selector, attributes) => {
  let element = document.head.querySelector(selector);
  if (!element) { element = document.createElement("meta"); document.head.appendChild(element); }
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
};

export const useSeo = ({ title, description = defaultDescription, image, type = "website", noindex = false, path, schema }) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${storeName}` : `${storeName} | Home, Body & Everyday Goods`;
    const canonical = new URL(path || window.location.pathname, window.location.origin).toString();
    document.title = fullTitle;
    setMeta('meta[name="description"]', { name: "description", content: description });
    setMeta('meta[name="robots"]', { name: "robots", content: noindex ? "noindex,nofollow" : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" });
    setMeta('meta[property="og:title"]', { property: "og:title", content: fullTitle });
    setMeta('meta[property="og:description"]', { property: "og:description", content: description });
    setMeta('meta[property="og:type"]', { property: "og:type", content: type });
    setMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
    setMeta('meta[name="twitter:card"]', { name: "twitter:card", content: image ? "summary_large_image" : "summary" });
    setMeta('meta[name="twitter:title"]', { name: "twitter:title", content: fullTitle });
    setMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    if (image) {
      const absoluteImage = new URL(image, window.location.origin).toString();
      setMeta('meta[property="og:image"]', { property: "og:image", content: absoluteImage });
      setMeta('meta[name="twitter:image"]', { name: "twitter:image", content: absoluteImage });
    } else {
      document.head.querySelector('meta[property="og:image"]')?.remove();
      document.head.querySelector('meta[name="twitter:image"]')?.remove();
    }
    let canonicalLink = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalLink) { canonicalLink = document.createElement("link"); canonicalLink.rel = "canonical"; document.head.appendChild(canonicalLink); }
    canonicalLink.href = canonical;
    document.getElementById("page-jsonld")?.remove();
    if (schema) { const script = document.createElement("script"); script.id = "page-jsonld"; script.type = "application/ld+json"; script.textContent = JSON.stringify(schema); document.head.appendChild(script); }
  }, [description, image, noindex, path, schema, title, type]);
};

export const organizationSchema = { "@context": "https://schema.org", "@type": "Store", name: storeName, address: { "@type": "PostalAddress", streetAddress: "970 N Oak St", addressLocality: "Jackson", addressRegion: "GA", postalCode: "30233", addressCountry: "US" }, email: "stewarttateandco@gmail.com" };

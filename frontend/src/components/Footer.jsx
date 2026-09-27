import { Link } from "react-router-dom";

const links = [["Journal", "/journal"], ["Contact", "/contact"], ["Shipping & pickup", "/shipping"], ["Returns & refunds", "/returns"], ["Privacy", "/privacy"], ["Terms", "/terms"]];

const Footer = () => <footer className="border-t border-[#ded8ca] bg-[#27352b] px-6 py-12 text-[#e7eee3]">
  <div className="mx-auto grid max-w-6xl gap-9 md:grid-cols-[1fr_auto] md:items-end">
    <div><Link to="/" className="font-serif text-2xl text-white">Stewart-Tate <span className="text-[#d2ad5c]">&amp; Co.</span></Link><p className="mt-3 max-w-md text-sm leading-6 text-[#bdc9be]">Thoughtful goods for home, body, and everyday rituals.</p><p className="mt-4 text-sm text-[#bdc9be]">970 N Oak St, Jackson, GA 30233 · Pickup 10 AM–6 PM</p></div>
    <nav aria-label="Store information" className="flex max-w-xl flex-wrap gap-x-6 gap-y-3 text-sm">{links.map(([label, path]) => <Link key={path} to={path} className="transition hover:text-[#d2ad5c]">{label}</Link>)}</nav>
  </div>
  <div className="mx-auto mt-9 max-w-6xl border-t border-white/10 pt-6 text-xs text-[#93a397]">© {new Date().getFullYear()} Stewart-Tate &amp; Co. All rights reserved.</div>
</footer>;

export default Footer;

import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Leaf, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { blogPosts } from "../data/blogPosts";
import axios from "../lib/axios";

const details = (post) => ({ date: post.date || new Date(post.publishedAt || post.createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }), readTime: post.readTime || `${Math.max(1, Math.ceil((post.body || "").split(/\s+/).length / 220))} min read`, soft: post.soft || `${post.accent || "#6f856c"}22` });

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { axios.get("/blog").then(({ data }) => setPosts(data.posts?.length ? data.posts : blogPosts)).catch(() => setPosts(blogPosts)).finally(() => setLoading(false)); }, []);
  return <main className="min-h-screen bg-[#f8f6ef] text-[#27352b]">
  <section className="border-b border-[#ded8ca] bg-[#e9eee5] px-5 py-16 sm:px-8 sm:py-24">
    <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.24em] text-[#718674]">The Stewart-Tate journal</p><h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.96] sm:text-7xl">Stories for a more <em className="font-normal text-[#7c9279]">thoughtful</em> everyday.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-[#5f6c63]">Notes from our brands, seasonal inspiration, and simple ways to make room for beauty and ritual.</p></div><BookOpen size={72} strokeWidth={0.8} className="hidden text-[#9daf9a] lg:block" /></div>
  </section>
  <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
    {loading ? <Loader className="mx-auto animate-spin text-[#6f856c]" /> : <div className="grid gap-6 lg:grid-cols-3">{posts.map((post, index) => { const meta = details(post); return <article key={post.slug} className={`group overflow-hidden rounded-[1.75rem] border border-[#ded8ca] bg-white shadow-[0_14px_40px_rgba(49,75,59,0.06)] ${index === 0 ? "lg:col-span-2 lg:grid lg:grid-cols-[0.9fr_1.1fr]" : ""}`}><div className="relative min-h-64 overflow-hidden bg-cover bg-center" style={{ backgroundColor: meta.soft, backgroundImage: post.coverImage?.url ? `url(${post.coverImage.url})` : undefined }}><div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" /><div className="absolute bottom-8 left-8"><Leaf size={42} strokeWidth={1} className={post.coverImage?.url ? "text-white" : ""} style={post.coverImage?.url ? undefined : { color: post.accent }} /><p className={`mt-5 text-[10px] font-bold uppercase tracking-[0.22em] ${post.coverImage?.url ? "text-white" : ""}`} style={post.coverImage?.url ? undefined : { color: post.accent }}>{post.category}</p></div></div><div className="flex flex-col p-7 sm:p-9"><p className="text-xs text-[#858c85]">{meta.date} · {meta.readTime}</p><h2 className="mt-4 font-serif text-3xl leading-tight text-[#27352b]">{post.title}</h2><p className="mt-4 flex-1 text-sm leading-7 text-[#687168]">{post.excerpt}</p><Link to={`/journal/${post.slug}`} className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#58715d]">Read the story <ArrowRight size={16} className="transition group-hover:translate-x-1" /></Link></div></article>; })}</div>}
  </section>
</main>;
};

export default BlogPage;

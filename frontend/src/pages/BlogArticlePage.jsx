import { useEffect, useState } from "react";
import { ArrowLeft, Leaf, Loader } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { blogPosts, getBlogPost } from "../data/blogPosts";
import axios from "../lib/axios";

const BlogArticlePage = () => {
  const { slug } = useParams();
  const fallback = getBlogPost(slug);
  const [post, setPost] = useState(fallback || null);
  const [loading, setLoading] = useState(!fallback);
  useEffect(() => { axios.get(`/blog/${slug}`).then(({ data }) => setPost(data.post)).catch(() => setPost(fallback || null)).finally(() => setLoading(false)); }, [slug]);
  if (loading) return <main className="flex min-h-[70vh] items-center justify-center bg-[#f8f6ef]"><Loader className="animate-spin text-[#6f856c]" /></main>;
  if (!post) return <main className="min-h-[70vh] bg-[#f8f6ef] px-6 py-24 text-center"><h1 className="font-serif text-4xl">Story not found</h1><Link to="/journal" className="mt-5 inline-block text-[#58715d]">Return to the journal</Link></main>;
  const date = post.date || new Date(post.publishedAt || post.createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
  const readTime = post.readTime || `${Math.max(1, Math.ceil((post.body || "").split(/\s+/).length / 220))} min read`;
  const paragraphs = post.body?.split(/\n\s*\n/).filter(Boolean) || [];
  return <main className="min-h-screen bg-[#f8f6ef] text-[#27352b]"><header className="bg-cover bg-center px-5 pb-14 pt-12 sm:px-8 sm:pb-20 sm:pt-16" style={{ backgroundColor: post.soft || `${post.accent || "#6f856c"}22`, backgroundImage: post.coverImage?.url ? `linear-gradient(rgba(248,246,239,.82),rgba(248,246,239,.9)),url(${post.coverImage.url})` : undefined }}><div className="mx-auto max-w-4xl"><Link to="/journal" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em]" style={{ color: post.accent }}><ArrowLeft size={16} /> The journal</Link><p className="mt-12 text-xs font-bold uppercase tracking-[0.22em]" style={{ color: post.accent }}>{post.category}</p><h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[1.02] sm:text-7xl">{post.title}</h1><p className="mt-6 text-sm text-[#687168]">{date} · {readTime}</p></div></header><article className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20"><p className="font-serif text-2xl leading-10 text-[#43503f] sm:text-3xl">{post.excerpt}</p>{post.pullQuote && <blockquote className="my-12 border-l-2 pl-7 font-serif text-3xl italic leading-tight" style={{ borderColor: post.accent, color: post.accent }}>{post.pullQuote}</blockquote>}<div className="mt-12 space-y-7">{post.sections ? post.sections.map(([title, content]) => <section key={title}><h2 className="font-serif text-3xl">{title}</h2><p className="mt-4 text-lg leading-8 text-[#687168]">{content}</p></section>) : paragraphs.map((paragraph, index) => <p key={index} className="text-lg leading-8 text-[#687168]">{paragraph}</p>)}</div><div className="mt-16 flex items-center gap-3 border-t border-[#ded8ca] pt-8 text-sm text-[#687168]"><Leaf size={20} style={{ color: post.accent }} /> Written with care by Stewart-Tate &amp; Co.</div></article></main>;
};

export default BlogArticlePage;

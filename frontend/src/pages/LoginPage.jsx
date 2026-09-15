import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Loader, Lock, LogIn, Mail, Sparkles } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading } = useUserStore();

  const handleSubmit = (event) => {
    event.preventDefault();
    login(email, password);
  };

  return (
    <main className="brand-shell flex min-h-[calc(100vh-5rem)] items-center px-4 py-10 sm:px-8">
      <motion.div
        className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[#e1dacb] bg-white shadow-[0_24px_80px_rgba(68,62,45,0.14)] md:grid-cols-[0.9fr_1.1fr]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
      >
        <section className="relative overflow-hidden bg-[#6f856c] p-9 text-white sm:p-12">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full border border-white/20" />
          <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full border border-white/20" />
          <div className="relative flex h-full flex-col justify-between gap-14">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-[#f7e7b4]"><Sparkles size={16} /> Stewart-Tate &amp; Co.</div>
              <h1 className="mt-8 max-w-sm font-serif text-5xl leading-[0.98]">Welcome back to the collective.</h1>
              <p className="mt-6 max-w-sm text-base leading-7 text-white/80">Continue discovering thoughtful pieces from Botani Eve, The Krafted Charm, and The Velvet Bakery.</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
              <Leaf size={20} className="text-[#f7e7b4]" />
              <p className="mt-3 font-serif text-xl">Crafted with care, chosen by you.</p>
            </div>
          </div>
        </section>

        <section className="p-8 sm:p-12">
          <p className="section-kicker text-[#B58A34]">Member sign in</p>
          <h2 className="mt-3 font-serif text-4xl text-[#27352b]">Welcome back.</h2>
          <p className="mt-3 text-sm leading-6 text-[#687064]">Sign in to view your cart and keep shopping your favorite collections.</p>

          <form onSubmit={handleSubmit} className="mt-9 space-y-5">
            <label className="block text-sm font-semibold text-[#43503f]" htmlFor="email">
              Email address
              <span className="relative mt-2 block">
                <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7C9279]" size={18} />
                <input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-[#dcd5c5] bg-[#fdfcf9] py-3 pl-11 pr-4 text-[#27352b] outline-none transition placeholder:text-[#9a9c91] focus:border-[#7C9279] focus:ring-4 focus:ring-[#e6eee3]" />
              </span>
            </label>

            <label className="block text-sm font-semibold text-[#43503f]" htmlFor="password">
              Password
              <span className="relative mt-2 block">
                <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7C9279]" size={18} />
                <input id="password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-[#dcd5c5] bg-[#fdfcf9] py-3 pl-11 pr-4 text-[#27352b] outline-none transition placeholder:text-[#9a9c91] focus:border-[#7C9279] focus:ring-4 focus:ring-[#e6eee3]" />
              </span>
            </label>

            <button type="submit" disabled={loading} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#6f856c] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#586d55] focus:outline-none focus:ring-4 focus:ring-[#dce7d9] disabled:opacity-50">
              {loading ? <><Loader className="animate-spin" size={18} /> Signing in…</> : <><LogIn size={18} /> Sign in <ArrowRight size={17} /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#687064]">New to the collective? <Link to="/signup" className="font-semibold text-[#9b7528] hover:text-[#76571d]">Create an account <ArrowRight className="inline" size={15} /></Link></p>
        </section>
      </motion.div>
    </main>
  );
};

export default LoginPage;

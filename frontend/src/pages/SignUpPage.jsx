import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Gift, Loader, Lock, Mail, Sparkles, User, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { useUserStore } from "../stores/useUserStore";

const SignUpPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const { signup, loading } = useUserStore();

  const updateField = (field) => (event) => setFormData({ ...formData, [field]: event.target.value });
  const handleSubmit = (event) => {
    event.preventDefault();
    signup(formData.name, formData.email, formData.password, formData.confirmPassword);
  };

  return (
    <main className="brand-shell flex min-h-[calc(100vh-5rem)] items-center px-4 py-10 sm:px-8">
      <motion.div
        className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[#e1dacb] bg-white shadow-[0_24px_80px_rgba(68,62,45,0.14)] md:grid-cols-[0.9fr_1.1fr]"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}
      >
        <section className="relative overflow-hidden bg-[#b58a34] p-9 text-white sm:p-12">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full border border-white/25" />
          <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full border border-white/25" />
          <div className="relative flex h-full flex-col justify-between gap-14">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-[#fff4d6]"><Sparkles size={16} /> Stewart-Tate &amp; Co.</div>
              <h1 className="mt-8 max-w-sm font-serif text-5xl leading-[0.98]">A beautiful collection starts here.</h1>
              <p className="mt-6 max-w-sm text-base leading-7 text-white/85">Join our collective for handmade finds, thoughtful rituals, and sweet celebrations.</p>
            </div>
            <div className="rounded-2xl border border-white/25 bg-white/10 p-5 backdrop-blur-sm">
              <Gift size={20} className="text-[#fff4d6]" />
              <p className="mt-3 font-serif text-xl">Three brands. One thoughtful experience.</p>
            </div>
          </div>
        </section>

        <section className="p-8 sm:p-12">
          <p className="section-kicker text-[#B58A34]">Join the collective</p>
          <h2 className="mt-3 font-serif text-4xl text-[#27352b]">Create your account.</h2>
          <p className="mt-3 text-sm leading-6 text-[#687064]">Save your favorite pieces and make your next checkout effortless.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <FormField id="name" label="Full name" icon={User} value={formData.name} onChange={updateField("name")} placeholder="Your name" />
            <FormField id="email" label="Email address" icon={Mail} type="email" value={formData.email} onChange={updateField("email")} placeholder="you@example.com" />
            <FormField id="password" label="Password" icon={Lock} type="password" value={formData.password} onChange={updateField("password")} placeholder="••••••••" />
            <FormField id="confirmPassword" label="Confirm password" icon={Lock} type="password" value={formData.confirmPassword} onChange={updateField("confirmPassword")} placeholder="••••••••" />

            <button type="submit" disabled={loading} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#6f856c] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#586d55] focus:outline-none focus:ring-4 focus:ring-[#dce7d9] disabled:opacity-50">
              {loading ? <><Loader className="animate-spin" size={18} /> Creating account…</> : <><UserPlus size={18} /> Create account <ArrowRight size={17} /></>}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-[#687064]">Already a member? <Link to="/login" className="font-semibold text-[#9b7528] hover:text-[#76571d]">Sign in <ArrowRight className="inline" size={15} /></Link></p>
        </section>
      </motion.div>
    </main>
  );
};

const FormField = ({ id, label, icon: Icon, type = "text", value, onChange, placeholder }) => (
  <label className="block text-sm font-semibold text-[#43503f]" htmlFor={id}>
    {label}
    <span className="relative mt-2 block">
      <Icon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7C9279]" size={18} />
      <input id={id} type={type} required value={value} onChange={onChange} placeholder={placeholder} className="w-full rounded-xl border border-[#dcd5c5] bg-[#fdfcf9] py-3 pl-11 pr-4 text-[#27352b] outline-none transition placeholder:text-[#9a9c91] focus:border-[#7C9279] focus:ring-4 focus:ring-[#e6eee3]" />
    </span>
  </label>
);

export default SignUpPage;

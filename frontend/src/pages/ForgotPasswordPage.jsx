import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader, Mail } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setLoading(true);
    try { const response = await axios.post("/auth/forgot-password", { email }); toast.success(response.data.message); setSent(true); }
    catch (error) { toast.error(error.response?.data?.message || "Unable to send reset email"); }
    finally { setLoading(false); }
  };
  return <AuthPanel eyebrow="Account recovery" title={sent ? "Check your inbox." : "Reset your password."} copy={sent ? "If an account uses that email, we sent a secure reset link. It expires in one hour." : "Enter the email connected to your account and we’ll send you a secure reset link."}>
    {!sent && <form onSubmit={submit} className="mt-7"><label className="text-sm font-semibold text-[#43503f]">Email address<span className="relative mt-2 block"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7C9279]" size={18}/><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-[#dcd5c5] bg-[#fdfcf9] py-3 pl-11 pr-4 outline-none focus:border-[#7C9279] focus:ring-4 focus:ring-[#e6eee3]" /></span></label><button disabled={loading} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#314b3b] py-3.5 font-semibold text-white disabled:opacity-50">{loading && <Loader className="animate-spin" size={17}/>} Send reset link</button></form>}
    <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#9b7528]"><ArrowLeft size={15}/> Back to sign in</Link>
  </AuthPanel>;
};

export const AuthPanel = ({ eyebrow, title, copy, children }) => <main className="brand-shell flex min-h-[calc(100vh-5rem)] items-center px-4 py-14"><section className="mx-auto w-full max-w-xl rounded-[2rem] border border-[#e1dacb] bg-white p-8 shadow-[0_24px_80px_rgba(68,62,45,0.12)] sm:p-12"><p className="section-kicker text-[#B58A34]">{eyebrow}</p><h1 className="mt-3 font-serif text-4xl text-[#27352b]">{title}</h1><p className="mt-3 leading-7 text-[#687064]">{copy}</p>{children}</section></main>;
export default ForgotPasswordPage;

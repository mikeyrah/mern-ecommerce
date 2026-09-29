import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";
import { AuthPanel } from "./ForgotPasswordPage";

const ResetPasswordPage = () => {
  const [params] = useSearchParams(); const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirm: "" }); const [loading, setLoading] = useState(false);
  const submit = async (event) => { event.preventDefault(); if (form.password !== form.confirm) return toast.error("Passwords do not match"); setLoading(true); try { const response = await axios.post("/auth/reset-password", { token: params.get("token"), password: form.password }); toast.success(response.data.message); navigate("/login"); } catch (error) { toast.error(error.response?.data?.message || "Unable to reset password"); } finally { setLoading(false); } };
  if (!params.get("token")) return <AuthPanel eyebrow="Account recovery" title="Reset link missing." copy="This password reset link is incomplete."><Link className="mt-6 inline-block font-semibold text-[#9b7528]" to="/forgot-password">Request a new link</Link></AuthPanel>;
  return <AuthPanel eyebrow="Account recovery" title="Choose a new password." copy="Use at least eight characters and choose something unique to this account."><form onSubmit={submit} className="mt-7 space-y-4"><Password label="New password" value={form.password} onChange={(password) => setForm({ ...form, password })}/><Password label="Confirm new password" value={form.confirm} onChange={(confirm) => setForm({ ...form, confirm })}/><button disabled={loading} className="w-full rounded-xl bg-[#314b3b] py-3.5 font-semibold text-white disabled:opacity-50">{loading ? "Updating…" : "Update password"}</button></form></AuthPanel>;
};
const Password = ({ label, value, onChange }) => <label className="block text-sm font-semibold text-[#43503f]">{label}<input type="password" minLength={8} required value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-[#dcd5c5] bg-[#fdfcf9] px-4 py-3 outline-none focus:border-[#7C9279] focus:ring-4 focus:ring-[#e6eee3]" /></label>;
export default ResetPasswordPage;

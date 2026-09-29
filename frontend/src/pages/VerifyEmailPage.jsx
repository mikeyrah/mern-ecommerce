import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import { AuthPanel } from "./ForgotPasswordPage";

const VerifyEmailPage = () => {
  const [params] = useSearchParams(); const [state, setState] = useState({ loading: true, success: false, message: "Verifying your email…" }); const checkAuth = useUserStore((store) => store.checkAuth);
  useEffect(() => { const token = params.get("token"); if (!token) { setState({ loading: false, success: false, message: "This verification link is incomplete." }); return; } axios.post("/auth/verify-email", { token }).then(async (response) => { setState({ loading: false, success: true, message: response.data.message }); await checkAuth(); }).catch((error) => setState({ loading: false, success: false, message: error.response?.data?.message || "Unable to verify email" })); }, [params, checkAuth]);
  return <AuthPanel eyebrow="Account security" title={state.loading ? "One moment…" : state.success ? "Email verified." : "We couldn’t verify this link."} copy={state.message}><Link to={state.success ? "/account" : "/login"} className="mt-6 inline-block rounded-full bg-[#314b3b] px-6 py-3 text-sm font-semibold text-white">{state.success ? "Return to my account" : "Return to sign in"}</Link></AuthPanel>;
};
export default VerifyEmailPage;

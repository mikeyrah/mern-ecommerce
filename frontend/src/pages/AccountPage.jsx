import { useRef, useState } from "react";
import { Camera, Check, ImagePlus, Loader, Mail, PackageCheck, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useUserStore } from "../stores/useUserStore";

const AccountPage = () => {
  const { user, loading, updateProfilePicture, removeProfilePicture } = useUserStore();
  const fileInput = useRef(null);
  const [preview, setPreview] = useState("");
  const [pendingImage, setPendingImage] = useState("");
  const initials = user.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  const currentImage = preview || user.profilePicture?.url;

  const chooseImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return toast.error("Choose a JPEG, PNG, or WebP image");
    if (file.size > 5 * 1024 * 1024) return toast.error("Profile picture must be 5 MB or smaller");
    const reader = new FileReader();
    reader.onload = () => { setPendingImage(reader.result); setPreview(reader.result); };
    reader.readAsDataURL(file);
  };

  const clearSelection = () => {
    setPreview(""); setPendingImage("");
    if (fileInput.current) fileInput.current.value = "";
  };

  const saveImage = async () => {
    if (pendingImage && await updateProfilePicture(pendingImage)) setPendingImage("");
  };

  const removeImage = async () => { await removeProfilePicture(); clearSelection(); };

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#f8f6ef] pb-20">
      <section className="border-b border-[#ded8ca] bg-[#eef1e8] px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-6xl"><p className="text-xs font-bold uppercase tracking-[0.24em] text-[#78907b]">Member profile</p><h1 className="mt-3 font-serif text-4xl text-[#203128] sm:text-6xl">Your place in the collective.</h1><p className="mt-4 max-w-2xl leading-7 text-[#657168]">Personalize your account and keep your Stewart-Tate shopping experience distinctly yours.</p></div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-7 px-5 pt-10 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.section className="rounded-[2rem] border border-[#ded8ca] bg-white p-6 shadow-[0_18px_50px_rgba(49,75,59,0.07)] sm:p-9" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
            <div className="relative shrink-0">
              <div className="flex h-44 w-44 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#dfe8db] text-4xl font-semibold text-[#4f6653] shadow-[0_16px_38px_rgba(49,75,59,0.18)]">{currentImage ? <img src={currentImage} alt={`${user.name}'s profile`} className="h-full w-full object-cover" /> : initials}</div>
              <button type="button" onClick={() => fileInput.current?.click()} className="absolute bottom-2 right-2 flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-[#314b3b] text-white shadow-md hover:bg-[#263d30]" aria-label="Choose profile picture"><Camera size={18} /></button>
              <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage} className="sr-only" />
            </div>
            <div className="w-full text-center sm:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#78907b]">Profile picture</p><h2 className="mt-2 font-serif text-3xl text-[#27352b]">Make it feel like you.</h2><p className="mt-3 text-sm leading-6 text-[#6b756d]">Choose a JPEG, PNG, or WebP image up to 5 MB. We’ll crop it into a polished square avatar.</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button type="button" onClick={() => fileInput.current?.click()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#728775] px-5 py-2.5 text-sm font-semibold text-[#526757] hover:bg-[#e9efe6] disabled:opacity-50"><ImagePlus size={17} /> Choose photo</button>
                {pendingImage && <button type="button" onClick={saveImage} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#314b3b] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{loading ? <Loader size={17} className="animate-spin" /> : <Check size={17} />} Save photo</button>}
                {pendingImage && <button type="button" onClick={clearSelection} disabled={loading} className="text-sm font-semibold text-[#7a817a]">Cancel</button>}
                {!pendingImage && user.profilePicture?.url && <button type="button" onClick={removeImage} disabled={loading} className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#92584d] disabled:opacity-50"><Trash2 size={16} /> Remove photo</button>}
              </div>
            </div>
          </div>
        </motion.section>

        <motion.aside className="rounded-[2rem] border border-[#ded8ca] bg-[#fbfaf6] p-6 shadow-[0_14px_40px_rgba(49,75,59,0.05)] sm:p-8" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b58a34]">Account details</p>
          <div className="mt-6 space-y-5"><Detail icon={UserRound} label="Name" value={user.name} /><Detail icon={Mail} label="Email" value={user.email} gold /><Detail icon={ShieldCheck} label="Account" value={user.role} /></div>
          <Link to="/orders" className="mt-6 flex items-center justify-center gap-2 rounded-full bg-[#314b3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#263d30]"><PackageCheck size={17} /> View my orders</Link>
        </motion.aside>
      </div>
    </main>
  );
};

const Detail = ({ icon: Icon, label, value, gold }) => <div className="flex items-center gap-4 rounded-2xl border border-[#e3ddd1] bg-white p-4"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${gold ? "bg-[#f5ead2] text-[#9b7528]" : "bg-[#e7eee3] text-[#607660]"}`}><Icon size={19} /></span><div className="min-w-0"><p className="text-xs text-[#858d86]">{label}</p><p className="truncate font-semibold capitalize text-[#354139]">{value}</p></div></div>;

export default AccountPage;

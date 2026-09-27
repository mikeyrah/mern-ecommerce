import { useEffect, useState } from "react";
import { Edit3, FileText, ImagePlus, Loader, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";

const emptyPost = { title: "", category: "Behind the brand", excerpt: "", body: "", accent: "#6f856c", status: "draft", coverImage: "" };

const JournalTab = () => {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(emptyPost);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPosts = async () => {
    try { const { data } = await axios.get("/blog/admin"); setPosts(data.posts || []); }
    catch (error) { toast.error(error.response?.data?.message || "Unable to load journal posts"); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadPosts(); }, []);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const reset = () => { setForm(emptyPost); setEditingId(null); };
  const edit = (post) => {
    setEditingId(post._id);
    setForm({ title: post.title, category: post.category, excerpt: post.excerpt, body: post.body, accent: post.accent || "#6f856c", status: post.status, coverImage: post.coverImage?.url || "" });
    document.querySelector("#journal-editor")?.scrollIntoView({ behavior: "smooth" });
  };
  const chooseImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Choose an image file");
    if (file.size > 5 * 1024 * 1024) return toast.error("Cover image must be 5 MB or smaller");
    const reader = new FileReader(); reader.onload = () => update("coverImage", reader.result); reader.readAsDataURL(file);
  };
  const submit = async (event) => {
    event.preventDefault(); setSaving(true);
    try {
      const request = editingId ? axios.put(`/blog/admin/${editingId}`, form) : axios.post("/blog/admin", form);
      const { data } = await request;
      setPosts((current) => editingId ? current.map((post) => post._id === editingId ? data.post : post) : [data.post, ...current]);
      toast.success(editingId ? "Journal post updated" : "Journal post created"); reset();
    } catch (error) { toast.error(error.response?.data?.message || "Unable to save journal post"); }
    finally { setSaving(false); }
  };
  const remove = async (post) => {
    if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    try { await axios.delete(`/blog/admin/${post._id}`); setPosts((current) => current.filter((item) => item._id !== post._id)); if (editingId === post._id) reset(); toast.success("Journal post deleted"); }
    catch (error) { toast.error(error.response?.data?.message || "Unable to delete journal post"); }
  };

  return <section className="mx-auto max-w-6xl">
    <div className="rounded-[1.5rem] border border-[#e1dacb] bg-white p-6 shadow-sm"><p className="section-kicker text-[#7c9279]">Editorial desk</p><h2 className="mt-2 font-serif text-3xl text-[#27352b]">Stewart-Tate Journal</h2><p className="mt-2 text-sm text-[#687064]">Write stories, save drafts, and publish when they are ready.</p></div>
    <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <form id="journal-editor" onSubmit={submit} className="rounded-[1.5rem] border border-[#e1dacb] bg-white p-6 shadow-sm sm:p-8"><div className="flex items-center justify-between gap-4"><h3 className="font-serif text-2xl text-[#27352b]">{editingId ? "Edit story" : "New story"}</h3>{editingId && <button type="button" onClick={reset} className="inline-flex items-center gap-1 text-sm text-[#687064]"><X size={16} /> Cancel edit</button>}</div><div className="mt-6 space-y-4"><Field label="Title" value={form.title} onChange={(value) => update("title", value)} required placeholder="A thoughtful story title" /><div className="grid gap-4 sm:grid-cols-2"><Field label="Category" value={form.category} onChange={(value) => update("category", value)} required placeholder="Behind the brand" /><label className="block text-sm font-semibold text-[#43503f]">Accent color<input type="color" value={form.accent} onChange={(event) => update("accent", event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#dcd5c5] bg-white p-1" /></label></div><label className="block text-sm font-semibold text-[#43503f]">Short excerpt<textarea required maxLength="400" rows="3" value={form.excerpt} onChange={(event) => update("excerpt", event.target.value)} className="mt-2 w-full rounded-xl border border-[#dcd5c5] px-4 py-3 font-normal" placeholder="A short introduction shown on the journal page" /></label><label className="block text-sm font-semibold text-[#43503f]">Article body<textarea required maxLength="30000" rows="12" value={form.body} onChange={(event) => update("body", event.target.value)} className="mt-2 w-full rounded-xl border border-[#dcd5c5] px-4 py-3 font-normal leading-7" placeholder={'Write your article here.\n\nUse a blank line to start a new paragraph.'} /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold text-[#43503f]">Status<select value={form.status} onChange={(event) => update("status", event.target.value)} className="mt-2 w-full rounded-xl border border-[#dcd5c5] bg-white px-4 py-3 font-normal"><option value="draft">Draft — private</option><option value="published">Published — public</option></select></label><label className="block text-sm font-semibold text-[#43503f]">Cover image<span className="mt-2 flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#9baa99] bg-[#f5f7f2] font-normal text-[#58715d]"><ImagePlus size={17} /> Choose image</span><input type="file" accept="image/*" onChange={chooseImage} className="sr-only" /></label></div>{form.coverImage && <img src={form.coverImage} alt="Cover preview" className="h-44 w-full rounded-xl object-cover" />}<button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#314b3b] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving ? <Loader size={17} className="animate-spin" /> : editingId ? <Save size={17} /> : <Plus size={17} />} {editingId ? "Save changes" : "Create story"}</button></div></form>
      <div><h3 className="font-serif text-2xl text-[#27352b]">Your stories</h3>{loading ? <Loader className="mt-8 animate-spin text-[#6f856c]" /> : posts.length ? <div className="mt-4 space-y-3">{posts.map((post) => <article key={post._id} className="rounded-2xl border border-[#e1dacb] bg-white p-5 shadow-sm"><div className="flex gap-4">{post.coverImage?.url ? <img src={post.coverImage.url} alt="" className="h-20 w-20 rounded-xl object-cover" /> : <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#e7eee3] text-[#6f856c]"><FileText /></span>}<div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] ${post.status === "published" ? "bg-[#e2eee1] text-[#4d6c53]" : "bg-[#efeee9] text-[#777a75]"}`}>{post.status}</span><span className="text-xs text-[#858c85]">{post.category}</span></div><h4 className="mt-2 truncate font-serif text-xl text-[#27352b]">{post.title}</h4></div></div><div className="mt-4 flex gap-2"><button onClick={() => edit(post)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#6f856c] px-4 py-2 text-sm font-semibold text-[#526b57]"><Edit3 size={15} /> Edit</button><button onClick={() => remove(post)} className="inline-flex items-center justify-center rounded-full border border-[#d6b7b0] px-4 py-2 text-[#895149]" aria-label={`Delete ${post.title}`}><Trash2 size={15} /></button></div></article>)}</div> : <div className="mt-4 rounded-2xl border border-dashed border-[#cfc8ba] bg-white/60 p-10 text-center text-sm text-[#687064]">Your first journal story is ready to be written.</div>}</div>
    </div>
  </section>;
};

const Field = ({ label, value, onChange, placeholder, required }) => <label className="block text-sm font-semibold text-[#43503f]">{label}<input required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-[#dcd5c5] px-4 py-3 font-normal" /></label>;
export default JournalTab;

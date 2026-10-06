import { ShoppingCart, UserPlus, LogIn, LogOut, Lock, Search, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useUserStore } from '../stores/useUserStore';
import { useCartStore } from '../stores/useCartStore';
import axios from '../lib/axios';

const Navbar = () => {
    const { user, logout } = useUserStore();
    const isAdmin = user?.role === "admin";
    const { cart } = useCartStore();
    const navigate = useNavigate();
    const searchRef = useRef(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    useEffect(() => { if (query.trim().length < 2) { setSuggestions([]); return; } const timer = setTimeout(() => axios.get("/products/search/suggestions", { params: { q: query.trim() } }).then(({ data }) => setSuggestions(data.suggestions || [])).catch(() => setSuggestions([])), 250); return () => clearTimeout(timer); }, [query]);
    useEffect(() => { const close = (event) => { if (!searchRef.current?.contains(event.target)) { setSearchOpen(false); setSuggestions([]); } }; document.addEventListener("mousedown", close); return () => document.removeEventListener("mousedown", close); }, []);
    const submitSearch = (event) => { event.preventDefault(); const value = query.trim(); navigate(value ? `/search?q=${encodeURIComponent(value)}` : "/search"); setSearchOpen(false); setSuggestions([]); };

  return (

    <header className='fixed top-0 left-0 w-full bg-[#fcfaf5]/95 backdrop-blur-md shadow-sm z-40 transition-all duration-300 border-b border-[#e1dacb]'>

    <div className='container mx-auto px-4 py-3'>
        <div className='flex justify-between items-center gap-3'>
        <Link to='/' className='flex shrink-0 items-center font-serif text-xl font-bold tracking-tight text-[#27352b] sm:text-2xl'>
        Stewart-Tate <span className='text-[#B58A34]'>&amp; Co.</span>
        </Link>

        <nav className='flex items-center gap-2 sm:gap-4'>

        <Link to={"/"} className='hidden text-[#596259] hover:text-[#B58A34] transition duration-300 ease-in-out sm:inline'>
        Home
        </Link>
        <Link to="/journal" className='hidden text-[#596259] hover:text-[#B58A34] transition duration-300 ease-in-out md:inline'>Journal</Link>
        <div ref={searchRef} className="relative"><button onClick={() => setSearchOpen((open) => !open)} aria-label="Search products" className="flex items-center gap-1 text-[#596259] transition hover:text-[#B58A34]"><Search size={20} /><span className="hidden lg:inline">Search</span></button>{searchOpen && <div className="fixed left-3 right-3 top-[4.5rem] rounded-2xl border border-[#ddd6c8] bg-white p-3 shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-10 sm:w-[390px]"><form onSubmit={submitSearch} className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7c9279]" size={17} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} maxLength="100" placeholder="Search the collective" className="w-full rounded-full border border-[#d8d2c5] py-2.5 pl-10 pr-10 text-sm outline-none focus:ring-4 focus:ring-[#e6eee3]" /><button type="button" onClick={() => { setQuery(""); setSuggestions([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b8e88]" aria-label="Clear search"><X size={16} /></button></form>{suggestions.length > 0 && <div className="mt-3 divide-y divide-[#eee9de]">{suggestions.map((product) => <Link key={product._id} to={`/products/${product._id}`} onClick={() => { setSearchOpen(false); setSuggestions([]); }} className="flex items-center gap-3 py-3"><img src={product.images?.[0] || product.image} alt="" className="h-12 w-12 rounded-xl object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#354139]">{product.name}</p><p className="text-xs capitalize text-[#858c85]">{product.brand?.replaceAll("-", " ")} · ${Number(product.price).toFixed(2)}</p></div></Link>)}</div>}<button onClick={submitSearch} className="mt-2 w-full rounded-full bg-[#314b3b] py-2.5 text-sm font-semibold text-white">View all results</button></div>}</div>
        { user && (
            <Link
             to={"/cart"}
            className='relative group text-[#596259] hover:text-[#B58A34] transition
            duration-300
            ease-in-out'
            >
                <ShoppingCart className='inline-block mr-1 group-hover:text-[#B58A34]'
                size={20} />
                <span className='hidden sm:inline'>Cart</span>
                {cart.length > 0 && (
                <span
                className='absolute -top-2 -left-2 bg-[#B58A34] text-white rounded-full px-2 py-0.5 text-xs transition duration-300 ease-in-out'
                >
                    {cart.length}
                </span>
                )}
            </Link>
        )}
        { isAdmin && (
            <Link to="/secret-dashboard" className='bg-[#6f856c] hover:bg-[#586d55] text-white px-3 py-1 rounded-md font-medium transition duration-300
            ease-in-out flex items-center'>
                <Lock className='inline-block mr-1' size={18} />
                <span className='hidden sm:inline'>Dashboard</span>
            </Link>
        )}

        {user ? (
            <>
            <Link to="/account" className="flex items-center gap-2 rounded-full border border-[#d8d2c5] bg-white p-1 pr-2 text-sm font-semibold text-[#43503f] transition hover:border-[#7c9279] sm:pr-3" aria-label="View account profile">
                <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#dfe8db] text-xs font-bold text-[#506657]">
                    {user.profilePicture?.url ? <img src={user.profilePicture.url} alt="" className="h-full w-full object-cover" /> : user.name?.charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-28 truncate sm:inline">{user.name}</span>
            </Link>
            <button onClick={logout} aria-label="Log out" className='bg-[#27352b] hover:bg-[#435641] text-white p-2 sm:py-2 sm:px-4
            rounded-md flex items-center transition duration-300 ease-in-out'>
                <LogOut size={18} />
                <span className='hidden sm:inline ml-2'>Log Out</span>
            </button>
            </>
        ) : (
            <>
            <Link to={"/signup"} aria-label="Sign up" className='bg-[#6f856c] hover:bg-[#586d55] text-white
            p-2 sm:py-2 sm:px-4 rounded-md flex items-center transition duration-300 ease-in-out'
                >
                <UserPlus className='sm:mr-2' size={18} />
                <span className='hidden sm:inline'>Sign Up</span>
            </Link>
            <Link
                to={"/login"}
                aria-label="Log in"
                className='bg-[#6f856c] hover:bg-[#586d55] text-white p-2 sm:py-2 sm:px-4 rounded-md
                flex items-center transition duration-300 ease-in-out'
            >
                <LogIn className='sm:mr-2' size={18} />
                <span className='hidden sm:inline'>Log In</span>
            </Link>
            </>
        )}
        </nav>
        </div>
    </div>
        </header>
  )
}

export default Navbar

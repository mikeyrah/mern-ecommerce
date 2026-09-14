import React, { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../stores/useCartStore';

const FeaturedProducts = ({ featuredProducts }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(4);
    const { addToCart } = useCartStore();
    const products = featuredProducts || [];

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) setItemsPerPage(1);
            else if (window.innerWidth < 1024) setItemsPerPage(2);
            else if (window.innerWidth < 1280) setItemsPerPage(3);
            else setItemsPerPage(4);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // A viewport change can alter how many cards fit on screen. Keep the
    // carousel index within the new valid range so it never shows a blank row.
    useEffect(() => {
        setCurrentIndex((index) => Math.min(index, Math.max(products.length - itemsPerPage, 0)));
    }, [itemsPerPage, products.length]);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => Math.min(prevIndex + itemsPerPage, Math.max(products.length - itemsPerPage, 0)));
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => Math.max(prevIndex - itemsPerPage, 0));
    };

    const isStartDisabled = currentIndex === 0;
    const isEndDisabled = currentIndex >= Math.max(products.length - itemsPerPage, 0);

    return (
        <div className='py-12'>
            <div className='container mx-auto px-4'>
                <h2 className='text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4'>Featured Products</h2>
                <div className='relative'>
                    <div className='overflow-hidden'>
                        <div
                            className='flex transition-transform duration-300 ease-in-out'
                            style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
                        >
                            {products.map((product) => (
                                <div
                                    key={product._id}
                                    className='w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 flex-shrink-0 p-2'
                                >
                                    <div className='bg-white bg-opacity-10 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden h-full transition-all duration-300 hover:shadow-xl border border-emerald-500/30'>
                                        <div className='overflow-hidden'>
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className='w-full h-48 object-cover transition-transform duration-300 ease-in-out hover:scale-110'
                                            />
                                            <div className='p-4'>
                                                <h3 className='text-lg font-semibold text-white'>{product.name}</h3>
                                                <p className='text-emerald-600 font-medium mb-4'>
                                                    ${Number(product.price || 0).toFixed(2)}
                                                </p>
                                                <button
                                                    onClick={() => addToCart(product)}
                                                    className='w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-4 rounded transition-colors duration-300 flex items-center justify-center'
                                                >
                                                    <ShoppingCart className='w-5 h-5 mr-2' />
                                                    Add to Cart
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='mt-6 flex justify-center gap-4'>
                        <button
                            onClick={prevSlide}
                            disabled={isStartDisabled}
                            className='rounded border border-emerald-400 px-4 py-2 text-sm font-medium text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50'
                        >
                            Previous
                        </button>
                        <button
                            onClick={nextSlide}
                            disabled={isEndDisabled || products.length <= itemsPerPage}
                            className='rounded bg-emerald-500 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-emerald-300'
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeaturedProducts;

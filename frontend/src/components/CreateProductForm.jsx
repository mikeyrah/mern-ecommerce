import React from 'react'
import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Upload, Loader } from "lucide-react";
import { useProductStore } from '../stores/useProductStore';
import { botaniCollections } from '../data/brands';

const categoriesByBrand = {
    "botani-eve": botaniCollections.map(({ slug, label }) => ({ value: slug, label })),
    "the-krafted-charm": ["jeans", "t-shirts", "shoes", "glasses", "jackets", "suits", "bags"].map((value) => ({ value, label: value.replaceAll("-", " ") })),
    "the-velvet-bakery": ["cakes", "cookies", "treats"].map((value) => ({ value, label: value })),
};
const brands = [
    { value: "botani-eve", label: "Botani Eve" },
    { value: "the-krafted-charm", label: "The Krafted Charm" },
    { value: "the-velvet-bakery", label: "The Velvet Bakery" },
];

const CreateProductForm = () => {
    const [newProduct, setNewProduct] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        brand: "the-krafted-charm",
        image: "",
    });

    const {createProduct, loading} = useProductStore();
    const availableCategories = categoriesByBrand[newProduct.brand] || [];

    const handleSubmit = async (e) => {
        e.preventDefault();
       try {
        await createProduct(newProduct);
        setNewProduct({ name: "", description: "", price: "", category: "", brand: "the-krafted-charm", image: "" });
       } catch {
        console.log("error creating a product");
       }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if(file) {
            const reader = new FileReader();

            reader.onloadend = () => {
                setNewProduct({ ...newProduct, image: reader.result });
            }

            reader.readAsDataURL(file);
        }
    }

  return (
    <motion.div
    className='admin-form bg-white shadow-[0_12px_30px_rgba(68,62,45,0.08)] border border-[#e1dacb] rounded-2xl p-8 mb-8 max-w-xl mx-auto'
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    >
        <h2 className='font-serif text-3xl font-semibold mb-2 text-[#27352b]'>Create a new product</h2><p className='mb-6 text-sm text-[#687064]'>Choose the brand collection where this item belongs.</p>

        <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
                <label htmlFor='brand' className='block text-sm font-medium text-gray-300'>Brand</label>
                <select
                id='brand'
                value={newProduct.brand}
                onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value, category: "" })}
                className='mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                >
                    {brands.map((brand) => <option key={brand.value} value={brand.value}>{brand.label}</option>)}
                </select>
            </div>

            <div>
                <label htmlFor='name' className='block text-sm font-medium text-gray-300'>
                    Product Name
                </label>
                <input
                type='text'
                id='name'
                name='name'
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className='mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-
                focus:outline-none focus:ring-emerald-500 focus:border-emerald-500'
                required
                />
            </div>

            <div>
                <label htmlFor='description' className='block text-sm font-medium text-gray-300'>
                    Description
                </label>
                <textarea
                id='description'
                name='description'
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                rows='3'
                className='mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm px-3 text-
                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500' 
                required
                />
            </div>

            <div>
                <label htmlFor='price' className='block text-sm font-medium text-gray-300'>
                    Price
                </label>
                <input
                type='number'
                id='price'
                name='price'
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                step='0.01'
                className='mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-
                focus:outline-none focus: ring-2 focus: ring-emerald-500 focus:border-emerald-500'
                required
                />
            </div>

            <div>
                <label htmlFor='category' className='block text-sm font-medium text-gray-300'>
                    Category
                </label>
                <select
                id='category'
                name='categry'
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className='mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md
                shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500
                focus:border-emerald-500'
                required
                >
                    <option value=''>Select a category</option>
                    {availableCategories.map((category) => (
                        <option key={category.value} value={category.value}>
                            {category.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className='mt-1 flex items-center'>
                <input type='file' id='image' className='sr-only' accept='image/*'
                    onChange={handleImageChange}
                />
                <label
                htmlFor='image'
                className='cursor-pointer bg-gray-700 py-2 px-3 border border-gray-600 rounded-md shadow-sm text-sm
                leading-4 font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-0
                focus:ring-emerald-500'
                >
                    <Upload className='h-5 w-5 inline-block mr-2' />
                    Upload Image
                </label>
                {newProduct.image && <span className='ml-3 text-sm text-gray-400'>Image uploaded</span>}
            </div>

            <button
            type='submit'
            className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm
            font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2
            focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50'
            disabled={loading}
            >
                {loading ? (
                    <>
                    <Loader className='mr-2 h-5 w-5 animate-spin' aria-hidden='true' />
                    Loading...
                    </>
                ) : (
                    <>
                    <PlusCircle className='mr-2 h-5 w-5' />
                    Create Product
                    </>
                )}
            </button>
        </form>
    </motion.div>
  )
}

export default CreateProductForm

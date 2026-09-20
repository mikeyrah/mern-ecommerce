import React, { useState } from 'react'
import { motion } from "framer-motion";
import { Pencil, Trash, Star } from "lucide-react";
import { useProductStore } from '../stores/useProductStore';
import EditProductModal from './EditProductModal';

const ProductsList = () => {
    const { deleteProduct, toggleFeaturedProduct, products } = useProductStore();
    const [editingProduct, setEditingProduct] = useState(null);

  return (
    <motion.div
    className='admin-table bg-white shadow-[0_12px_30px_rgba(68,62,45,0.08)] border border-[#e1dacb] rounded-2xl overflow-hidden max-w-6xl mx-auto'
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    >

        <div className="overflow-x-auto">
        <table className='min-w-full divide-y divide-gray-700'>
            <thead className='bg-gray-700'>
                <tr>
                    <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'
                    >
                        Product
                    </th>
                    <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'
                    >
                        Price
                    </th>
                    <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'
                    >
                        Category
                    </th>
                    <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'
                    >
                        Featured
                    </th>
                    <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'
                    >
                        Actions
                    </th>
                </tr>
            </thead>

            <tbody className='bg-gray-800 divide-y divide-gray-700'>
                {products?.map((product) => (
                    <tr key={product._id} className='hover:bg-gray-700'>
                        <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='flex items-center'>
                                <div className='flex-shrink-0 h-10 w-10'>
                                    <img
                                    className='h-10 w-10 rounded-full object-cover'
                                        src={product.image}
                                        alt={product.name}
                                        />
                                        </div>
                                        <div className='ml-4'>
                                            <div className='text-sm font-medium text-white'>{product.name}</div>
                                        </div>
                                        </div>
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap'>
                                            <div className='text-sm text-gray-300'>${product.price.toFixed(2)}</div>
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap'>
                                            <div className='text-sm text-gray-300'>{product.category}</div>
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap'>
                                            <button
                                            onClick={() => toggleFeaturedProduct(product._id)}
                                            className={`p-1 rounded-full ${
                                                product.isFeatured ? "bg-yellow-400 text-gray-900" : "bg-gray-600 text-gray-300"
                                                } hover:bg-yellow-500 transition-colors duration-200`}
                                                >
                                                    <Star className='h-5 w-5' />
                                                </button>
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                                            <div className="flex items-center gap-3">
                                            <button
                                            onClick={() => setEditingProduct(product)}
                                            className='text-[#6f856c] hover:text-[#435641]'
                                            aria-label={`Edit ${product.name}`}
                                            >
                                                <Pencil className='h-5 w-5' />
                                            </button>
                                            <button
                                            onClick={() => deleteProduct(product._id)}
                                            className='text-red-400 hover:text-red-300'
                                            aria-label={`Delete ${product.name}`}
                                            >
                                                <Trash className='h-5 w-5' />
                                            </button>
                                            </div>
                                        </td>
                                        </tr>
                ))}
            </tbody>
        </table>
        </div>
        {editingProduct && <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} />}
    </motion.div>
  );
};

export default ProductsList

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';
import axios from '../lib/axios';

const PeopleAlsoBought = () => {
  const [recommendations, setRecommendations] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await axios.get("/products/recommendations");
        setRecommendations(res.data.products);
      
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to load recommendations");
      } finally{
        setIsLoading(false)
      }
    }

    fetchRecommendations()
  },[]);

  if(isLoading) return <LoadingSpinner />;

  return (
    <section className='mt-14 border-t border-[#ded8ca] pt-10'>
      <p className='text-xs font-bold uppercase tracking-[0.22em] text-[#78907b]'>A little more to love</p>
      <h3 className='mt-2 font-serif text-3xl text-[#27352b]'>You may also enjoy</h3>
      <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {recommendations.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
        </div> 
    </section>
  )
}

export default PeopleAlsoBought

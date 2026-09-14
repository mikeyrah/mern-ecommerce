import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const PurchaseCancelPage = () => {
  return (
    <div className='min-h-screen flex items-center justify-center px-4'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='max-w-md w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden relative z-10'
      >
        <div className='p-6 sm:p-8'>
          <div className='flex justify-center'>
            <XCircle className='text-red-400 w-16 h-16 mb-4' />
          </div>
          <h1 className='text-2xl sm:text-3xl font-bold text-center text-red-500 mb-2'>
            Purchase Cancelled
          </h1>
          <p className='text-gray-300 text-center mb-6'>
            Your purchase was not completed. You can try again or continue shopping.
          </p>
          <div className='bg-gray-700 rounded-lg p-4 mb-6'>
            <p className='text-sm text-gray-400 text-center'>
              If you have any questions or issues, please contact our support team.
            </p>
          </div>
          <div className='space-y-4'>
            <Link
              to='/'
              className='w-full bg-gray-700 hover:bg-gray-600 text-red-400 font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center'
            >
              Continue Shopping
              <ArrowLeft className='ml-2' size={18} />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PurchaseCancelPage;  

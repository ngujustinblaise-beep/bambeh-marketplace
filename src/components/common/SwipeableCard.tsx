import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Heart, X, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

interface SwipeableCardProps {
  id: string; image: string; title: string; price: number;
  onLike?: () => void; onSkip?: () => void; onAddToCart?: () => void;
}

const SwipeableCard = ({ id, image, title, price, onLike, onSkip, onAddToCart }: SwipeableCardProps) => {
  const [exitX, setExitX] = useState(0);
  const x       = useMotionValue(0);
  const rotate  = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (_event: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      setExitX(info.offset.x > 0 ? 200 : -200);
      if (info.offset.x > 0) { onLike?.(); } else { onSkip?.(); }
    }
  };

  return (
    <motion.div className="absolute w-full h-full cursor-grab active:cursor-grabbing" style={{ x, rotate, opacity }}
      drag="x" dragConstraints={{ left: 0, right: 0 }} onDragEnd={handleDragEnd}
      animate={{ x: exitX }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden h-full">
        <div className="relative h-2/3">
          <img src={image} alt={title} className="w-full h-full object-cover" />
          <motion.div className="absolute inset-0 bg-gradient-to-r from-red-500/80 to-transparent flex items-center justify-start pl-8" style={{ opacity: useTransform(x, [-200, 0], [1, 0]) }}>
            <X className="w-24 h-24 text-white" />
          </motion.div>
          <motion.div className="absolute inset-0 bg-gradient-to-l from-green-500/80 to-transparent flex items-center justify-end pr-8" style={{ opacity: useTransform(x, [0, 200], [0, 1]) }}>
            <Heart className="w-24 h-24 text-white" />
          </motion.div>
        </div>
        <div className="p-6 h-1/3">
          <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{title}</h3>
          <p className="text-3xl font-bold text-teal-600 mb-4">{price.toLocaleString()} XAF</p>
          <div className="flex gap-2">
            <button onClick={onSkip} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg flex items-center justify-center gap-2"><X className="w-5 h-5" /><span>Skip</span></button>
            <button onClick={onAddToCart} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"><ShoppingCart className="w-5 h-5" /><span>Cart</span></button>
            <button onClick={onLike} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"><Heart className="w-5 h-5" /><span>Like</span></button>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center">
        <p className="text-sm text-gray-500">← Swipe to skip | Swipe to like →</p>
      </div>
    </motion.div>
  );
};

export default SwipeableCard;






/**
 * CART BUTTON COMPONENT
 */

import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';

interface CartButtonProps { onClick: () => void; className?: string; }

export default function CartButton({ onClick, className = '' }: CartButtonProps) {
  const { totalItems } = useCart();
  if (totalItems === 0) return null;
  return (
    <Button onClick={onClick} className={`fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full shadow-lg bg-teal-600 hover:bg-teal-700 flex items-center justify-center transition-all duration-200 hover:scale-110 ${className}`}>
      <div className="relative">
        <ShoppingCart className="w-6 h-6 text-white" />
        <Badge className="absolute -top-2 -right-2 bg-red-500 text-white min-w-[20px] h-5 flex items-center justify-center p-0 text-xs">
          {totalItems > 99 ? '99+' : totalItems}
        </Badge>
      </div>
    </Button>
  );
}

interface HeaderCartButtonProps { onClick: () => void; }

export function HeaderCartButton({ onClick }: HeaderCartButtonProps) {
  const { totalItems } = useCart();
  return (
    <button onClick={onClick} className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
      <ShoppingCart className="w-6 h-6 text-gray-700" />
      {totalItems > 0 && (
        <Badge className="absolute -top-1 -right-1 bg-teal-600 text-white min-w-[18px] h-[18px] flex items-center justify-center p-0 text-[10px]">
          {totalItems > 99 ? '99+' : totalItems}
        </Badge>
      )}
    </button>
  );
}



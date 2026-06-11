import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, ShoppingCart, Minus, Plus, Trash2, ArrowRight, Package } from "lucide-react";

export interface CartItem {
  id: string; name: string; price: number; quantity: number;
  image?: string; category?: string; sellerId?: string;
}
interface CartCtx {
  items: CartItem[]; isOpen: boolean;
  openCart: () => void; closeCart: () => void; toggleCart: () => void;
  addToCart: (i: Omit<CartItem,"quantity"> & {quantity?:number}) => void;
  removeFromCart: (id:string) => void; updateQuantity: (id:string,q:number) => void;
  clearCart: () => void; getTotal: () => number; getItemCount: () => number;
}
const Ctx = createContext<CartCtx|null>(null);
export function useCart(){ const c=useContext(Ctx); if(!c) throw new Error("useCart outside CartProvider"); return c; }

function load():CartItem[]{ try{ const r=localStorage.getItem("bambeh_cart"); return r?JSON.parse(r):[]; }catch{ return []; } }
function save(i:CartItem[]){ try{ localStorage.setItem("bambeh_cart",JSON.stringify(i)); }catch{} }

export function CartProvider({children}:{children:React.ReactNode}){
  const [items,setItems]=useState<CartItem[]>(load);
  const [isOpen,setIsOpen]=useState(false);
  useEffect(()=>{ save(items); },[items]);
  const openCart=useCallback(()=>setIsOpen(true),[]);
  const closeCart=useCallback(()=>setIsOpen(false),[]);
  const toggleCart=useCallback(()=>setIsOpen(v=>!v),[]);
  const addToCart=useCallback((item:Omit<CartItem,"quantity">&{quantity?:number})=>{
    setItems(prev=>{ const e=prev.find(i=>i.id===item.id);
      if(e) return prev.map(i=>i.id===item.id?{...i,quantity:i.quantity+(item.quantity??1)}:i);
      return [...prev,{...item,quantity:item.quantity??1}]; }); },[]);
  const removeFromCart=useCallback((id:string)=>setItems(p=>p.filter(i=>i.id!==id)),[]);
  const updateQuantity=useCallback((id:string,q:number)=>{
    if(q<=0) setItems(p=>p.filter(i=>i.id!==id));
    else setItems(p=>p.map(i=>i.id===id?{...i,quantity:q}:i)); },[]);
  const clearCart=useCallback(()=>setItems([]),[]);
  const getTotal=useCallback(()=>items.reduce((s,i)=>s+i.price*i.quantity,0),[items]);
  const getItemCount=useCallback(()=>items.reduce((s,i)=>s+i.quantity,0),[items]);
  return <Ctx.Provider value={{items,isOpen,openCart,closeCart,toggleCart,addToCart,removeFromCart,updateQuantity,clearCart,getTotal,getItemCount}}>{children}</Ctx.Provider>;
}

function fmt(n:number){ return new Intl.NumberFormat("fr-CM",{maximumFractionDigits:0}).format(n)+" XAF"; }

export function CartDrawer(){
  const navigate=useNavigate();
  const {items,isOpen,closeCart,updateQuantity,removeFromCart,getTotal,getItemCount}=useCart();
  useEffect(()=>{ document.body.style.overflow=isOpen?"hidden":""; return()=>{ document.body.style.overflow=""; }; },[isOpen]);
  useEffect(()=>{ if(!isOpen) return; const f=(e:KeyboardEvent)=>{ if(e.key==="Escape") closeCart(); }; document.addEventListener("keydown",f); return()=>document.removeEventListener("keydown",f); },[isOpen,closeCart]);
  const go=useCallback(()=>{ closeCart(); navigate("/cart"); },[navigate,closeCart]);
  if(!isOpen) return null;
  return <>
    <div className="fixed inset-0 z-40 bg-black/40" onClick={closeCart} />
    <div role="dialog" aria-modal="true" className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col">
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-teal-600"/>
          <h2 className="text-base font-bold text-gray-900">Cart {getItemCount()>0&&<span className="ml-2 text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">{getItemCount()}</span>}</h2>
        </div>
        <button type="button" onClick={closeCart} className="p-2 rounded-full hover:bg-gray-100"><X className="w-5 h-5"/></button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {items.length===0?<div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mb-4"/>
          <p className="font-semibold text-gray-700 mb-1">Your cart is empty</p>
          <button type="button" onClick={()=>{ closeCart(); navigate("/marketplace"); }} className="mt-4 px-5 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl">Browse Marketplace</button>
        </div>:<ul className="divide-y divide-gray-50 px-4 py-2">
          {items.map(item=><li key={item.id} className="py-4 flex gap-3">
            <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
              {item.image?<img src={item.image} alt={item.name} className="w-full h-full object-cover"/>:<ShoppingCart className="w-6 h-6 text-gray-300 m-auto"/>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
              <p className="text-sm font-bold text-teal-600 mb-2">{fmt(item.price)}</p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={()=>updateQuantity(item.id,item.quantity-1)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center"><Minus className="w-3.5 h-3.5"/></button>
                <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                <button type="button" onClick={()=>updateQuantity(item.id,item.quantity+1)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center"><Plus className="w-3.5 h-3.5"/></button>
                <button type="button" onClick={()=>removeFromCart(item.id)} className="ml-auto p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
              </div>
            </div>
          </li>)}
        </ul>}
      </div>
      {items.length>0&&<div className="border-t border-gray-100 px-4 py-4 space-y-3">
        <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Total</span><span className="text-lg font-black">{fmt(getTotal())}</span></div>
        <button type="button" onClick={go} className="w-full flex items-center justify-center gap-2 py-3.5 bg-teal-600 text-white font-bold rounded-2xl">Proceed to Checkout <ArrowRight className="w-4 h-4"/></button>
        <button type="button" onClick={closeCart} className="w-full py-2.5 text-sm text-gray-500">Continue Shopping</button>
      </div>}
    </div>
  </>;
}

export default CartDrawer;

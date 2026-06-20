import { useLang, t } from "@/hooks/useAppLang";

import{useState}from'react';
import{useNavigate}from'react-router-dom';
import{ArrowLeft,Plus,Search,Package,Eye,Edit3,Trash2,ToggleLeft,ToggleRight,Filter}from'lucide-react';

interface Product{id:string;name:string;price:number;stock:number;category:string;status:'active'|'paused'|'out';sales:number;views:number;}

const SAMPLE:Product[]=[
  {id:'1',name:'iPhone 13 Pro Max',price:450000,stock:3,category:'Electronics',status:'active',sales:12,views:234},
  {id:'2',name:'Samsung TV 55"',price:280000,stock:1,category:'Electronics',status:'active',sales:8,views:189},
  {id:'3',name:'Designer Handbag',price:85000,stock:0,category:'Fashion',status:'out',sales:5,views:95},
  {id:'4',name:'Blender Pro',price:35000,stock:8,category:'Appliances',status:'active',sales:15,views:312},
  {id:'5',name:'School Uniform Set',price:25000,stock:20,category:'Fashion',status:'paused',sales:30,views:567},
];

export default function VendorProducts(){
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate=useNavigate();
  const[products,setProducts]=useState<Product[]>(SAMPLE);
  const[search,setSearch]=useState('');
  const[cat,setCat]=useState('All');
  const cats=['All',...Array.from(new Set(SAMPLE.map(p=>p.category)))];

  const filtered=products.filter(p=>{
    const matchSearch=!search||p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat=cat==='All'||p.category===cat;
    return matchSearch&&matchCat;
  });

  function toggleStatus(id:string){
    setProducts(prev=>prev.map(p=>{
      if(p.id!==id)return p;
      return {...p,status:p.status==='active'?'paused':'active'};
    }));
  }
  function deleteProduct(id:string){
    if(!window.confirm('Delete this product?'))return;
    setProducts(prev=>prev.filter(p=>p.id!==id));
  }

  const totalRevenue=products.reduce((s,p)=>s+p.price*p.sales,0);

  return(
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={()=>navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl"><ArrowLeft className="w-5 h-5"/></button>
        <h2 className="font-semibold text-gray-900 flex-1">Products</h2>
        <button onClick={()=>navigate('/post-item')} className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-1"><Plus className="w-4 h-4"/>Add</button>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2 mb-1">
          {[[products.length,'Products'],[products.reduce((s,p)=>s+p.sales,0),'Sales'],[Math.round(totalRevenue/1000)+'k XAF','Revenue']].map(([v,l])=>(
            <div key={String(l)} className="bg-white rounded-xl p-3 shadow-sm border text-center">
              <p className="font-bold text-gray-900 text-sm">{String(v)}</p>
              <p className="text-xs text-gray-500">{String(l)}</p>
            </div>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {cats.map(c=>(
            <button key={c} onClick={()=>setCat(c)} className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${cat===c?'bg-blue-600 text-white':'bg-white border text-gray-600'}`}>{c}</button>
          ))}
        </div>

        {filtered.length===0?(
          <div className="text-center py-12 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300"/>
            <p>No products found</p>
            <button onClick={()=>navigate('/post-item')} className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold">Add Product</button>
          </div>
        ):(
          <div className="space-y-2">
            {filtered.map(product=>(
              <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-gray-400"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.category}</p>
                    <p className="text-teal-600 font-bold text-sm">{product.price.toLocaleString()} XAF</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${product.status==='active'?'bg-green-50 text-green-700':product.status==='out'?'bg-red-50 text-red-700':'bg-yellow-50 text-yellow-700'}`}>
                      {product.status==='out'?'Out of Stock':product.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">Stock: {product.stock}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3"/>{product.views} views</span>
                  <span>{product.sales} sold</span>
                </div>
                <div className="flex items-center gap-2">
                  {product.status!=='out'&&(
                    <button onClick={()=>toggleStatus(product.id)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${product.status==='active'?'bg-yellow-50 text-yellow-700':'bg-green-50 text-green-700'}`}>
                      {product.status==='active'?<><ToggleRight className="w-3.5 h-3.5"/>Pause</>:<><ToggleLeft className="w-3.5 h-3.5"/>Activate</>}
                    </button>
                  )}
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700">
                    <Edit3 className="w-3.5 h-3.5"/>Edit
                  </button>
                  <button onClick={()=>deleteProduct(product.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 ml-auto">
                    <Trash2 className="w-3.5 h-3.5"/>Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



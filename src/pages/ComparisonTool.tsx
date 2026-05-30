import{useState,useEffect}from'react';
import{useNavigate}from'react-router-dom';
import{ArrowLeft,Plus,X,Check,Star,TrendingUp,ShoppingCart}from'lucide-react';

interface Product{
  id:string;name:string;price:number;category:string;image?:string;
  rating:number;reviews:number;seller:string;location:string;
  specs:Record<string,string>;pros:string[];cons:string[];
  valueScore:number;qualityScore:number;sellerRating:number;
}

const SAMPLE:Product[]=[
  {id:'1',name:'Samsung Galaxy A54',price:185000,category:'Electronics',rating:4.5,reviews:234,seller:'TechShop CM',location:'Yaounde',specs:{RAM:'8GB',Storage:'256GB',Battery:'5000mAh',Screen:'6.4"'},pros:['Great camera','Long battery','Good value'],cons:['No fast charging'],valueScore:88,qualityScore:85,sellerRating:4.7},
  {id:'2',name:'Tecno Camon 20',price:145000,category:'Electronics',rating:4.2,reviews:189,seller:'Mobile Zone',location:'Douala',specs:{RAM:'8GB',Storage:'128GB',Battery:'5000mAh',Screen:'6.67"'},pros:['Affordable','Big screen','Good camera'],cons:['Average build quality'],valueScore:82,qualityScore:75,sellerRating:4.4},
  {id:'3',name:'iPhone 13',price:420000,category:'Electronics',rating:4.8,reviews:456,seller:'Apple Dealer CM',location:'Yaounde',specs:{RAM:'4GB',Storage:'128GB',Battery:'3227mAh',Screen:'6.1"'},pros:['Best performance','Premium build','Great ecosystem'],cons:['Expensive','Small battery'],valueScore:75,qualityScore:96,sellerRating:4.9},
];

export default function ComparisonTool(){
  const navigate=useNavigate();
  const[products,setProducts]=useState<Product[]>(SAMPLE.slice(0,2));
  const[localProducts,setLocalProducts]=useState<Product[]>([]);
  const[showPicker,setShowPicker]=useState(false);
  const[search,setSearch]=useState('');

  useEffect(()=>{
    try{
      const stored=localStorage.getItem('bambeh_marketplace_items');
      if(stored){
        const items=JSON.parse(stored);
        const mapped:Product[]=items.map((p:any)=>({
          id:p.id,name:p.title||p.name,price:+p.price||0,
          category:p.category||'Other',rating:p.rating||4.0,
          reviews:p.reviews||0,seller:p.seller||'Bambeh Seller',
          location:p.location||'',
          specs:{Category:p.category,Condition:p.condition||'Good'},
          pros:['Available now'],cons:[],
          valueScore:70,qualityScore:70,sellerRating:p.sellerRating||4.0,
        }));
        setLocalProducts(mapped);
      }
    }catch{}
  },[]);

  const allAvailable=[...SAMPLE,...localProducts].filter(p=>!products.find(c=>c.id===p.id));
  const filtered=allAvailable.filter(p=>!search||p.name.toLowerCase().includes(search.toLowerCase()));

  function addProduct(p:Product){setProducts(prev=>[...prev,p].slice(0,3));setShowPicker(false);setSearch('');}
  function removeProduct(id:string){setProducts(prev=>prev.filter(p=>p.id!==id));}

  // All unique spec keys
  const allSpecs=Array.from(new Set(products.flatMap(p=>Object.keys(p.specs))));

  function bestPrice(){
    if(products.length<2)return null;
    return products.reduce((b,p)=>p.price<b.price?p:b).id;
  }
  function bestRating(){
    if(products.length<2)return null;
    return products.reduce((b,p)=>p.rating>b.rating?p:b).id;
  }
  function bestValue(){
    if(products.length<2)return null;
    return products.reduce((b,p)=>p.valueScore>b.valueScore?p:b).id;
  }

  const bp=bestPrice(),br=bestRating(),bv=bestValue();

  return(
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={()=>navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl"><ArrowLeft className="w-5 h-5"/></button>
        <h2 className="font-semibold text-gray-900 flex-1">Compare Products</h2>
        <TrendingUp className="w-5 h-5 text-teal-600"/>
      </div>

      <div className="p-4">
        {/* Product slots */}
        <div className={`grid gap-3 mb-4 ${products.length===3?'grid-cols-3':'grid-cols-2'}`}>
          {products.map(p=>(
            <div key={p.id} className="bg-white rounded-2xl p-3 shadow-sm border relative">
              <button onClick={()=>removeProduct(p.id)} className="absolute top-2 right-2 w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                <X className="w-3 h-3 text-gray-500"/>
              </button>
              <div className="w-full h-16 bg-gray-50 rounded-xl flex items-center justify-center mb-2">
                <ShoppingCart className="w-6 h-6 text-gray-300"/>
              </div>
              <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight">{p.name}</p>
              <p className="text-sm font-bold text-teal-600 mt-1">{p.price.toLocaleString()} XAF</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400"/>
                <span className="text-xs text-gray-600">{p.rating}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {p.id===bp&&<span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">Best Price</span>}
                {p.id===br&&<span className="text-xs bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded-full font-semibold">Top Rated</span>}
                {p.id===bv&&<span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full font-semibold">Best Value</span>}
              </div>
            </div>
          ))}
          {products.length<3&&(
            <button onClick={()=>setShowPicker(true)} className="bg-white rounded-2xl p-3 shadow-sm border border-dashed border-teal-300 flex flex-col items-center justify-center gap-2 min-h-[120px]">
              <Plus className="w-6 h-6 text-teal-500"/>
              <span className="text-xs text-teal-600 font-medium">Add Product</span>
            </button>
          )}
        </div>

        {showPicker&&(
          <div className="bg-white rounded-2xl p-4 shadow-sm border mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 text-sm">Add a product to compare</h3>
              <button onClick={()=>setShowPicker(false)}><X className="w-4 h-4 text-gray-400"/></button>
            </div>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..." className="w-full border rounded-xl px-3 py-2 text-sm mb-3 focus:ring-2 focus:ring-teal-500 outline-none"/>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filtered.map(p=>(
                <button key={p.id} onClick={()=>addProduct(p)} className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl text-left">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 text-gray-400"/>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-teal-600">{p.price.toLocaleString()} XAF</p>
                  </div>
                </button>
              ))}
              {filtered.length===0&&<p className="text-sm text-gray-500 text-center py-3">No products found</p>}
            </div>
          </div>
        )}

        {products.length>=2&&(
          <>
            {/* Scores */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">Score Comparison</h3>
              {[['Value Score','valueScore'],['Quality Score','qualityScore'],['Seller Rating','sellerRating']].map(([label,key])=>(
                <div key={label} className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <div className="flex gap-2">
                    {products.map(p=>{
                      const val=(p as any)[key];
                      const pct=key==='sellerRating'?(val/5)*100:val;
                      return(
                        <div key={p.id} className="flex-1">
                          <div className="w-full bg-gray-100 rounded-full h-2 mb-0.5">
                            <div className="bg-teal-500 h-2 rounded-full" style={{width:pct+'%'}}/>
                          </div>
                          <p className="text-xs text-gray-600 text-center">{key==='sellerRating'?val+'':val+'%'}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Specs table */}
            {allSpecs.length>0&&(
              <div className="bg-white rounded-2xl p-4 shadow-sm border mb-4">
                <h3 className="font-semibold text-gray-900 mb-3">Specifications</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b">{['Spec',...products.map(p=>p.name.split(' ').slice(0,2).join(' '))].map((h,i)=><th key={i} className="text-left py-2 pr-3 text-gray-500 font-medium">{h}</th>)}</tr></thead>
                    <tbody>
                      {allSpecs.map(spec=>(
                        <tr key={spec} className="border-b last:border-0">
                          <td className="py-2 pr-3 text-gray-500">{spec}</td>
                          {products.map(p=><td key={p.id} className="py-2 pr-3 text-gray-900 font-medium">{p.specs[spec]||''}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pros/Cons */}
            <div className={`grid gap-3 ${products.length===3?'grid-cols-3':'grid-cols-2'}`}>
              {products.map(p=>(
                <div key={p.id} className="bg-white rounded-2xl p-3 shadow-sm border">
                  <p className="text-xs font-semibold text-gray-700 mb-2 truncate">{p.name.split(' ').slice(0,2).join(' ')}</p>
                  {p.pros.map(pro=><div key={pro} className="flex items-center gap-1 mb-1"><Check className="w-3 h-3 text-green-500 flex-shrink-0"/><span className="text-xs text-gray-700">{pro}</span></div>)}
                  {p.cons.map(con=><div key={con} className="flex items-center gap-1 mb-1"><X className="w-3 h-3 text-red-400 flex-shrink-0"/><span className="text-xs text-gray-700">{con}</span></div>)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}


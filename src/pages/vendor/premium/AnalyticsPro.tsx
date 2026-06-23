import { useLang, t } from "@/hooks/useAppLang";

import{useState}from'react';
import{useNavigate}from'react-router-dom';
import{ArrowLeft,TrendingUp,TrendingDown,BarChart2,Users,DollarSign,Eye,ShoppingCart,Star,Calendar}from'lucide-react';

interface Stat{label:string;value:string;change:number;icon:any;color:string;}
interface ChartItem{label:string;value:number;color:string;}
interface Period{label:string;value:string;}

const PERIODS:Period[]=[{label:'7 days',value:'7d'},{label:'30 days',value:'30d'},{label:'90 days',value:'90d'},{label:'1 year',value:'1y'}];

export default function AnalyticsPro(){
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate=useNavigate();
  const[period,setPeriod]=useState('30d');

  const stats:Stat[]=[
    {label:'Revenue',value:'1,250,000 XAF',change:12.5,icon:DollarSign,color:'text-green-600'},
    {label:'Orders',value:'45',change:8.3,icon:ShoppingCart,color:'text-blue-600'},
    {label:'Views',value:'3,840',change:-2.1,icon:Eye,color:'text-purple-600'},
    {label:'Customers',value:'127',change:15.7,icon:Users,color:'text-orange-600'},
    {label:'Avg Rating',value:'4.8',change:0.3,icon:Star,color:'text-yellow-500'},
    {label:'Conversion',value:'1.2%',change:-0.4,icon:TrendingUp,color:'text-teal-600'},
  ];

  const categoryData:ChartItem[]=[
    {label:'Electronics',value:45,color:'#0d9488'},
    {label:'Fashion',value:28,color:'#7c3aed'},
    {label:'Home',value:15,color:'#f59e0b'},
    {label:'Other',value:12,color:'#94a3b8'},
  ];

  const revenueData=[
    {day:'Mon',value:180000},
    {day:'Tue',value:220000},
    {day:'Wed',value:150000},
    {day:'Thu',value:310000},
    {day:'Fri',value:280000},
    {day:'Sat',value:350000},
    {day:'Sun',value:260000},
  ];
  const maxRevenue=Math.max(...revenueData.map(d=>d.value));

  return(
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={()=>navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl"><ArrowLeft className="w-5 h-5"/></button>
        <h2 className="font-semibold text-gray-900 flex-1">Analytics Pro</h2>
        <BarChart2 className="w-5 h-5 text-purple-600"/>
      </div>

      <div className="p-4 space-y-4">
        {/* Period selector */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {PERIODS.map(p=>(
            <button key={p.value} onClick={()=>setPeriod(p.value)} className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${period===p.value?'bg-purple-600 text-white':'bg-white border text-gray-600'}`}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map(s=>(
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <s.icon className={`w-5 h-5 ${s.color}`}/>
                <span className={`text-xs font-semibold flex items-center gap-0.5 ${s.change>=0?'text-green-600':'text-red-500'}`}>
                  {s.change>=0?<TrendingUp className="w-3 h-3"/>:<TrendingDown className="w-3 h-3"/>}
                  {Math.abs(s.change)}%
                </span>
              </div>
              <p className="text-lg font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Revenue chart */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-600"/>Daily Revenue (XAF)</h3>
          <div className="flex items-end gap-2 h-32">
            {revenueData.map(d=>(
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-teal-500 rounded-t-md transition-all hover:bg-teal-600"
                  style={{height:maxRevenue>0?Math.round((d.value/maxRevenue)*100)+'%':'0%',minHeight:'4px'}}
                />
                <span className="text-xs text-gray-500">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-purple-600"/>Sales by Category</h3>
          <div className="space-y-3">
            {categoryData.map(item=>(
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor:item.color}}/>
                    <span className="text-gray-700">{item.label}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{item.value}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{width:item.value+'%',backgroundColor:item.color}}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-3">Top Performing Listings</h3>
          {[['iPhone 13 Pro Max','234 views','12 sales'],['Samsung TV 55"','189 views','8 sales'],['Designer Handbag','95 views','5 sales']].map(([name,views,sales])=>(
            <div key={name} className="flex items-center justify-between py-2.5 border-b last:border-0">
              <p className="text-sm font-medium text-gray-900">{name}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3"/>{views}</span>
                <span className="flex items-center gap-1"><ShoppingCart className="w-3 h-3"/>{sales}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}







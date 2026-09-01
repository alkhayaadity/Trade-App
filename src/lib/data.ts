import {account as demoAccount,strategies as demoStrategies,trades as demoTrades} from "@/lib/demo";
import {configured,serverClient} from "@/lib/supabase-server";
import type {Account,Strategy,Trade} from "@/types";
export async function getData(){
 if(!configured()||process.env.NEXT_PUBLIC_DEMO_MODE==="true")return{isDemo:true,user:{name:"Demo Trader",email:"demo@fomotrade.site"},accounts:[demoAccount],strategies:demoStrategies,trades:demoTrades};
 const supabase=await serverClient();const{data:claims}=await supabase.auth.getClaims();const id=claims?.claims?.sub;
 if(!id)return{isDemo:true,user:{name:"Demo Trader",email:"demo@fomotrade.site"},accounts:[demoAccount],strategies:demoStrategies,trades:demoTrades};
 const[p,a,s,t]=await Promise.all([supabase.from("profiles").select("*").eq("id",id).maybeSingle(),supabase.from("trading_accounts").select("*").order("is_default",{ascending:false}),supabase.from("strategies").select("*").eq("is_active",true),supabase.from("trades").select("*,strategy:strategies(name)").order("trade_date")]);
 const accounts:Account[]=(a.data||[]).map(x=>({id:x.id,name:x.name,broker:x.broker||"",type:x.account_type,initial:Number(x.initial_balance),balance:Number(x.current_balance),currency:x.currency,isDefault:x.is_default}));
 const strategies:Strategy[]=(s.data||[]).map(x=>({id:x.id,name:x.name,color:x.color,description:x.description||""}));
 const trades:Trade[]=(t.data||[]).map(x=>({id:x.id,date:x.trade_date,symbol:x.symbol,direction:x.direction,status:x.status,entry:Number(x.entry_price),exit:x.exit_price?Number(x.exit_price):null,sl:x.stop_loss?Number(x.stop_loss):null,tp:x.take_profit?Number(x.take_profit):null,lot:Number(x.lot_size),risk:Number(x.risk_percent||0),pnl:Number(x.pnl),rr:Number(x.rr||0),strategy:x.strategy?.name||"No strategy",session:x.session||"other",timeframe:x.timeframe||"",emotion:x.emotion||"",notes:x.notes||"",tags:x.tags||[]}));
 return{isDemo:false,user:{name:p.data?.full_name||p.data?.username||"Trader",email:String(claims?.claims?.email||"")},accounts,strategies,trades};
}

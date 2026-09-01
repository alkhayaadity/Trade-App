import {TradeForm} from "@/components/trade-form";
import {getData} from "@/lib/data";
export default async function AddTrade(){const d=await getData();return <TradeForm accounts={d.accounts} strategies={d.strategies} isDemo={d.isDemo}/>}

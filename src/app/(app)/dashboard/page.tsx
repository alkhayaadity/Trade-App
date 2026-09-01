import {DashboardOverview} from "@/components/dashboard-overview";
import {getData} from "@/lib/data";
export default async function Dashboard(){const d=await getData();return <DashboardOverview trades={d.trades} account={d.accounts[0]} isDemo={d.isDemo}/>}

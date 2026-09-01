import {AnalyticsDashboard} from "@/components/analytics-dashboard";
import {getData} from "@/lib/data";
export default async function Analytics(){const d=await getData();return <AnalyticsDashboard trades={d.trades}/>}

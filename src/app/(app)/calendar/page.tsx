import {TradingCalendar} from "@/components/trading-calendar";
import {getData} from "@/lib/data";
export default async function CalendarPage(){const d=await getData();return <div className="space-y-5"><div><h2 className="text-2xl font-extrabold">Trading calendar</h2><p className="mt-1 text-sm text-muted">Spot daily patterns and weekly consistency.</p></div><TradingCalendar trades={d.trades}/></div>}

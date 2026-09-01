import {AICoach} from "@/components/ai-coach";
import {getData} from "@/lib/data";
export default async function AIAnalyst(){const d=await getData();return <AICoach trades={d.trades}/>}

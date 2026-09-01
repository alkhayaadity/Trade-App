import {JournalTable} from "@/components/journal-table";
import {getData} from "@/lib/data";
export default async function Journal(){const d=await getData();return <JournalTable trades={d.trades}/>}

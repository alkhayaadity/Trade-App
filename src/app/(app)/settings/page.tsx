import {SettingsManager} from "@/components/managers";import {getData} from "@/lib/data";export default async function Settings(){const d=await getData();return <SettingsManager isDemo={d.isDemo}/>}

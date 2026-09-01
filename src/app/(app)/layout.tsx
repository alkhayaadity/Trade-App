import {AppShell} from "@/components/app-shell";
import {getData} from "@/lib/data";
export default async function AppLayout({children}:{children:React.ReactNode}){const d=await getData();return <AppShell user={d.user} accounts={d.accounts}>{children}</AppShell>}

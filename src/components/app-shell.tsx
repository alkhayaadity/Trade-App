"use client";
import Link from "next/link";
import {usePathname,useRouter} from "next/navigation";
import {useState} from "react";
import {BarChart3,BookOpenText,Bot,CalendarDays,ChevronLeft,ChevronRight,CirclePlus,CreditCard,LayoutDashboard,LogOut,Menu,Settings,Sparkles,Target,X} from "lucide-react";
import {browserClient,configured} from "@/lib/supabase-client";
import {cn,money} from "@/lib/utils";
import type {Account} from "@/types";
const nav=[["/dashboard","Dashboard",LayoutDashboard],["/journal","Journal",BookOpenText],["/add-trade","Add Trade",CirclePlus],["/calendar","Calendar",CalendarDays],["/analytics","Analytics",BarChart3],["/strategies","Strategies",Target],["/accounts","Accounts",CreditCard],["/ai-analyst","AI Analyst",Bot],["/settings","Settings",Settings]] as const;
export function AppShell({children,user,accounts}:{children:React.ReactNode;user:{name:string;email:string};accounts:Account[]}){
 const path=usePathname(),router=useRouter();const[collapsed,setCollapsed]=useState(false),[open,setOpen]=useState(false);const a=accounts[0];
 async function logout(){if(configured())await browserClient().auth.signOut();router.push("/login");router.refresh()}
 return <div className="flex min-h-screen bg-background">
  <button onClick={()=>setOpen(true)} className="fixed left-4 top-4 z-40 grid size-10 place-items-center rounded-xl border border-border bg-surface lg:hidden"><Menu size={18}/></button>{open&&<button className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={()=>setOpen(false)}/>}
  <aside className={cn("fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-[#0A0E14]/95 backdrop-blur-xl transition-all lg:sticky",collapsed?"w-[78px]":"w-[248px]",open?"translate-x-0":"max-lg:-translate-x-full")}>
   <div className="flex h-[76px] items-center border-b border-border px-5"><Link href="/dashboard" className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-primary"><Sparkles size={17}/></span>{!collapsed&&<b>Fomo<span className="text-primary">Trade</span></b>}</Link><button onClick={()=>setOpen(false)} className="ml-auto lg:hidden"><X size={18}/></button></div>
   <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">{nav.map(([href,label,Icon])=><Link key={href} href={href} onClick={()=>setOpen(false)} title={label} className={cn("flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted transition hover:bg-white/[.035] hover:text-white",path===href&&"bg-primary/12 text-white")}><Icon size={18} className={path===href?"text-primary":""}/>{!collapsed&&label}{path===href&&<span className="ml-auto h-5 w-1 rounded-full bg-primary"/>}</Link>)}</nav>
   <div className="border-t border-border p-3">{!collapsed&&<div className="mb-2 rounded-xl bg-white/[.025] p-3"><p className="truncate text-xs font-bold">{user.name}</p><p className="truncate text-[10px] text-muted">{user.email}</p></div>}<button onClick={logout} className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm text-muted hover:bg-bearish/10 hover:text-bearish"><LogOut size={17}/>{!collapsed&&"Logout"}</button></div>
   <button onClick={()=>setCollapsed(v=>!v)} className="absolute -right-3 top-24 hidden size-7 place-items-center rounded-full border border-border bg-surface-2 lg:grid">{collapsed?<ChevronRight size={13}/>:<ChevronLeft size={13}/>}</button>
  </aside>
  <div className="min-w-0 flex-1"><header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-border bg-background/85 px-5 pl-16 backdrop-blur-xl lg:px-8"><div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-muted">Workspace</p><h1 className="mt-1 text-base font-extrabold">Trading Command Center</h1></div><div className="hidden rounded-xl border border-border bg-surface px-4 py-2 text-xs md:block"><span className="text-muted">{a?.name||"Account"} · </span><b>{money(a?.balance||0,a?.currency)}</b></div></header><main className="mx-auto max-w-[1680px] p-4 sm:p-6 lg:p-8">{children}</main></div>
 </div>
}

import {clsx,type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";
import type {Stats,Trade} from "@/types";
export const cn=(...v:ClassValue[])=>twMerge(clsx(v));
export const money=(n:number,c="USD")=>new Intl.NumberFormat("en-US",{style:"currency",currency:c,maximumFractionDigits:2}).format(n);
export const pct=(n:number)=>`${n.toFixed(1)}%`;
function streak(rows:Trade[],wanted:"win"|"loss"){let c=0,m=0;for(const t of rows){c=t.status===wanted?c+1:0;m=Math.max(m,c)}return m}
export function stats(trades:Trade[]):Stats{const closed=trades.filter(t=>t.status!=="open"),wins=closed.filter(t=>t.pnl>0),losses=closed.filter(t=>t.pnl<0),gp=wins.reduce((s,t)=>s+t.pnl,0),gl=Math.abs(losses.reduce((s,t)=>s+t.pnl,0)),total=gp-gl;return{totalPnl:total,winRate:closed.length?wins.length/closed.length*100:0,profitFactor:gl?gp/gl:gp,averageRR:closed.length?closed.reduce((s,t)=>s+t.rr,0)/closed.length:0,totalTrades:closed.length,tradingDays:new Set(closed.map(t=>t.date)).size,averageWin:wins.length?gp/wins.length:0,averageLoss:losses.length?-gl/losses.length:0,largestWin:wins.length?Math.max(...wins.map(t=>t.pnl)):0,largestLoss:losses.length?Math.min(...losses.map(t=>t.pnl)):0,expectancy:closed.length?total/closed.length:0,winStreak:streak(closed,"win"),lossStreak:streak(closed,"loss")}}

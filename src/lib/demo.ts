import {format,subDays} from "date-fns";
import type {Account,Strategy,Trade} from "@/types";
export const account:Account={id:"demo",name:"FTMO Challenge",broker:"FTMO",type:"Funded",initial:100000,balance:104860.5,currency:"USD",isDefault:true};
export const strategies:Strategy[]=[
{id:"breakout",name:"Breakout",color:"#4F7CFF",description:"London range breakout with confirmation"},
{id:"smc",name:"Smart Money",color:"#A876FF",description:"Liquidity sweep and order block"},
{id:"sd",name:"Supply & Demand",color:"#16C784",description:"Fresh zone continuation"},
{id:"sr",name:"Support Resistance",color:"#F6B94A",description:"Key level rejection"}];
const pnls=[420,-180,310,590,-220,160,275,-140,680,190,-260,340,510,-120,240,390,-310,720,185,-95,455,280,-175,610,-205,145,330,-110,525,265];
const symbols=["XAUUSD","BTCUSD","EURUSD","NAS100"],sessions=["london","new_york","overlap","asia"],emotions=["calm","confident","unsure","fomo"];
export const trades:Trade[]=pnls.map((pnl,i)=>({id:`demo-${i+1}`,date:format(subDays(new Date(),29-i),"yyyy-MM-dd"),symbol:symbols[i%4],direction:i%3===0?"sell":"buy",status:pnl>0?"win":"loss",entry:symbols[i%4]==="EURUSD"?1.08+i/10000:2400+i*8,exit:2400+i*8+(pnl/100),sl:2398+i*8,tp:2406+i*8,lot:i%4===1?.1:1,risk:.75+(i%4)*.25,pnl,rr:pnl>0?1.2+(i%5)*.3:-1,strategy:strategies[i%4].name,session:sessions[i%4],timeframe:["M5","M15","H1"][i%3],emotion:emotions[i%4],notes:pnl>0?"Followed the plan and waited for confirmation.":"Entry was early; wait for candle close next time.",tags:i%2?["A-setup","trend"]:["retest"]}));

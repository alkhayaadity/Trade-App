export type Direction="buy"|"sell";
export type TradeStatus="win"|"loss"|"breakeven"|"open";
export interface Account{id:string;name:string;broker:string;type:string;initial:number;balance:number;currency:string;isDefault:boolean}
export interface Strategy{id:string;name:string;color:string;description:string}
export interface Trade{id:string;date:string;symbol:string;direction:Direction;status:TradeStatus;entry:number;exit:number|null;sl:number|null;tp:number|null;lot:number;risk:number;pnl:number;rr:number;strategy:string;session:string;timeframe:string;emotion:string;notes:string;tags:string[]}
export interface Stats{totalPnl:number;winRate:number;profitFactor:number;averageRR:number;totalTrades:number;tradingDays:number;averageWin:number;averageLoss:number;largestWin:number;largestLoss:number;expectancy:number;winStreak:number;lossStreak:number}

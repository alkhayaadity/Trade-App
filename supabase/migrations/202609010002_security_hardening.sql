revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.refresh_account_balance() from public, anon, authenticated;
create index if not exists ai_analysis_trade_idx on public.ai_analysis(trade_id);
create index if not exists ai_conversations_user_idx on public.ai_conversations(user_id);
create index if not exists ai_messages_user_idx on public.ai_messages(user_id);
create index if not exists monthly_reviews_user_idx on public.monthly_reviews(user_id);
create index if not exists strategies_user_idx on public.strategies(user_id);
create index if not exists trade_screenshots_user_idx on public.trade_screenshots(user_id);
create index if not exists trades_strategy_fk_idx on public.trades(strategy_id);

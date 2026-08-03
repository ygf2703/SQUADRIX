-- Load the fictional 36-match season totals onto the currently imported demo squad.
with source(full_name,appearances,starts,substitute_appearances,substituted,minutes_played,goals,assists,yellow_cards,red_cards) as (
  values
  ('אורי כהן',34,34,0,2,3060,0,1,2,0),('דניאל לוי',4,2,2,0,210,0,0,0,0),('יואב מזרחי',31,25,6,12,2315,1,5,6,0),
  ('איתי ברק',29,27,2,5,2470,2,1,7,1),('נועם פרץ',33,31,2,4,2805,3,2,5,0),('עידו רון',24,19,5,8,1780,1,1,4,0),
  ('רועי אברהם',32,28,4,15,2410,4,6,8,0),('תומר שחר',30,20,10,13,1945,8,9,3,0),('אדם יעקב',35,33,2,18,2860,7,11,9,0),
  ('ליאור כץ',34,29,5,17,2605,18,5,2,0),('אורי בן דוד',33,30,3,20,2540,10,14,4,0),('ניב אשכנזי',31,24,7,14,2150,11,8,5,0),
  ('רון מלול',28,21,7,9,1910,2,6,6,0),('שחר לוי',22,16,6,6,1490,1,0,3,0),('אלון ממן',27,15,12,11,1560,3,4,5,0),
  ('איליי גולן',26,12,14,8,1245,5,7,1,0),('עמית זיו',25,10,15,7,1090,9,3,2,0),('יהלי מימון',20,11,9,5,1020,0,2,4,0),
  ('מתן סגל',23,9,14,6,960,2,5,3,0),('איתי אלפסי',1,0,1,0,90,0,0,0,0),('גיא עמית',18,8,10,5,760,1,3,2,0),
  ('אריאל טל',21,7,14,4,730,4,3,1,0),('ליאם שקד',15,5,10,3,540,0,1,2,0),('עומרי בן חור',17,4,13,2,485,3,2,1,0)
)
insert into public.player_season_statistics(player_season_id,appearances,starts,substitute_appearances,substituted,minutes_played,goals,assists,yellow_cards,red_cards,source)
select ps.id,source.appearances,source.starts,source.substitute_appearances,source.substituted,source.minutes_played,source.goals,source.assists,source.yellow_cards,source.red_cards,'demo_seed'
from source
join public.players p on lower(p.full_name) = lower(source.full_name)
join public.player_seasons ps on ps.player_id = p.id
on conflict (player_season_id) do update set appearances = excluded.appearances, starts = excluded.starts, substitute_appearances = excluded.substitute_appearances, substituted = excluded.substituted, minutes_played = excluded.minutes_played, goals = excluded.goals, assists = excluded.assists, yellow_cards = excluded.yellow_cards, red_cards = excluded.red_cards, source = excluded.source, updated_at = now();

select count(*) as updated_player_statistics from public.player_season_statistics;

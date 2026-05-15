-- =======================================================
-- seed_results.sql  –  Past game results
-- Cork Minor Hurling 2025 & 2026
--
-- Run in Supabase SQL Editor AFTER:
--   1. schema.sql
--   2. seed_clubs.sql
--   3. seed_competitions.sql
-- =======================================================

-- ---- Back-fill 2025 competitions ----
INSERT INTO public.competitions (name, short_name, county, grade, code, season, format) VALUES
  ('Cork Premier Minor Hurling League 2025',       'PMHL 2025', 'Cork', 'minor', 'hurling', 2025, 'league'),
  ('Cork Minor A Hurling League 2025',             'MAHL 2025', 'Cork', 'minor', 'hurling', 2025, 'league'),
  ('Cork Minor B Hurling League 2025',             'MBHL 2025', 'Cork', 'minor', 'hurling', 2025, 'league'),
  ('Cork Premier Minor Hurling Championship 2025', 'PMHC 2025', 'Cork', 'minor', 'hurling', 2025, 'championship'),
  ('Cork Minor A Hurling Championship 2025',       'MAHC 2025', 'Cork', 'minor', 'hurling', 2025, 'championship')
ON CONFLICT DO NOTHING;


-- ---- Reusable helper function ----
-- Inserts a game + FT score update. Idempotent — safe to run more than once.
CREATE OR REPLACE FUNCTION _seed_result(
  p_comp  text,
  p_home  text,
  p_away  text,
  p_venue text,
  p_ts    timestamptz,
  p_hs    text,   -- home score  e.g. '1-15'
  p_as    text    -- away score  e.g. '0-12'
) RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_gid uuid;
  v_cid uuid;
  v_hid uuid;
  v_aid uuid;
BEGIN
  SELECT id INTO v_cid FROM public.competitions WHERE short_name = p_comp LIMIT 1;
  SELECT id INTO v_hid FROM public.clubs WHERE name = p_home AND county = 'Cork' LIMIT 1;
  SELECT id INTO v_aid FROM public.clubs WHERE name = p_away AND county = 'Cork' LIMIT 1;

  IF v_cid IS NULL THEN RAISE WARNING '_seed_result: competition not found: %', p_comp; RETURN; END IF;
  IF v_hid IS NULL THEN RAISE WARNING '_seed_result: club not found: %',        p_home;  RETURN; END IF;
  IF v_aid IS NULL THEN RAISE WARNING '_seed_result: club not found: %',        p_away;  RETURN; END IF;

  -- Skip if already inserted (idempotency)
  IF EXISTS (
    SELECT 1 FROM public.games
    WHERE competition_id = v_cid
      AND home_club_id   = v_hid
      AND away_club_id   = v_aid
      AND start_time     = p_ts
  ) THEN RETURN; END IF;

  INSERT INTO public.games (competition_id, home_club_id, away_club_id, venue, start_time)
  VALUES (v_cid, v_hid, v_aid, p_venue, p_ts)
  RETURNING id INTO v_gid;

  INSERT INTO public.score_updates (game_id, home_score, away_score, period, created_at)
  VALUES (v_gid, p_hs, p_as, 'FT', p_ts + interval '90 minutes');
END $$;


-- =============================================================
-- 2026 PMHL — Premier Minor Hurling League
-- Teams: Blackrock · Glen Rovers · St Finbarrs · Na Piarsaigh
--        Midleton  · Bishopstown  · Douglas     · Carrigaline
-- =============================================================

-- Round 1  –  14 March 2026
SELECT _seed_result('PMHL 2026','Blackrock',   'Midleton',    'Páirc Uí Rinn',   '2026-03-14 14:00+00','1-15','0-12');
SELECT _seed_result('PMHL 2026','Glen Rovers', 'Bishopstown', 'Páirc Uí Rinn',   '2026-03-14 16:00+00','2-12','1-10');
SELECT _seed_result('PMHL 2026','Na Piarsaigh','Douglas',     'Ballygarvan',      '2026-03-14 14:00+00','0-14','1-08');
SELECT _seed_result('PMHL 2026','St Finbarrs', 'Carrigaline', 'Togher',           '2026-03-14 14:30+00','3-09','0-13');

-- Round 2  –  21 March 2026
SELECT _seed_result('PMHL 2026','Midleton',    'St Finbarrs', 'Midleton GAA',     '2026-03-21 14:00+00','1-13','2-14');
SELECT _seed_result('PMHL 2026','Bishopstown', 'Na Piarsaigh','Bishopstown GAA',  '2026-03-21 14:00+00','0-11','2-09');
SELECT _seed_result('PMHL 2026','Douglas',     'Blackrock',   'Douglas GAA',      '2026-03-21 14:30+00','0-10','1-16');
SELECT _seed_result('PMHL 2026','Carrigaline', 'Glen Rovers', 'Carrigaline GAA',  '2026-03-21 14:00+00','0-09','3-11');

-- Round 3  –  28 March 2026
SELECT _seed_result('PMHL 2026','Blackrock',   'Na Piarsaigh','Páirc Uí Rinn',   '2026-03-28 15:00+00','2-16','1-12');
SELECT _seed_result('PMHL 2026','Glen Rovers', 'Midleton',    'Glen Rovers GAA',  '2026-03-28 14:00+00','1-14','0-14');
SELECT _seed_result('PMHL 2026','St Finbarrs', 'Douglas',     'Togher',           '2026-03-28 14:30+00','1-18','0-11');
SELECT _seed_result('PMHL 2026','Carrigaline', 'Bishopstown', 'Carrigaline GAA',  '2026-03-28 14:00+00','1-09','0-12');

-- Round 4  –  4 April 2026
SELECT _seed_result('PMHL 2026','Na Piarsaigh','Glen Rovers', 'Ballygarvan',      '2026-04-04 14:00+00','1-15','1-15');
SELECT _seed_result('PMHL 2026','Midleton',    'Carrigaline', 'Midleton GAA',     '2026-04-04 14:00+00','2-14','0-10');
SELECT _seed_result('PMHL 2026','Bishopstown', 'Blackrock',   'Bishopstown GAA',  '2026-04-04 15:00+00','0-12','1-13');
SELECT _seed_result('PMHL 2026','Douglas',     'St Finbarrs', 'Douglas GAA',      '2026-04-04 14:30+00','1-08','2-17');

-- Round 5  –  25 April 2026
SELECT _seed_result('PMHL 2026','Blackrock',   'Glen Rovers', 'Páirc Uí Rinn',   '2026-04-25 14:00+00','1-14','2-11');
SELECT _seed_result('PMHL 2026','St Finbarrs', 'Na Piarsaigh','Togher',           '2026-04-25 14:00+00','2-15','1-13');
SELECT _seed_result('PMHL 2026','Midleton',    'Bishopstown', 'Midleton GAA',     '2026-04-25 14:00+00','1-11','0-09');
SELECT _seed_result('PMHL 2026','Carrigaline', 'Douglas',     'Carrigaline GAA',  '2026-04-25 14:30+00','0-14','1-10');


-- =============================================================
-- 2026 PMHC — Premier Minor Hurling Championship
-- Quarter-finals  (May 2026)
-- =============================================================

SELECT _seed_result('PMHC 2026','Blackrock',   'Bishopstown', 'Páirc Uí Rinn',   '2026-05-01 14:00+00','2-18','0-14');
SELECT _seed_result('PMHC 2026','St Finbarrs', 'Douglas',     'Togher',           '2026-05-01 16:00+00','1-16','1-09');
SELECT _seed_result('PMHC 2026','Na Piarsaigh','Carrigaline', 'Ballygarvan',      '2026-05-08 14:00+00','3-12','1-08');
SELECT _seed_result('PMHC 2026','Glen Rovers', 'Midleton',    'Glen Rovers GAA',  '2026-05-08 14:00+00','2-14','1-14');


-- =============================================================
-- 2026 MAHL — Minor A Hurling League
-- Teams: Mallow · Charleville · Fermoy · Kanturk · Newmarket · Milford
-- =============================================================

-- Round 1  –  15 March 2026
SELECT _seed_result('MAHL 2026','Mallow',      'Charleville', 'Mallow GAA',       '2026-03-15 14:00+00','1-14','0-11');
SELECT _seed_result('MAHL 2026','Fermoy',      'Newmarket',   'Fermoy GAA',        '2026-03-15 14:00+00','2-10','1-09');
SELECT _seed_result('MAHL 2026','Kanturk',     'Milford',     'Kanturk GAA',       '2026-03-15 14:00+00','0-13','0-10');

-- Round 2  –  22 March 2026
SELECT _seed_result('MAHL 2026','Charleville', 'Fermoy',      'Charleville GAA',  '2026-03-22 14:00+00','1-11','1-14');
SELECT _seed_result('MAHL 2026','Newmarket',   'Kanturk',     'Newmarket GAA',    '2026-03-22 14:00+00','0-09','1-12');
SELECT _seed_result('MAHL 2026','Milford',     'Mallow',      'Milford GAA',      '2026-03-22 14:00+00','0-07','2-16');

-- Round 3  –  5 April 2026
SELECT _seed_result('MAHL 2026','Mallow',      'Fermoy',      'Mallow GAA',       '2026-04-05 14:00+00','3-12','0-10');
SELECT _seed_result('MAHL 2026','Charleville', 'Milford',     'Charleville GAA',  '2026-04-05 14:00+00','1-13','0-08');
SELECT _seed_result('MAHL 2026','Kanturk',     'Newmarket',   'Kanturk GAA',      '2026-04-05 14:00+00','1-10','0-14');

-- Round 4  –  26 April 2026
SELECT _seed_result('MAHL 2026','Fermoy',      'Mallow',      'Fermoy GAA',       '2026-04-26 14:00+00','1-12','2-10');
SELECT _seed_result('MAHL 2026','Milford',     'Charleville', 'Milford GAA',      '2026-04-26 14:00+00','0-08','1-15');
SELECT _seed_result('MAHL 2026','Newmarket',   'Kanturk',     'Newmarket GAA',    '2026-04-26 14:00+00','2-08','0-11');


-- =============================================================
-- 2026 MAHC — Minor A Hurling Championship
-- Early rounds (May 2026)
-- =============================================================

SELECT _seed_result('MAHC 2026','Mallow',      'Charleville', 'Mallow GAA',       '2026-05-02 14:00+00','2-15','1-11');
SELECT _seed_result('MAHC 2026','Fermoy',      'Kanturk',     'Fermoy GAA',       '2026-05-02 14:00+00','1-13','0-12');
SELECT _seed_result('MAHC 2026','Newmarket',   'Milford',     'Newmarket GAA',    '2026-05-09 14:00+00','1-10','0-14');


-- =============================================================
-- 2026 MBHL — Minor B Hurling League
-- Teams: Inniscarra · Aghabullogue · Blarney · Ballinora · Kilmurry · Cloughduv
-- =============================================================

-- Round 1  –  15 March 2026
SELECT _seed_result('MBHL 2026','Inniscarra',  'Aghabullogue','Inniscarra GAA',   '2026-03-15 14:00+00','1-11','0-09');
SELECT _seed_result('MBHL 2026','Blarney',     'Ballinora',   'Blarney GAA',      '2026-03-15 14:00+00','2-08','1-10');
SELECT _seed_result('MBHL 2026','Kilmurry',    'Cloughduv',   'Kilmurry GAA',     '2026-03-15 14:00+00','0-12','0-11');

-- Round 2  –  29 March 2026
SELECT _seed_result('MBHL 2026','Aghabullogue','Blarney',     'Aghabullogue GAA', '2026-03-29 14:00+00','1-08','2-09');
SELECT _seed_result('MBHL 2026','Ballinora',   'Kilmurry',    'Ballinora GAA',    '2026-03-29 14:00+00','0-10','1-08');
SELECT _seed_result('MBHL 2026','Cloughduv',   'Inniscarra',  'Cloughduv GAA',    '2026-03-29 14:00+00','1-07','0-14');

-- Round 3  –  6 April 2026
SELECT _seed_result('MBHL 2026','Inniscarra',  'Blarney',     'Inniscarra GAA',   '2026-04-06 14:00+00','2-10','1-09');
SELECT _seed_result('MBHL 2026','Aghabullogue','Cloughduv',   'Aghabullogue GAA', '2026-04-06 14:00+00','0-13','0-10');
SELECT _seed_result('MBHL 2026','Kilmurry',    'Ballinora',   'Kilmurry GAA',     '2026-04-06 14:00+00','1-09','1-11');


-- =============================================================
-- 2025 PMHL — Historical season
-- =============================================================

SELECT _seed_result('PMHL 2025','Blackrock',   'Na Piarsaigh','Páirc Uí Rinn',   '2025-03-15 14:00+00','2-14','1-11');
SELECT _seed_result('PMHL 2025','Glen Rovers', 'Midleton',    'Glen Rovers GAA',  '2025-03-15 14:00+00','1-13','0-12');
SELECT _seed_result('PMHL 2025','St Finbarrs', 'Bishopstown', 'Togher',           '2025-03-22 14:00+00','3-11','0-10');
SELECT _seed_result('PMHL 2025','Blackrock',   'Glen Rovers', 'Páirc Uí Rinn',   '2025-04-05 14:00+00','1-16','2-12');
SELECT _seed_result('PMHL 2025','Na Piarsaigh','St Finbarrs', 'Ballygarvan',      '2025-04-05 14:00+00','2-09','1-14');
SELECT _seed_result('PMHL 2025','Midleton',    'Bishopstown', 'Midleton GAA',     '2025-04-12 14:00+00','1-12','0-10');
SELECT _seed_result('PMHL 2025','Blackrock',   'St Finbarrs', 'Páirc Uí Rinn',   '2025-05-03 14:00+00','2-13','1-15');
SELECT _seed_result('PMHL 2025','Na Piarsaigh','Blackrock',   'Ballygarvan',      '2025-05-17 14:00+00','1-14','2-10');
SELECT _seed_result('PMHL 2025','Glen Rovers', 'St Finbarrs', 'Glen Rovers GAA',  '2025-05-17 14:00+00','2-11','1-13');


-- =============================================================
-- 2025 PMHC — Historical championship
-- =============================================================

-- Quarter-finals  –  14 September 2025
SELECT _seed_result('PMHC 2025','Blackrock',   'Midleton',    'Páirc Uí Rinn',   '2025-09-14 14:00+00','3-14','1-09');
SELECT _seed_result('PMHC 2025','Na Piarsaigh','Bishopstown', 'Ballygarvan',      '2025-09-14 14:00+00','2-16','0-12');
SELECT _seed_result('PMHC 2025','St Finbarrs', 'Douglas',     'Togher',           '2025-09-14 16:00+00','1-14','1-09');
SELECT _seed_result('PMHC 2025','Glen Rovers', 'Carrigaline', 'Glen Rovers GAA',  '2025-09-14 14:00+00','2-12','0-11');

-- Semi-finals  –  28 September 2025
SELECT _seed_result('PMHC 2025','Blackrock',   'St Finbarrs', 'Páirc Uí Rinn',   '2025-09-28 14:00+00','2-15','1-12');
SELECT _seed_result('PMHC 2025','Na Piarsaigh','Glen Rovers', 'Páirc Uí Rinn',   '2025-09-28 16:00+00','1-17','2-11');

-- Final  –  5 October 2025
SELECT _seed_result('PMHC 2025','Blackrock',   'Na Piarsaigh','Páirc Uí Chaoimh','2025-10-05 15:00+00','2-14','1-15');


-- =============================================================
-- 2025 MAHL — Minor A Hurling League (historical)
-- =============================================================

SELECT _seed_result('MAHL 2025','Mallow',      'Fermoy',      'Mallow GAA',       '2025-03-22 14:00+00','1-16','0-12');
SELECT _seed_result('MAHL 2025','Charleville', 'Kanturk',     'Charleville GAA',  '2025-03-22 14:00+00','2-09','1-11');
SELECT _seed_result('MAHL 2025','Fermoy',      'Charleville', 'Fermoy GAA',       '2025-04-12 14:00+00','0-14','1-10');
SELECT _seed_result('MAHL 2025','Kanturk',     'Mallow',      'Kanturk GAA',      '2025-04-26 14:00+00','1-08','2-13');


-- =============================================================
-- 2025 MAHC — Minor A Hurling Championship (historical)
-- =============================================================

SELECT _seed_result('MAHC 2025','Mallow',      'Kanturk',     'Mallow GAA',       '2025-09-06 14:00+00','2-15','0-11');
SELECT _seed_result('MAHC 2025','Fermoy',      'Charleville', 'Fermoy GAA',       '2025-09-06 14:00+00','1-13','1-08');
SELECT _seed_result('MAHC 2025','Mallow',      'Fermoy',      'Páirc Uí Rinn',   '2025-09-27 14:00+00','2-12','1-14');


-- ---- Drop helper ----
DROP FUNCTION IF EXISTS _seed_result(text,text,text,text,timestamptz,text,text);

-- Cork Minor Hurling competitions 2026
-- format: 'championship' = knockout/group stages, 'league' = round robin table
insert into public.competitions (name, short_name, county, grade, code, season, format) values

-- Championships
('Cork Premier Minor Hurling Championship 2026', 'PMHC 2026', 'Cork', 'minor', 'hurling', 2026, 'championship'),
('Cork Minor A Hurling Championship 2026',       'MAHC 2026', 'Cork', 'minor', 'hurling', 2026, 'championship'),
('Cork Minor B Hurling Championship 2026',       'MBHC 2026', 'Cork', 'minor', 'hurling', 2026, 'championship'),
('Cork Minor C Hurling Championship 2026',       'MCHC 2026', 'Cork', 'minor', 'hurling', 2026, 'championship'),

-- Leagues
('Cork Premier Minor Hurling League 2026',       'PMHL 2026', 'Cork', 'minor', 'hurling', 2026, 'league'),
('Cork Minor A Hurling League 2026',             'MAHL 2026', 'Cork', 'minor', 'hurling', 2026, 'league'),
('Cork Minor B Hurling League 2026',             'MBHL 2026', 'Cork', 'minor', 'hurling', 2026, 'league'),
('Cork Minor C Hurling League 2026',             'MCHL 2026', 'Cork', 'minor', 'hurling', 2026, 'league')

on conflict do nothing;

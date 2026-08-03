#!/usr/bin/env python3
# Rigenera supabase/tutte-le-migrazioni.sql (file unico per il SQL Editor
# di Supabase, riesecuibile in sicurezza). Eseguilo dopo ogni nuova migrazione:
#   python3 scripts/genera-sql-unico.py
import glob, re, os
BASE = os.path.join(os.path.dirname(__file__), '..')
files = sorted(glob.glob(os.path.join(BASE, 'supabase/migrations/00*.sql')))
def robusto(sql):
    sql = re.sub(r'create policy\s+("[^"]+"|[a-zA-Z_][a-zA-Z0-9_]*)\s+on\s+(public\.[a-zA-Z_]+)',
                 lambda m: f'drop policy if exists {m.group(1)} on {m.group(2)};\ncreate policy {m.group(1)} on {m.group(2)}', sql)
    sql = re.sub(r'(?m)^\s*alter publication supabase_realtime add table ([^;]+);',
                 r"do $pub$ begin alter publication supabase_realtime add table \1; exception when duplicate_object then null; end $pub$;", sql)
    sql = re.sub(r'insert into public\.videos\s*\([^)]*gratuito[^)]*\)[\s\S]*?;',
                 lambda m: "do $seed$ begin\n"+m.group(0)+"\nexception when undefined_column then null; end $seed$;", sql)
    return sql
out = ["""-- =====================================================================
--  LA PACIFICA RES PUBLICA - TUTTE LE MIGRAZIONI IN UN FILE
--  Da incollare nel SQL Editor di Supabase
--  (Dashboard -> SQL Editor -> New query -> incolla -> Run).
--  RIESEGUIBILE IN SICUREZZA anche su database gia' parzialmente migrato.
--  Rigenerato con: python3 scripts/genera-sql-unico.py
-- =====================================================================
"""]
for f in files:
    out.append(f"\n-- ============ {os.path.basename(f)} ============\n")
    out.append(robusto(open(f).read()))
dest = os.path.join(BASE, 'supabase/tutte-le-migrazioni.sql')
open(dest,'w').write('\n'.join(out))
print('OK:', dest, '-', len(files), 'migrazioni')

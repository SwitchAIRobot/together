#!/usr/bin/env python3
"""community.csv -> community.json (+ flagged_rows.csv); Videos.csv -> videos.json.
Usage: python3 parse_timetable.py          (uses coordinates already in the CSV)
       python3 parse_timetable.py --geocode (postcodes.io for rows with bad coords; needs internet + requests)"""
import csv, json, sys, re
def num(s):
    try: return float(s.replace('\u2212','-').strip())
    except Exception: return None
rows, flagged, seen = [], [], set()
for i, r in enumerate(csv.DictReader(open('community.csv', encoding='utf-8-sig')), 2):
    pc = (r.get('Post Code_') or '').strip().upper()
    lat, lng = num(r.get('LAT','')), num(r.get('LONG',''))
    cnt = int(r['Count of Post Code_']) if (r.get('Count of Post Code_') or '').isdigit() else None
    if not pc: flagged.append((i, pc, 'missing postcode')); continue
    if lat is None or lng is None or not (49 <= lat <= 61 and -9 <= lng <= 2):
        if '--geocode' in sys.argv:
            try:
                import requests
                d = requests.get('https://api.postcodes.io/outcodes/'+pc, timeout=20).json().get('result')
                lat, lng = d['latitude'], d['longitude']
            except Exception as e: flagged.append((i, pc, 'geocode failed: %s' % e)); continue
        else: flagged.append((i, pc, 'coordinates missing or outside UK bounds (%s,%s)' % (r.get('LAT'), r.get('LONG')))); continue
    typ = (r.get('Type') or r.get('Revenue Type') or 'Not stated').strip()
    rows.append({'id': 'c%d' % i, 'type': typ, 'region': 'Not stated', 'postcode': pc,
                 'lat': round(lat, 6), 'lng': round(lng, 6), 'count': cnt, 'hub': typ.lower() == 'local hub'})
json.dump(rows, open('community.json', 'w'), separators=(',', ':'))
with open('flagged_rows.csv', 'w', newline='') as f:
    w = csv.writer(f); w.writerow(['csv_line', 'postcode', 'reason']); w.writerows(flagged)
def d(s):
    m = re.match(r'(\d+)/(\d+)/(\d+)', s or ''); return '%s-%s-%s' % (m[3], m[2].zfill(2), m[1].zfill(2)) if m else None
vids = [{'title': r['video_title'], 'url': r['video_url'], 'thumb': r['thumbnail_url'], 'date': d(r['date_published']),
         'campaign': r['campaign_name'] or 'Not stated', 'summary': r['description_summary'] or 'Not stated'}
        for r in csv.DictReader(open('Videos.csv', encoding='utf-8-sig'))]
json.dump(vids, open('videos.json', 'w'), indent=0)
print(len(rows), 'community rows,', len(flagged), 'flagged,', len(vids), 'videos')

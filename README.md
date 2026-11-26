# #together PWA
- **Refresh videos/posts:** edit `videos.json` / `socialmedia.json` (fields: title, url, thumb, date YYYY-MM-DD, campaign, summary). Or re-run `python3 parse_timetable.py` after replacing `Videos.csv`.
- **Community data:** replace `community.csv`, run `python3 parse_timetable.py` (add `--geocode` with internet to fix bad coordinates via postcodes.io). Bad rows go to `flagged_rows.csv`.
- **Required drop-ins:** real `fuse.min.js`, `leaflet.js`, `leaflet.css` (currently empty stubs; app falls back to plain search and a list).
- **Stripe links, vote question, events:** top of `app.js`.
- **Deploy free:** GitHub > New repository (public) > upload all files to the root > Settings > Pages > Deploy from branch `main` / root > open the URL shown. Bump `V` in `sw.js` after each update.
- **Privacy:** `community.json` is public once deployed. See notes in chat before publishing.

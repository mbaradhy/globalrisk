# Building the atlas

`sh build/run.sh` rebuilds `index.html` and `og.png` (the link preview) from the sources in `build/`.

- `build/atlas/questions.js`: the 56 questions (probability bands `lo`/`hi`, source `by`/`src`, date `t`), the `MEASURED` counts and the `LEVELS`.
- `build/atlas/impact.js`: Layer 3 consequence ranges with sources.
- `build/atlas/data.js`: risks (`NODES`), links (`LINKS`), sources.
- `build/sp/i18n/`: translations. New English strings go in a new `strings_extraN.json` (a list of `{en, fr}`), with one `{lg}_extraN.json` per language (`{"English": "translation"}`). The merge picks them up automatically.
- `build/kit-2-semaines.html`: the 14-day reserve page.

The scripts write to fixed working paths (`/home/claude/...` and a `/tmp/...` scratch folder); `run.sh` recreates them.

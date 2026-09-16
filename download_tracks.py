import os
import json
import yt_dlp

os.makedirs('audio', exist_ok=True)

TRACKS = [
    # Atif Aslam
    ('atif-1', 'atif aslam pehli nazar mein official audio'),
    ('atif-2', 'atif aslam tu jaane na official audio'),
    ('atif-3', 'atif aslam tere sang yaara official audio'),
    ('atif-4', 'atif aslam tera hone laga hoon official audio'),
    ('atif-5', 'atif aslam woh lamhe woh baatein official audio'),

    # Arijit Singh
    ('arj-1', 'arijit singh tum hi ho official audio'),
    ('arj-2', 'arijit singh kesariya official audio'),
    ('arj-3', 'arijit singh channa mereya official audio'),
    ('arj-4', 'arijit singh apna bana le audio'),
    ('arj-5', 'raataan lambiyan shershaah jubin nautiyal audio'),

    # Diljit Dosanjh
    ('diljit-1', 'diljit dosanjh lover official music audio'),
    ('diljit-2', 'diljit dosanjh born to shine official audio'),
    ('diljit-3', 'diljit dosanjh naina crew official audio'),
    ('diljit-4', 'diljit dosanjh ikk kudi udta punjab audio'),

    # AP Dhillon
    ('ap-1', 'ap dhillon brown munde official audio'),
    ('ap-2', 'ap dhillon excuses official audio'),
    ('ap-3', 'ap dhillon with you official audio'),
    ('ap-4', 'ap dhillon dil nu official audio'),

    # BTS
    ('bts-1', 'bts boy with luv official audio'),
    ('bts-2', 'bts fake love official audio'),
    ('bts-3', 'bts dynamite official audio'),
    ('bts-4', 'bts butter official audio'),
    ('bts-5', 'bts dna official audio'),
    ('bts-6', 'bts spring day official audio'),
    ('bts-7', 'bts permission to dance official audio'),

    # The Weeknd
    ('wknd-1', 'the weeknd blinding lights official audio'),
    ('wknd-2', 'the weeknd starboy official audio'),
    ('wknd-3', 'the weeknd save your tears official audio'),
    ('wknd-4', 'the weeknd the hills official audio'),

    # Taylor Swift
    ('ts-1', 'taylor swift cruel summer official audio'),
    ('ts-2', 'taylor swift anti hero official audio'),
    ('ts-3', 'taylor swift shake it off official audio'),
    ('ts-4', 'taylor swift love story taylors version official audio'),
]

# Load existing mapping if any
manifest_path = 'audio/manifest.json'
manifest = {}
if os.path.exists(manifest_path):
    try:
        with open(manifest_path, 'r', encoding='utf-8') as f:
            manifest = json.load(f)
    except Exception:
        manifest = {}

ydl_opts = {
    'format': 'ba[ext=m4a]/ba/b',
    'outtmpl': 'audio/%(id)s.%(ext)s',
    'quiet': True,
    'no_warnings': True,
    'extract_flat': False
}

with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    for song_id, query in TRACKS:
        if song_id in manifest and os.path.exists(manifest[song_id].get('file', '')):
            print(f"Already exists: {song_id} -> {manifest[song_id]['file']}")
            continue

        search_q = f"ytsearch1:{query}"
        print(f"Downloading {song_id}: {query} ...")
        try:
            res = ydl.extract_info(search_q, download=True)
            if res and 'entries' in res and res['entries']:
                entry = res['entries'][0]
                vid = entry['id']
                ext = entry.get('ext', 'm4a')
                actual_file = f"audio/{vid}.{ext}"
                if not os.path.exists(actual_file):
                    # Check for .webm or .m4a
                    for cand_ext in ['m4a', 'webm', 'mp4', 'opus', 'mp3']:
                        cand = f"audio/{vid}.{cand_ext}"
                        if os.path.exists(cand):
                            actual_file = cand
                            break

                duration_sec = entry.get('duration', 200)
                manifest[song_id] = {
                    'file': actual_file,
                    'duration': duration_sec,
                    'title': entry.get('title', query)
                }
                print(f"SUCCESS {song_id} -> {actual_file} ({duration_sec}s)")
                with open(manifest_path, 'w', encoding='utf-8') as f:
                    json.dump(manifest, f, indent=2)
        except Exception as e:
            print(f"FAILED {song_id}: {e}")

print("DOWNLOAD SUMMARY: Total saved tracks:", len(manifest))

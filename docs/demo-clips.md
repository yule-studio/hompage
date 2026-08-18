# Demo clips

The project tiles in the portfolio grid play a walkthrough of the project, cut
into one clip per screen. Every section is its own card and all of them sit in
one row inside the tile: the card whose turn it is takes the width and plays,
the rest fold down to slivers beside it. When a clip ends its card hands the
width to the next one — a relay along the row, then back to the start.

Source recordings live in `public/media/`, the cut sections in
`public/media/demo/`, and the section list in `src/data/projectDemos.ts`.

## Why the clips are cut, not just played

A screen recording of a whole site is one long scroll: at tile size you cannot
say what it showed. Cut at its section boundaries it becomes a list — Intro,
About, Portfolio — that reads at a glance.

The recordings also arrive padded. A browser window captured into a portrait
canvas leaves dead bands above and below the viewport, which on a dark card look
like nothing at all. Cropping to the viewport removes them and the interface
fills the frame.

## Re-cutting after a new recording

1. Record the walkthrough and drop it in `public/media/<slug>-demo.mp4`.

2. Find the viewport inside the frame. Pull one still and read off where the
   browser content starts and ends:

   ```sh
   ffmpeg -ss 5 -i public/media/hompage-demo.mp4 -frames:v 1 /tmp/frame.png
   ```

   For the 2026-08 recording — a 3024×1964 full-screen capture — the page
   viewport starts below the bookmarks bar, giving `crop=2988:1650:0:314`. The
   width stops short of 3024 to drop the page scrollbar.

3. Find the section boundaries. A contact sheet at 1 fps is usually enough; go
   to 2 fps around a transition to pin it down:

   ```sh
   ffmpeg -i public/media/hompage-demo.mp4 \
     -vf "fps=1,scale=300:-1,tile=6x7" -frames:v 1 /tmp/sheet.jpg
   ```

4. Cut each section. The poster comes from the **middle** of the clip, not its
   first frame — a transition frame names the card badly, the middle of a
   section always shows it:

   ```sh
   SRC="$HOME/Downloads/녹화.mov"          # the capture as recorded
   CROP="crop=2988:1650:0:314"

   cut() {                       # cut <key> <start> <duration>
     mid=$(python3 -c "print($2 + $3/2)")
     ffmpeg -ss "$2" -t "$3" -i "$SRC" -vf "$CROP,fps=30,scale=1280:-2" -an \
       -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p -movflags +faststart \
       -y "public/media/demo/hompage-$1.mp4"
     ffmpeg -ss "$mid" -i "$SRC" -frames:v 1 -vf "$CROP,scale=1280:-2" -q:v 5 \
       -y "public/media/demo/hompage-$1.jpg"
   }
   ```

   The 2026-08 cut, for reference:

   | key | start | duration | label |
   | --- | --- | --- | --- |
   | `intro` | 2.6 | 7.7 | Intro (splash into the hero) |
   | `about` | 10.5 | 10.5 | About (profile, record, and a record opened) |
   | `portfolio` | 27.0 | 6.8 | Portfolio (the grid, then a project opened) |
   | `contact` | 34.7 | 1.7 | Contact |

   Four clips come to about 1.9 MB at 1280 wide. The capture is 60 fps and a
   retina screen; 30 fps at 1280 is still sharper than the card will ever be
   drawn, and halves the file.

   The full walkthrough is kept at `public/media/hompage-demo.mp4`, re-encoded
   smaller (1152 wide, crf 30). It is the source the cuts come from, and the
   fallback a project with no `sections` falls back to.

5. List them in `src/data/projectDemos.ts`. `rate` slows playback: a recording
   made at reading speed is unfollowable once it is a thumbnail, and 0.6 is
   about right. It costs nothing — the browser does it, not the file.

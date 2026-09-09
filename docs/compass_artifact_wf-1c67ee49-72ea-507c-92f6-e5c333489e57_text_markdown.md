# Build Brief: Golf Swing Training Website (Content Database + Coding Spec)

## TL;DR
- You can build this as a mobile-first single-page app where the golfer picks a club and a right/left handedness toggle, then sees a "Setup Card" (stance, ball position, posture, grip, swing sequence) plus a "My ball went..." fault-fixer button; the whole thing runs off two editable JSON files (clubs and faults), so no database is needed for version 1.
- Part 1 and Part 2 below are your ready-to-paste content database, researched from PGA/TrackMan/Shot Scope/Arccos/Golf Digest/GOLF.com and named instructors; Part 3 is the build spec you hand to the coding agent, including a full list of image-generation prompts with a consistent art style, color coding, and a file-naming convention.
- The single most important engineering decision is to generate all instructional images text-free and character-consistent for a right-handed golfer, then mirror them for lefties with CSS `transform: scaleX(-1)`; this halves your image count and keeps left- and right-handed instruction perfectly in sync.

---

## How to use this document
Part 1 (instruction database) and Part 2 (fault library) are your content. Paste them into your `clubs.json` and `faults.json` as described in Part 3, rewritten in your own words. Part 3 is the technical brief you give directly to the AI coding agent. Everything in Parts 1 and 2 is written so it applies to a right-handed golfer by default, with "lead" and "trail" language so it mirrors cleanly for left-handers. Lead side means the side closest to the target (left for a right-hander, right for a left-hander). Trail side is the other one.

A note on the numbers: golf instruction is full of ranges, not laws. Where sources disagree I have given a sensible starting range and named who says what. Tell your users these are starting points to test on the range, not commandments.

---

# PART 1: GOLF INSTRUCTION CONTENT DATABASE

## 1.1 Ball position progression

The rule is simple. The longer the club, the farther forward the ball sits. The driver is played off the lead heel so you can catch it on the way up. As clubs get shorter the ball moves back toward the middle of your stance so you catch it on a slight downswing. This framing comes from Butch Harmon writing in Golf Digest and from GOLF.com's setup guides, and modern launch-monitor coaches (Ball Flight Academy, citing TrackMan and FlightScope) note the ball stays closer to the lead heel across the bag than the older "wedge off the back foot" teaching suggested.

| Club | Ball position (relative to stance) |
|---|---|
| Driver | Off the lead heel / in line with lead armpit |
| 3-wood, 5-wood | About one to two ball-widths back of the lead heel |
| Hybrids (3H/4H) | Two to three ball-widths back of the lead heel |
| 4-iron, 5-iron | Just forward of center |
| 6-iron, 7-iron | Center of stance |
| 8-iron, 9-iron | Center to a touch back of center |
| PW, GW, SW (full) | Center to one ball back of center |
| LW / finesse wedges | Center to slightly back, depending on shot |
| Bunker (greenside) | Forward, roughly off the lead heel/armpit |
| Chip | Back of center (just ahead of trail big toe) |
| Pitch | Center |
| Putter | Slightly forward of center, eyes over or just inside the ball |

A caution to include in your content: the biggest problem from a wrong ball position is trajectory and low-point control, not just direction. Ball too far forward tends to produce thin or ballooned shots; too far back tends to produce chunks and lower flight (WhyGolf, MyGolfSpy).

## 1.2 Stance width

Use the golfer's own shoulders as the reference rather than fixed inches, because body size varies. Ben Hogan's framework (via The Grateful Golfer) and MyGolfSpy both land in the same place: widest for driver, shoulder width for mid-irons, narrower for wedges and short-game shots.

| Club group | Stance width |
|---|---|
| Driver | Feet just outside shoulder width (some coaches go a few inches wider for a stable base) |
| Fairway woods | Shoulder width to a hair wider |
| Hybrids / long irons | About shoulder width |
| Mid-irons (6-7) | Shoulder width (feet aligned under the shoulders) |
| Short irons (8-9) | Just inside shoulder width |
| Wedges (full) | Just inside shoulder width |
| Chip / pitch | Narrow, feet close together |
| Putter | About shoulder width, whatever feels balanced and quiet |

Content note to include: too narrow a stance causes swaying and inconsistent contact; too wide restricts hip rotation and can cause blocks and early extension (Foy Golf Academy).

## 1.3 Distance from the ball, posture, and hands

Set up by hinging from the hips (not slouching the shoulders), letting the arms hang so the hands sit roughly under the chin/shoulders. A common checkpoint is a gap of about a hand-width (a fist) between the butt of the grip and your lead thigh for irons, a touch more for the driver because the shaft is longer and flatter.

Posture checkpoints across the bag:
- Knee flex: athletic, soft, not squatting. Weight balanced over the middle of the feet, not on heels or toes.
- Hip hinge: tilt from the hip sockets so the tailbone moves back and the back stays fairly straight.
- Spine tilt: for every full-swing club the spine tilts slightly away from the target at address because the trail hand sits lower on the grip. This tilt is largest with the driver.
- Shoulder alignment: shoulders, hips, knees, and feet all run parallel to the target line, like two rails of a railroad track. The feet line points parallel-left of the target for a right-hander (parallel-right for a left-hander), not at the target itself.

### Driver-specific posture (secondary axis tilt)
The driver is the one club you want to hit slightly on the way up, so you set more tilt away from the target at address. Sources put this secondary axis (spine) tilt at roughly 5 to 15 degrees away from the target (dialedgolf, citing setup work), and Golf Digest's angle-of-attack instruction recommends no more than about 10 degrees of tilt plus a level pelvis. Titleist's teaching on this ("Proper Spine Tilt to Maximize Driver Distance") ties the tilt directly to producing a slightly ascending angle of attack. The head stays behind the ball through impact.

## 1.4 Weight distribution at address

| Club / shot | Weight at address |
|---|---|
| Driver | Slightly favoring the trail foot, roughly 55/45 to 60/40, with spine tilted away from target |
| Fairway woods | About 50/50, or a touch trail-side |
| Hybrids / irons | About 50/50 |
| Short irons / full wedges | 50/50 to slightly lead-side |
| Pitch | About 55 to 60 percent on the lead foot (GolfTEC, Colorado AvidGolfer) |
| Chip | About 60 to 80 percent on the lead foot for a downward, ball-first strike |
| Greenside bunker | About 80 percent lead foot, feet dug in |
| Putt | Roughly 50/50, quiet and centered |

## 1.5 Foot flare and alignment

Set the trail foot roughly square (perpendicular to the target line) and flare the lead foot out toward the target maybe 20 to 30 degrees to let the hips clear through impact (Hogan's advice via The Grateful Golfer). Some players lightly flare the trail foot too for the driver to allow a bigger turn. The alignment image should show the classic "railroad tracks": one rail is the ball-to-target line, the parallel rail is the toe line, and feet, knees, hips, and shoulders all sit on that parallel rail.

## 1.6 Tee height

- Driver: with a modern large (460cc) head, tee it so about half the ball sits above the crown when the club is soled next to it. Golfers fighting pop-ups should start at half-a-ball above the crown; players who want maximum carry sometimes go to the full ball above the crown (LiveAbout, citing Michael McCord; MyGolfSpy).
- Fairway wood off a tee: low, with the ball sitting just above the turf so you can still sweep it.
- Iron off a tee (par 3s): barely off the ground, just enough to sit the ball on top of the grass so you can still hit down on it.

## 1.7 Grip

### Three ways to hold it
- Ten-finger (baseball): all ten fingers on the grip, hands touching but not linked. Easiest for beginners, juniors, smaller hands, or players with hand/arthritis issues (HackMotion, Foresight).
- Interlock: trail-hand pinky links with the lead-hand index finger. Good for smaller hands; used by Jack Nicklaus, Tiger Woods, and Rory McIlroy.
- Overlap (Vardon): trail-hand pinky rests on top of, or in the gap between, the lead-hand index and middle finger. The most common grip on the PGA Tour; suits larger hands (Foresight, MyGolfSpy).

### Grip "strength" (hand rotation, not squeeze)
- Neutral: about 2 knuckles of the lead hand visible looking down, and both "V"s (formed by thumb and index of each hand) pointing toward the trail shoulder/cheek. Promotes a straight ball flight.
- Strong: 3 to 4 knuckles visible, hands rotated away from the target. Tends to close the face, promotes a draw, helps cure a slice.
- Weak: 0 to 1 knuckle visible, hands rotated toward the target. Tends to open the face, promotes a fade, can cure a hook.

Sources: HackMotion, Golf Monthly, Golf Distillery, MyGolfSpy.

### Where the grip sits and how hard to hold
The club runs more through the fingers of the lead hand (diagonally across the base of the fingers), not deep in the palm, which lets the wrists hinge. Grip pressure for full swings sits around 5 out of 10, firm enough to control the club without tension in the forearms.

### Putter grips
- Reverse overlap: the most common tour grip; the lead-hand index finger lays over the fingers of the trail hand. Quiets the hands and keeps the face steady.
- Left-hand low / cross-handed (lead hand below trail hand): helps level the shoulders and stop the lead wrist breaking down.
- Claw: trail hand holds the grip like a pen or claw, taking the trail hand out of the stroke; good for players who push/pull short putts.
Putter grip pressure is lighter, around 3 out of 10. Sources: BirdieBall, Rotary Swing, GolfLink, PrimePutt, Dan Bubany.

## 1.8 Swing type and intent by club

- Driver: sweep and hit up. Ascending angle of attack off a high tee for high launch and low spin.
- Fairway woods: shallow, sweeping strike; brush the turf, do not dig. Ball first with only a shallow brush of grass.
- Hybrids and long irons: shallow but slightly descending; a small divot after the ball is fine.
- Mid and short irons: descending strike with forward shaft lean, divot starts after the ball. This is what "compressing" the ball means.
- Wedges (partial): use the clock system. Picture your lead arm as the hand of a clock (6:00 is address). Common stops are 7:30 (roughly half), 9:00 (lead arm parallel, about 75 percent), and 10:30 (about 90 percent). Claude Harmon III teaches a 7:30 / 9:00 / 10:30 three-swing system matched to carry yardages; other coaches use 9:00 / 10:30 / full. Practice five balls at each stop and record the carry to build a personal wedge matrix. Sources: GOLF.com/Kevin Sprecher, Claude Harmon III via golfwell, Foy Golf Academy.
- Greenside bunker: open the clubface first, then take your grip. Open the stance (feet aimed left of target for a right-hander), put about 80 percent of weight on the lead foot, dig the feet in, play the ball forward, and strike the sand about one to two inches behind the ball. Accelerate all the way through; deceleration is the number one reason players leave it in the sand. Let the bounce of the wedge splash the sand out and the ball rides out on it. Sources: MyGolfSpy, Golf Distillery, WhyGolf, Golf Sidekick.
- Chipping vs pitching: a chip is ball-back, weight-forward, quiet wrists, low flying and rolling like a putt with loft; strike is ball-first. A pitch is ball-centered, weight around 55 to 60 percent lead, more wrist hinge, higher and softer with more spin. Sources: GolfTEC/Colorado AvidGolfer, HackMotion.
- Putting: a pendulum stroke powered by the shoulders rocking, wrists firm, eyes over or just inside the ball, arms hanging so they form a triangle with the shoulders. Sources: Rotary Swing, PrimePutt, GolfLink.

## 1.9 Swing sequence checkpoints (full swing)

1. Takeaway: one-piece move, hands, arms, and chest turn together; clubhead stays outside the hands, low and slow.
2. Halfway back: shaft parallel to the ground and parallel to the target line, toe of the club pointing up.
3. Top of backswing: lead arm comfortably straight, weight loaded into the trail side, back to the target, club face square (roughly parallel to the lead forearm).
4. Transition: weight shifts to the lead foot before the arms come down; the lower body leads.
5. Impact: hands ahead of the ball with forward shaft lean for irons, weight moving onto the lead foot, chest opening toward target. For the driver, the head stays back and the club is level or moving up.
6. Follow-through and finish: weight almost fully on the lead foot, hips and chest facing the target, belt buckle to the target, trail toe up, balanced and held.

## 1.10 Tempo

Aim for a 3:1 ratio of backswing time to downswing time. This came from John Novosel's book Tour Tempo and was later validated by a Yale study, "Towards a Biomechanical Understanding of Tempo in the Golf Swing" (2012) by physicist Robert D. Grober and Jacek Cholewicki, which found "remarkable uniformity" clustering around 3:1 across tour players regardless of overall swing speed. As a rough scale, tour full swings run roughly 750 to 950 milliseconds back and 233 to 296 milliseconds down. Short game and putting run closer to a 2:1 ratio. The practical cue is "one-two-three" going back, "one" coming down. Sources: Golf Digest (on the Grober lecture), Tour Tempo, Garmin.

## 1.11 Distances by club (carry, yards)

Read these as averages from large tracked datasets, not targets. Individual results vary widely, and range balls and range signs tend to read short. The cleanest large amateur dataset is Shot Scope (millions of tracked shots, reported by handicap; the roughly 15-handicap column is the best proxy for "average"). Golf Monthly and MyGolfSpy label the Shot Scope iron and wedge figures as carry.

Important sourcing correction: the widely quoted Arccos "224.7 yards" average male driver figure is total distance (carry plus roll), not carry, per the Arccos 2025 Annual Driving Distance Report (7th edition), which analyzed a random sample of 25,000 Arccos users and 6.5 million shots. So use it as a total-distance driver benchmark, and rely on the Shot Scope carry figures for the irons and wedges.

| Club | Avg male amateur carry (yds) | Avg female amateur carry (yds) | Loft (deg) |
|---|---|---|---|
| Driver | ~225 total (Arccos 2025); ~205-215 carry for ~90-94 mph | ~176 total (Arccos 2026, 2025 data: 175.7) | 9-12.5 |
| 3-wood | ~205-212 | ~157 | 15 |
| 5-wood | ~185-190 | ~146 | 18-19 |
| Hybrid (3H/4H) | ~188-195 | ~142 (4H) | 19-24 |
| 4-iron | 186 | ~150 | 21-24 |
| 5-iron | 169 | 140 | 25-27 |
| 6-iron | 162 | 129 | 30-31 |
| 7-iron | 154 | 119 | 34-35 |
| 8-iron | 146 | 110 | 37-39 |
| 9-iron | 136 | 95 | 41-43 |
| PW | 121 | 76 | 44-47 |
| GW | 104 | 64 | 50-52 |
| SW | 84 | 46 | 54-58 |
| LW | 75 | (not published; est. lower) | 58-64 |
| Putter | n/a | n/a | 1.5-4.5 |

Male irons/wedges: Shot Scope 15-handicap carry via Golf Monthly and MyGolfSpy. Female: Shot Scope 15-handicap women's column via MyGolfSpy/Golf Monthly, with driver average from the Arccos 2026 report (175.7 yards, down slightly from 179.2 in 2018). Loft ranges: Mitchell Golf, Golf Sidekick, Golf Guidebook.

For context, the PGA Tour driver carry averaged 282 yards in 2023 (TrackMan), from about 115 mph club speed and 171 mph ball speed (Golf Monthly). The LPGA Tour driver carry is about 223 yards from about 96 mph.

### Driver carry by swing speed (TrackMan-based optimal carry)
These are best-case numbers with efficient contact. Real amateur carry runs a bit lower because of off-center strikes.

| Driver swing speed | Optimal carry (yds) | Typical player |
|---|---|---|
| 80 mph | ~176-180 | Slower/senior male, strong female amateur |
| 90 mph | ~205-215 | Just below average male amateur |
| 100 mph | ~235-245 | Above-average / low handicap |
| 110 mph | ~265-275 | Strong low-handicap or short-hitting pro |
| 115 mph | ~282 | PGA Tour average carry |

Rule of thumb: roughly 2.3 to 2.5 yards of carry per 1 mph of club speed with good contact. The average male amateur converts about 2.29 yards per mph versus about 2.61 for a tour player (TrackMan via Swing Man Golf), which is why center-face contact matters as much as raw speed.

## 1.12 When to select each club

- Driver: off the tee on par 4s and par 5s when you want maximum distance and have room.
- 3-wood / 5-wood: long second shots on par 5s, tee shots on tight holes where you want more control than a driver, long par 3s. The 5-wood launches higher and lands softer than the 3-wood.
- Hybrids: replacements for hard-to-hit long irons, long approaches, shots from the rough, and long par 3s. Higher and softer-landing than the same-number iron.
- Long irons (4-5): long approaches for stronger players, low punch shots into wind, tee shots needing accuracy.
- Mid-irons (6-7): stock approach shots into greens; the 7-iron is most players' "yardstick" club.
- Short irons (8-9): shorter approaches where you want height and a ball that stops.
- Wedges (PW/GW/SW/LW): approach shots inside full-wedge range, pitches, chips, and bunker shots. SW is the default sand club; LW gives the highest, softest shots.
- Putter: on the green, and often the safest choice from the fringe or tightly mown areas around the green.

---

# PART 2: FAULT AND FIX LIBRARY ("Fix My Swing")

Directions below are written for a right-handed golfer. Your app must interpret the buttons through the handedness toggle. A ball curving to the golfer's right is a slice or push for a right-hander, but a hook or pull for a left-hander. Store the mechanism (for example "clubface open to path") and translate the literal direction with the toggle.

## 2.1 The ball flight laws (explain these once, up front)

Modern launch-monitor data (TrackMan, FlightScope, Foresight) rewrote the old teaching. Two facts drive everything:
1. The clubface angle at impact mostly sets where the ball starts. TrackMan's rule of thumb ("The Secret of the Straight Shot") is that horizontal launch is about 85 percent determined by face angle and 15 percent by club path for the driver, with the face's share nearer 75 percent for shorter irons.
2. The face angle relative to the swing path sets the curve. Face open to the path curves the ball away to the right (for a right-hander) into a fade or slice. Face closed to the path curves it left into a draw or hook. Face matching the path flies straight.

So the diagnosis order is: where did it start (face), and which way did it curve (face vs path). Sources: TrackMan, Adam Young Golf, WhyGolf.

## 2.2 The nine ball flights

Reference is a right-handed golfer. Mirror left/right for a left-hander.

| Start direction | No curve | Curves right (RH) | Curves left (RH) |
|---|---|---|---|
| Starts left (face left of target) | Pull | Pull-slice | Pull-hook |
| Starts straight (face at target) | Straight | Straight-slice (fade) | Straight-hook (draw) |
| Starts right (face right of target) | Push | Push-slice | Push-hook (push-draw) |

Reading it: start line tells you where the face pointed; the curve tells you the face-to-path relationship. Source: TrackMan-based framing via WhyGolf, SGreenGolf, Tee Time Tavern.

## 2.3 Slice
- What it looks like: for a right-hander the ball starts left or straight and curves hard right (mirror for a left-hander: starts right, curves hard left).
- Causes: clubface open relative to the path, out-to-in ("over the top") swing path, weak grip, casting/early release, shoulders aimed across the line, ball too far forward.
- Fixes: strengthen the grip until you see 2 to 3 knuckles on the lead hand; square the shoulders (check with an alignment stick across the chest); move the ball back half a ball-width; feel the forearms release and the face closing through impact.
- Drill: the headcover gate. Lay a headcover about six inches outside the ball on the target line; make swings that miss it, which forces an in-to-out path. Add a split-hand drill (trail hand three to four inches down the grip) to feel the release. Sources: Skillest, Golf Monthly, HackMotion, Golf Digest.

## 2.4 Hook
- What it looks like: for a right-hander the ball starts right and curves hard left, usually low and running (mirror for a left-hander).
- Causes: clubface closed relative to path, grip too strong (3 to 4 knuckles), lead wrist bowing too early, in-to-out path, overactive hands.
- Fixes: neutralize the grip toward 2 to 2.5 knuckles; square feet, hips, and shoulders; keep a touch of lead-wrist extension in the takeaway; neutralize the path.
- Drill: gate drill with two tees just wider than the clubhead a few inches ahead of the ball on the target line; catching the inside tee means the face is closing too early. Sources: HackMotion, About Golf, GolferHive.

## 2.5 Push and pull (no curve)
- Push (ball starts right of target and stays there, for a right-hander): face pointing right of target at impact with a path matching it, often an in-to-out path with a square-to-path face. Check alignment and ball position (too far back can cause it).
- Pull (ball starts left and stays there): face pointing left with a matching path, often an out-to-in path with a square-to-path face. Check that the shoulders are not aimed left and the ball is not too far forward.
- Push-slice and pull-hook are the combination misses in the table above and get the matching face-and-path fixes.

## 2.6 Fat (heavy) and thin (topped) shots
- Root cause of both: the low point of the swing is in the wrong place. Fat means the club bottoms out behind the ball; thin means it is still moving down or has bottomed out early and catches the ball on the way up.
- Causes: weight hanging back on the trail foot, ball too far forward, casting/early release, early extension (standing up), reverse pivot.
- Fixes: set about 55 percent of weight on the lead foot and keep pressure moving forward through impact; keep the handle leading the clubhead; check ball position.
- Drill: brush the grass drill. Make swings trying to brush the turf a couple of inches in front of a spot (or a tee), so the low point moves ahead of the ball. Sources: Adam Young Golf, HackMotion, Foy Golf Academy.

## 2.7 Shank (hosel strike)
- What it looks like: the ball rockets low and sharply toward the trail side (right for a right-hander) off the hosel.
- Causes: standing too close, weight moving toward the toes/ball (early extension), an out-to-in path that throws the hosel at the ball, ball too far forward.
- Fixes: stand a hair farther from the ball, feel weight in the heels through impact, swing more from the inside, keep the trail hip back (stop early extension).
- Drill: place a headcover or box just outside the ball and swing so the toe of the club, not the hosel, passes over the ball. Sources: GolferHive, sportsmonkie.

## 2.8 Sky / pop-up (driver)
- What it looks like: the ball goes almost straight up a short distance, often leaving a scuff (sky mark) on the crown.
- Causes: too steep, descending angle of attack on a club meant to be hit up; ball teed too high combined with the steep strike; ball too far back; weight not getting behind the ball; reverse pivot.
- Fixes: tee it so half the ball is above the crown, play the ball forward off the lead armpit, set spine tilt away from the target, and feel a sweeping, level-to-upward strike. Sources: MyGolfSpy, HackMotion, LiveAbout, The Left Rough.

## 2.9 Chunked or bladed chips
- Chunked (fat) chip: club hits ground first. Cause is usually weight hanging back and the handle falling behind. Fix: 60 to 80 percent weight on the lead foot, hands ahead, ball slightly back, quiet wrists, and rock the shoulders.
- Bladed (thin) chip: leading edge catches the ball's middle and it screams across the green. Cause is often trying to help the ball up or hanging back. Same fix: lead-weight, ball-first strike, and trust the loft. Sources: HackMotion, The Left Rough.

## 2.10 Bunker faults
- Leaving it in the sand: almost always deceleration or too square a face. Fix: open the face, commit to accelerating through, and enter the sand one to two inches behind the ball so the bounce splashes it out.
- Blading it over the green: you hit the ball first instead of the sand, usually from standing too close (too steep) or trying to lift it. Fix: dig the feet in, keep the low body quiet, aim at a spot in the sand behind the ball, not the ball. Sources: WhyGolf, MyGolfSpy, HackMotion.

## 2.11 Putting faults
- Pulling putts (missing left for a right-hander): face closed at impact, often from an overactive trail hand or shoulders opening early. Fix: reverse overlap or claw grip to quiet the hands, keep the stroke shoulder-driven, eyes over the ball.
- Pushing putts (missing right for a right-hander): face open at impact or ball too far back. Fix: check ball position (slightly forward) and eye line, keep the face square with a pendulum stroke.
- Distance control (three-putts): most three-putts come from speed, not line.
  - Ladder drill: place tees or an alignment stick at increasing distances and roll putts that each finish a little farther than the last without running past the zone. Trains stroke length for distance.
  - Gate drill: two tees just wider than the putter head form a gate a few inches ahead of the ball; roll putts through the gate to train a square start line.
  Sources: HackMotion, GolfTEC, BRUCE BOLT.

## 2.12 Distance control (shorter, longer, lower, higher)

### To hit it shorter
- Grip down (choke down) on the club. Golf Digest's launch-monitor test found gripping down one inch reliably takes off roughly 5 to 10 yards and lowers flight; other coaching sources cite about 4 to 5 yards per inch on irons. Go down about an inch and stand an inch closer.
- Take a shorter backswing (the clock system: 7:30 / 9:00 / 10:30).
- Take one more club and swing easier.

### To hit it longer
- Increase club speed (train it; it responds to work).
- Sequence better: lower body leads the downswing.
- Use the ground: push into the ground and post up on the lead leg.
- Keep width and create lag (wrist hinge held into the downswing).
- Above all, center-face contact. The efficiency gap between amateurs and pros is largely strike quality, worth big yardage without swinging harder.
- Equipment: correct loft and shaft flex for your speed; a fitting often finds "lost" distance. Sources: Golf Digest, TrackMan via Swing Man Golf, Lazrus.

### To hit it lower
Ball slightly back, weight a touch more forward, hands ahead to de-loft the face, and a shorter, "squeeze" follow-through.

### To hit it higher
Ball slightly forward, weight a touch more centered/behind, let the loft work, fuller finish.

## 2.13 Consistency
- Build a repeatable pre-shot routine: pick a target, set the face behind the ball first, then build the stance to the face, one look, and go.
- Use alignment sticks in practice to check that feet, hips, and shoulders run parallel to the target line.

---

# PART 3: WEBSITE BUILD SPECIFICATION (hand this section to the coding agent)

## 3.0 Product summary
Build a mobile-first web app for beginner and intermediate golfers to use at the driving range. The user selects a club from a grouped dropdown and toggles right- or left-handed. The app shows a Setup Card for that club: images and text checkpoints for stance and ball position, posture from two angles, grip, and a multi-frame swing sequence. A prominent "My ball went..." button opens a fault-fixer with cause, fixes, one drill, and an image for each miss. All content comes from two JSON files so a non-developer can edit it.

## 3.1 Recommended tech stack

Recommendation: React with Vite, content stored as static JSON, deployed as a static site (for example to Netlify, Vercel, or GitHub Pages).

Why this over the alternatives:
- Plain HTML/CSS/JS would work and has zero build step, but you will end up hand-writing repetitive DOM for 15 clubs and 10 faults across two handedness states, and re-rendering on toggle gets messy. Fine for a throwaway prototype, not ideal once you want favorites or a distance calculator later.
- Next.js is excellent but adds a server/SSR model and more configuration than a range reference tool needs in version 1. You can migrate to it later if you add user accounts.
- React plus Vite gives you component reuse (one `SetupCard`, one `FaultPanel`), fast builds, simple local state, easy `localStorage` persistence, and a trivial static deploy. It scales into the "nice to have later" list without a rewrite.

Keep all instructional content in `/src/data/clubs.json` and `/src/data/faults.json`. No backend or database for version 1. State (selected club, handedness, theme) lives in React state and is mirrored to `localStorage`.

## 3.2 Information architecture and UI

Top control bar (sticky on mobile):
- Club dropdown, grouped with option groups:
  - Woods: Driver, 3-wood, 5-wood
  - Hybrids: 3H/4H
  - Irons: 4, 5, 6, 7, 8, 9
  - Wedges: PW, GW, SW, LW
  - Putter
- Handedness toggle: Right / Left (segmented control, large).
- Optional theme toggle: light / dark.

Main view: the Setup Card for the selected club, made of image panels each with text checkpoints beneath:
1. Stance and Ball Position, overhead (top-down) view.
2. Posture, down-the-line view (from behind, along the target line).
3. Posture, face-on view.
4. Grip, close-up.
5. Swing Sequence, a multi-frame strip: address, takeaway, top, impact, finish.
Below the panels: a compact text checklist (stance width, ball position, weight, tempo, swing intent, typical carry distance, loft).

Fault-fixer: a prominent floating button labeled "My ball went..." (also readable as "Fix my swing"). Tapping it opens a panel of large tap targets: Left, Right, Too short, Too long, Too high, Too low, Fat, Thin, Shank, Sky. Selecting one shows a fault card: cause, two to three fixes, one drill, and an image. The Left and Right buttons must resolve through the handedness toggle. For a right-hander, "Right" surfaces slice/push; "Left" surfaces hook/pull. For a left-hander, reverse it. Show the plain-language name of the miss ("This is usually a slice") so the user learns the vocabulary.

## 3.3 Mobile-first layout and behavior
- Design for a phone held in one hand at the range. Single-column, large fonts, generous spacing.
- Tap targets at least 44 by 44 CSS pixels.
- Sticky top control bar so club and handedness are always reachable.
- Persist the last selected club, handedness, and theme in `localStorage` and restore on load.
- Images lazy-load; the swing sequence can be a horizontal swipe strip or a simple frame stepper.
- Dark and light themes optional but recommended (bright sun and evening range both happen).

## 3.4 Data model

### Club schema
```json
{
  "id": "7iron",
  "name": "7-Iron",
  "group": "Irons",
  "loftRange": { "min": 34, "max": 35, "unit": "deg" },
  "typicalCarry": {
    "maleAmateurYds": 154,
    "femaleAmateurYds": 119,
    "source": "Shot Scope 15-handicap, via Golf Monthly/MyGolfSpy (carry)"
  },
  "stance": "Feet about shoulder width.",
  "ballPosition": "Center of stance.",
  "distanceFromBall": "Hands under the chin, about a fist gap from the butt of the grip to the lead thigh.",
  "posture": {
    "kneeFlex": "Athletic, soft knees.",
    "hipHinge": "Tilt from the hips, back fairly straight.",
    "spineTilt": "Slight tilt away from target (trail shoulder lower).",
    "shoulders": "Parallel to the target line."
  },
  "weight": "About 50/50, or a touch onto the lead foot.",
  "grip": {
    "style": "Overlap or interlock",
    "strength": "Neutral: 2 knuckles visible, V's to trail shoulder",
    "pressure": "5/10"
  },
  "swingIntent": "Descending strike with forward shaft lean; divot starts after the ball.",
  "tempo": "3:1 backswing to downswing.",
  "checkpoints": [
    "Takeaway: one-piece, clubhead outside hands",
    "Halfway back: shaft parallel, toe up",
    "Top: lead arm straight, weight loaded on trail side",
    "Impact: hands ahead of the ball, weight moving to lead foot",
    "Finish: balanced, belt buckle to target"
  ],
  "commonUses": "Stock mid-iron approach; most players' yardstick club.",
  "images": [
    "7iron_rh_overhead_stance.png",
    "7iron_rh_downline_posture.png",
    "7iron_rh_faceon_posture.png",
    "7iron_rh_grip_closeup.png",
    "7iron_rh_sequence.png"
  ]
}
```

### Fault schema
```json
{
  "id": "slice",
  "label": "Ball curves away to the right (RH) / left (LH)",
  "buttonTrigger": "right",
  "appliesToClubs": ["driver","3wood","5wood","hybrid","4iron","5iron","6iron","7iron","8iron","9iron","pw","gw","sw","lw"],
  "plainName": "Slice",
  "causes": [
    "Clubface open relative to the swing path",
    "Out-to-in (over-the-top) path",
    "Grip too weak",
    "Casting / early release"
  ],
  "fixes": [
    "Strengthen the grip to 2-3 knuckles on the lead hand",
    "Square the shoulders to the target line",
    "Feel the forearms release and the face close through impact"
  ],
  "drills": [
    "Headcover gate: lay a headcover 6 inches outside the ball on the target line and swing so you miss it (trains in-to-out path)"
  ],
  "image": "fault_slice_rh.png",
  "handednessNotes": "For a right-hander the ball curves right; for a left-hander it curves left. The 'Right' button surfaces this for RH; the 'Left' button surfaces it for LH.",
  "source": "Skillest, Golf Monthly, HackMotion, TrackMan ball-flight laws"
}
```

The app resolves the fault-fixer by combining `buttonTrigger` with the handedness toggle. Store two mappings: for RH, {right: [slice, push], left: [hook, pull], ...}; for LH, swap left and right. The `tooShort`, `tooLong`, `tooHigh`, `tooLow`, `fat`, `thin`, `shank`, `sky` triggers are handedness-neutral and map directly.

## 3.5 Left-hander mirroring strategy

Recommendation: generate every instructional image once for a right-handed golfer, text-free, and flip horizontally in the browser with CSS `transform: scaleX(-1)` when the handedness toggle is set to Left. This halves the image count and guarantees the left- and right-handed views never drift out of sync.

When flipping is safe: it is safe precisely because you will render the images with no text, no logos, no club branding, and a symmetric or neutral background. A flat studio-gray or white gradient background flips invisibly.

When flipping breaks, and how you avoid it:
- Baked-in text or numbers flip into mirror writing. Solution: never bake text into images; all labels are live HTML/SVG overlays drawn by the app, so they read correctly in both states.
- Logos and club branding flip. Solution: prompts explicitly forbid logos and branding.
- Asymmetric backgrounds (a flag on the left, a tree on one side) reveal the flip. Solution: keep backgrounds neutral and symmetric.
- Any directional label baked into the art (an arrow with the word "target"). Solution: draw target lines and arrows as app overlays, or keep them purely graphic and symmetric.

Because color-coded overlays (target line, ball marker, spine line, lead-side highlight) are drawn by the app as SVG on top of the flat illustration, they can be repositioned or relabeled per handedness without regenerating art. Only if a later version wants photoreal images with shadows and asymmetric lighting would you generate separate LH art.

## 3.6 Image generation prompts

### Global style block (prepend to every prompt)
"Clean flat vector instructional illustration, minimalist line-art diagram style, single male golfer character with the same plain outfit in every image (light grey polo, dark grey trousers, white cap, no logos, no brand marks), neutral flat light-grey studio background with a subtle floor gradient, soft even lighting, no text, no numbers, no words, no watermark, no signature, crisp clean lines, muted natural color palette. Right-handed golfer."

### Global negative prompt (append to every prompt)
"no text, no letters, no numbers, no words, no watermark, no logo, no brand names, no extra limbs, no distorted hands, no duplicate clubs, no busy background, no spectators, no clutter, not photorealistic, no lens flare."

### Color-coding conventions (state these inside each relevant prompt and also enforce via app overlays)
- Target line: a single bright blue line on the ground from ball to target.
- Toe/stance line: a parallel bright blue dashed line at the feet ("railroad tracks").
- Ball: solid white with a thin dark outline.
- Ball-position marker: a small orange vertical tick on the ground.
- Spine/posture angle: a thin green line along the spine.
- Lead side of the body (arm, leg): highlighted with a subtle warm-yellow accent so users can see which side is the target side.
- Weight distribution: a small semi-transparent footprint shading, darker under the foot bearing more weight.

Keep these as SVG overlays where possible so a left-flip can reposition them. If baked into the illustration, keep them symmetric-friendly.

### Aspect ratios
- Overhead stance and ball position: 1:1 (square).
- Down-the-line posture: 4:5 (portrait) to fit phones.
- Face-on posture: 4:5.
- Grip close-up: 1:1.
- Swing sequence strip: 16:9 or a 5-frame horizontal 5:2 strip.
- Fault images: 4:3.

### File naming convention
`{clubid}_{hand}_{view}_{topic}.png`, for example `7iron_rh_overhead_stance.png`. Because you flip in CSS, you generate only the `rh` set. Fault images: `fault_{faultid}_rh.png`. Keep everything lowercase with underscores.

### Full version-1 image list with prompts

Per-club images (repeat for each of the 15 clubs, substituting the club and its specifics from Part 1). Below are the five reusable prompt templates, then the club-specific values to swap in.

1. Overhead stance and ball position (`{club}_rh_overhead_stance.png`, 1:1)
"[Global style]. Top-down overhead view looking straight down at a right-handed golfer's feet and a golf club soled on the ground. Show foot positions and stance width, the golf ball as a white circle, an orange tick marking ball position relative to the feet, a bright blue target line running from the ball forward, and a parallel blue dashed line across the toes forming railroad tracks. Stance width for this club: [STANCE]. Ball position: [BALLPOS]. Lead foot flared slightly toward the target. [Global negative]."

2. Down-the-line posture (`{club}_rh_downline_posture.png`, 4:5)
"[Global style]. View from directly behind the golfer looking down the target line at address. Show hip hinge, soft knee flex, arms hanging under the shoulders, and the hands' distance from the body. Draw a thin green line along the spine to show posture angle, and a bright blue target line on the ground going away toward the horizon. Club: [CLUB]. Ball position [BALLPOS]. [Global negative]."

3. Face-on posture (`{club}_rh_faceon_posture.png`, 4:5)
"[Global style]. Face-on view of the golfer at address, camera level with the chest. Show stance width, ball position between the feet with an orange tick marker, spine tilt slightly away from the target (trail shoulder lower) shown with a thin green line, and weight distribution shown as subtle shading under the feet ([WEIGHT]). Highlight the lead arm and lead leg with a subtle warm-yellow accent. Club: [CLUB]. [Global negative]."

4. Grip close-up (`{club}_rh_grip_closeup.png`, 1:1)
"[Global style]. Extreme close-up of two hands gripping a golf club, angled as the golfer looks down at address. Show a neutral grip with two knuckles of the lead hand visible and the V of each hand pointing toward the trail shoulder. Show the club running through the fingers, not the palm. [GRIPSTYLE: overlap / interlock / reverse overlap for putter]. Clean and clear finger detail. [Global negative]."

5. Swing sequence strip (`{club}_rh_sequence.png`, 5-frame 5:2)
"[Global style]. A horizontal strip of five equally spaced frames of the same golfer showing the swing in sequence, face-on: frame 1 address, frame 2 takeaway (shaft parallel, toe up), frame 3 top of backswing (lead arm straight, back to target), frame 4 impact (hands ahead of the ball, weight on lead foot, [for driver: head behind ball, club level/upward]), frame 5 finish (balanced, hips and chest to target, trail toe up). Consistent character and outfit across all five frames. Club: [CLUB]. [Global negative]."

Club-specific values to substitute (from Part 1):

| Club | STANCE | BALLPOS | WEIGHT | Swing note |
|---|---|---|---|---|
| Driver | Just outside shoulder width | Off lead heel | 55-60% trail, spine tilted away | Sweep up, head behind ball |
| 3-wood | Shoulder width | 1-2 balls back of lead heel | ~50/50 | Shallow sweep |
| 5-wood | Shoulder width | 1-2 balls back of lead heel | ~50/50 | Shallow sweep |
| Hybrid | Shoulder width | 2-3 balls back of lead heel | ~50/50 | Shallow descending |
| 4-iron | About shoulder width | Just forward of center | ~50/50 | Shallow descending |
| 5-iron | About shoulder width | Just forward of center | ~50/50 | Descending |
| 6-iron | Shoulder width | Center | ~50/50 | Descending |
| 7-iron | Shoulder width | Center | 50/50 to slight lead | Descending, shaft lean |
| 8-iron | Just inside shoulder width | Center to slightly back | Slight lead | Descending, shaft lean |
| 9-iron | Just inside shoulder width | Center to slightly back | Slight lead | Descending, shaft lean |
| PW | Just inside shoulder width | Center to one ball back | Slight lead | Descending, shaft lean |
| GW | Just inside shoulder width | Center to one ball back | Slight lead | Descending, control |
| SW | Just inside shoulder width | Center (forward for bunker) | Slight lead (80% for bunker) | Splash for bunker |
| LW | Just inside shoulder width | Center to slightly back | Slight lead | High, soft |
| Putter | About shoulder width | Slightly forward of center | ~50/50 | Pendulum, shoulders rock |

Special extra images to generate:
- Bunker setup (`sw_rh_bunker_setup.png`, 4:3): "[Global style]. Face-on view of a golfer set up for a greenside bunker shot in sand. Open clubface, open stance with feet aimed left of the blue target line, weight ~80% on the lead foot shown by shading, ball forward off the lead heel, an orange mark in the sand one to two inches behind the ball to show the entry point. [Global negative]."
- Chip vs pitch comparison (`chip_pitch_rh_compare.png`, 16:9): "[Global style]. Two golfers side by side at address for comparison. Left: chip setup, narrow stance, ball back of center, hands ahead, weight forward, upright shaft. Right: pitch setup, ball centered, weight slightly forward, more wrist hinge. Orange ticks mark each ball position. [Global negative]."
- Putting setup (`putter_rh_faceon_posture.png` and `putter_rh_downline_eyesover.png`): the down-the-line one should show "eyes directly over the ball, a green dashed vertical line dropping from the eyes to the ball."
- Alignment railroad tracks (`concept_rh_alignment.png`, 16:9): overhead concept of feet/hips/shoulders parallel to the target line.
- Grip strength trio (`concept_rh_grip_strengths.png`, 16:9): three grip close-ups labeled by overlay (weak, neutral, strong) showing 1, 2, and 3-4 knuckles. Labels are app overlays, not baked in.
- Ball flight laws diagram (`concept_rh_ballflight.png`, 1:1): overhead of nine ball flights radiating from a ball, curves color-coded, no text (the app labels the grid).

Fault images (10, 4:3, `fault_{id}_rh.png`):
- `fault_slice_rh.png`: overhead showing an out-to-in path arrow and a ball curving right, blue target line for reference.
- `fault_hook_rh.png`: overhead, in-to-out path arrow, ball curving left.
- `fault_push_rh.png`: overhead, ball starting and staying right of the target line.
- `fault_pull_rh.png`: overhead, ball starting and staying left.
- `fault_tooshort_rh.png`: side view, golfer gripping down on the club (choke-down), shorter backswing indicated by a faint arc.
- `fault_toolong_rh.png`: side view, wide arc and full finish, ground-force post-up on lead leg.
- `fault_toohigh_rh.png`: side view, ball forward, fuller finish, high trajectory arc.
- `fault_toolow_rh.png`: side view, ball back, hands ahead, low trajectory arc.
- `fault_fat_rh.png`: side view, club entering turf behind the ball, low-point marker behind the ball in red, corrected low-point ahead in green.
- `fault_thin_rh.png`: side view, leading edge catching the ball's equator, low-point marker.
- `fault_shank_rh.png`: close-up of clubhead showing contact on the hosel (red) versus center-face (green).
- `fault_sky_rh.png`: side view, steep descending arc into a teed ball, ball popping straight up, sky mark on crown.

(Note: that is twelve fault images because Left/Right each resolve to two named misses plus the eight neutral ones; generate all listed so every resolved fault has art.)

## 3.7 Accessibility
- Every image needs descriptive alt text generated from its data (for example: "Overhead view of a 7-iron setup showing a shoulder-width stance with the ball in the center and the target line running forward"). Store an `alt` field per image in the JSON.
- Color contrast at WCAG AA or better; do not rely on color alone to convey the target line or lead side, also use shape and position and text labels.
- Full keyboard navigation: the club dropdown, handedness toggle, fault buttons, and sequence stepper must be reachable and operable by keyboard, with visible focus states and ARIA labels.
- Respect `prefers-reduced-motion` for any sequence animation; provide a static frame stepper as the default.
- Text resizes cleanly; layout does not break at 200 percent zoom.

## 3.8 Build order and milestones

Milestone 1: Skeleton. React plus Vite project, top control bar with the grouped club dropdown and handedness toggle, `localStorage` persistence. Acceptance: selecting a club and toggling handedness updates state and survives a refresh.

Milestone 2: Data and Setup Card. Load `clubs.json`, render the Setup Card text checkpoints for all 15 clubs with placeholder image boxes. Acceptance: every club shows correct stance, ball position, weight, grip, tempo, intent, distance, and loft text; nothing is missing or mismatched.

Milestone 3: Images and mirroring. Drop in the generated right-handed images; implement CSS `scaleX(-1)` flip on the Left toggle; overlay the color-coded SVG lines. Acceptance: the LH view mirrors correctly, target line and lead-side highlight land on the correct side, and no text appears reversed.

Milestone 4: Fault-fixer. Load `faults.json`, build the "My ball went..." panel, wire Left/Right resolution through the handedness toggle. Acceptance: for a right-hander, "Right" shows slice/push; toggle to left-handed and "Right" now shows hook/pull; each fault shows cause, fixes, one drill, and an image.

Milestone 5: Polish. Dark/light theme, accessibility pass (alt text, keyboard, contrast), lazy loading, mobile layout QA on a real phone at a range. Acceptance: passes an automated a11y check and is comfortably usable one-handed outdoors.

## 3.9 Nice to have later
- Video embeds for each drill.
- Favorites and a personal notes field per club (stored locally, or in accounts if you add a backend).
- A swing-speed-to-club-distance calculator using the Part 1 tables.
- A "build my wedge matrix" tool where the user logs their 7:30 / 9:00 / 10:30 carries.
- A practice-plan generator that assembles a range session from the user's logged misses.
- Personal distance tracking so the generic averages get replaced by the user's real numbers.

## 3.10 Legal and content notes
- Write all on-site text in your own words. Do not paste instructor content verbatim; the material in Parts 1 and 2 is already paraphrased for that reason, but review before publishing.
- Add a general sourcing/credits line, for example: "Instruction synthesized from public teaching by the PGA of America, Golf Digest, GOLF.com, Golf Monthly, TrackMan, Shot Scope, Arccos, and named instructors including Butch Harmon and Adam Young. Distances are averages from tracked-shot datasets and are starting points, not guarantees."
- Do not use any manufacturer or tour logos in generated images (the prompts already forbid this).
- Add a short disclaimer that this is general educational content, not a substitute for in-person coaching, and that golfers should warm up and play within their physical limits.

---

## Recommendations (staged next steps)
1. Start now with the Milestone 1-2 skeleton and the two JSON files, using the tables in Parts 1 and 2 verbatim as your first content pass. This gets a usable text-only tool in front of you fast, before any image work.
2. Generate images club by club using the style block and negative prompt in 3.6, and lock the character/outfit early. Generate the driver, 7-iron, sand wedge, and putter first, because those four exercise every layout (widest stance, stock iron, bunker special case, and putting). If they render cleanly and flip correctly, batch the rest.
3. Only build the fault-fixer (Milestone 4) after the Setup Card and mirroring work, because the fault panel reuses the same image pipeline and handedness logic. Doing it second avoids solving mirroring twice.
4. Replace generic distances with user-logged distances as soon as you can (the "nice to have" tracker). Benchmark to change course: if range testing shows your own carries differ from the table by more than about 10 yards on several clubs, switch the displayed numbers to your measured ones, because personalized yardages are far more useful than averages.
5. Threshold for moving off the static stack to Next.js plus a backend: do it only when you want accounts, cross-device sync, or shared content. Until then the static React/Vite build is the right call.

## Caveats
- Golf setup numbers are ranges, not laws. Sources disagree on exact stance widths, weight splits, and ball positions; I have given defensible starting ranges and named the sources, but treat them as tunable defaults.
- The Arccos "224.7 yard" average male driver figure is total distance (carry plus roll), per the Arccos 2025 report, not carry. Use it as a total-distance benchmark; the iron and wedge figures in the table are Shot Scope carry numbers, which is why the driver row is annotated separately.
- Female amateur data is thinner and more variable than male data across the whole industry; the female column (Shot Scope 15-handicap plus Arccos driver average of 175.7 yards) is the best available but carries more uncertainty, and a lob-wedge female carry was not published.
- The driver-carry-by-swing-speed table is TrackMan optimal carry (best-case, well-struck), so real amateur carries at each speed will run somewhat lower because of off-center contact.
- Several distance and instruction figures were aggregated by secondary sites (Golf Monthly, MyGolfSpy, Lazrus) citing Shot Scope, Arccos, and TrackMan; where possible I traced them to the named primary dataset, but a few fairway-wood and hybrid figures are Shot Scope "P-Avg" numbers whose carry-versus-total labeling is not fully specified.
- Ball-flight percentages (face roughly 85 percent of start line for the driver, nearer 75 percent for short irons) come from TrackMan's own rule-of-thumb guidance and vary with club and strike; present them as approximate, which the copy does.
- I was not able to independently re-verify every secondary distance figure against the original Shot Scope and Arccos PDFs within the research budget; the numbers are internally consistent and drawn from reputable aggregators, but the exact fairway-wood and female figures should be sanity-checked against the primary reports before you publish them as authoritative.
# Group 08 · Presentation prep

**Concrete Mix Design Calculator (IS 10262 : 2019, IS 456 : 2000)**
CE-203, IIT Mandi · submitted to Prof. Needhi Kotoky
Ved Deokar (B25106) · Vikas (B25107) · Vishandeep Kaur (B25108) · Yamini (B25109) · Yash Malik (B25110)

Everyone reads all of this. The professor may ask **any** of us to present any part, so each person should
be able to give every slide and answer every question below.

---

## 1. Running the deck

| What | How |
|---|---|
| Open the deck, no install | Double-click `presentation/dist/index.html` (Chrome or Edge). Works with no internet. |
| From the repo | `npm run present` (opens http://localhost:5180) |
| Rebuild the offline file | `npm run present:build` |
| Rebuild the PDF backup | `npm run present:pdf` → `presentation/Mix_Design_Presentation_G-8.pdf` |

**Keys**

| Key | Does |
|---|---|
| → · Space · PgDn (clicker) | next click / next slide |
| ← · PgUp | back |
| **P** | presenter mode: notes, next slide, timer, section targets |
| **T** / **R** | start-pause / reset the timer (it also starts itself when you leave the title slide) |
| **O** | overview of all slides, click to jump |
| **B** | jump to the backup slides, HTML deck only (B1 questions, B2 0.35 vs 0.36, B3 what-if, B4 sections) |
| **F** | full screen |
| `9` then Enter | go to slide 9 (live calculator) |
| H | key help |

**Projector setup (recommended):** laptop screen extended to the projector. Press **P** on the laptop, click
**Open audience window**, drag that window to the projector and press **F** in it. The two windows stay in
sync, including the live calculator. If anything goes wrong, close the audience window and just present the
normal view mirrored (no notes on screen, use this file on a phone instead).

**PowerPoint version:** `Mix_Design_Presentation_G-8.pptx` has the same 15 slides as pictures, with these
notes. On slides 9 and 10, the **Live demo** button opens the live calculator online
(…github.io/concrete-mix-design-calculator/presentation/?slide=9); press Alt+Tab to come back. It needs
internet; without it, double-click `Mix_Design_Presentation_G-8.html` and type `9` then Enter.

**If the laptop fails:** open the PDF backup on any computer. Every slide is there, with the interactive
slides frozen in the M40 Annex A state, and the procedure slide expanded to show all 11 steps.

**If the Wi-Fi fails:** in the HTML deck nothing changes except slide 10, which shows a screenshot of the site
instead of the live page. The mini calculator on slide 9 runs the real engine offline.

---

## 2. Who says what (10:00)

| Part | Presenter | Slides | Time | Ends at |
|---|---|---|---|---|
| Intro + how we developed it | **Presenter 1** | 01 – 05 | 3:20 | 3:20 |
| Procedure + live calculator | **Presenter 2** | 06 – 10 | 4:20 | 7:40 |
| Verification + wrap-up | **Presenter 3** | 11 – 15 | 2:20 | 10:00 |

Per-slide budget: 01 0:30 · 02 0:45 · 03 0:50 · 04 0:55 · 05 0:20 · 06 1:15 · 07 0:40 · 08 0:25 · 09 1:30 ·
10 0:30 · 11 0:45 · 12 0:30 · 13 0:25 · 14 0:20 · 15 0:20 (total 10:00). Presenter mode shows "on time",
"behind" or "ahead" for each slide.

If we run long, cut in this order: slide 13 (say one line), slide 8 (one line), slide 10 (skip the live
site, just point at the QR code).

---

## 3. Script

Say it in your own words. **[Click]** means press → once.

### Presenter 1

**01 Title (0:30)**
Good afternoon. We are Group 08: Ved, Vikas, Vishandeep, Yamini and Yash. Our project is a concrete mix
design calculator. It follows IS 10262 : 2019 for proportioning, and checks every mix against the durability
limits of IS 456 : 2000. In ten minutes we will show how we built it, how to use it step by step, and how we
checked it is correct.

**02 The problem (0:45)**
Designing even one mix by hand means about eight table lookups, reading a value off a graph, and a long chain
of arithmetic. One slip, say in the cement volume, flows into both aggregate masses. And if the grade,
exposure or slump changes, you start again. **[Click]** With our calculator you enter the inputs once and get
the full working in under a second. Every step shows its clause, and the IS 456 limits are checked for you.

**03 The 1 m³ cube (0:50)**
Mix design fits in one cubic metre. This is the absolute volume method: each material takes up its solid
volume, mass divided by specific gravity times 1000. **[Click]** First 1 % entrapped air for 20 mm aggregate.
**[Click]** Cement, 412 kg, which is 0.143 m³. **[Click]** Water, 148 kg, and a little superplasticizer.
**[Click]** What is left, 0.695 m³, must be aggregate. **[Click]** We split it into fine and coarse aggregate
using Table 5. Fresh density comes out at about 2446 kg/m³.

**04 How we developed it (0:55)**
This is how we developed it. We studied IS 10262, IS 456 and IS 383 clause by clause and listed every table and
check. We typed every table into one data file, so the 2019 values are used everywhere. Figure 1 is a graph,
not a table, so we digitised its three curves at every 0.01 of w/c from 0.25 to 0.65: 123 points. The
calculator finds w/c by interpolating between the two points either side of the target strength. We wrote the
procedure as plain JavaScript functions, built the interface in React, and checked it against all six worked
examples of the standard. It is hosted free on GitHub Pages, and every update runs that check before going
live. There is no server; it runs in the browser. On the slide: you enter mix data, material test results and
admixture details. **[Click]** You get the calculation sheet with clauses, the IS 456 checks, the proportions
and ratio, grading, batch quantities, trial mixes and a printed report.

**05 Scope (0:20)**
IS 10262 has four design sections and we cover all four. Section 2 is normal grades, M10 to M60. *(Click
Section 3.)* High strength, M65 to M100, takes w/c from Table 8 instead of Figure 1. Section 4 is
self-compacting concrete, Section 5 is mass concrete with 80 or 150 mm aggregate. Now [Presenter 2] will show
the procedure.

### Presenter 2

**06 The procedure (1:15)**
This is how you use it; each step is tied to a clause. I'll use the M40 example of Annex A. *(Click through
quickly, one line each.)*
1. **Inputs:** M40, PPC, 20 mm, Zone II sand, slump 75, severe exposure.
2. **Target strength:** higher of 40 + 1.65 × 5 = 48.25 and 40 + 6.5 = 46.5, so 48.25.
3. **Air:** 1 % from Table 3.
4. **w/c:** Figure 1 at 48.25 gives 0.36; IS 456 allows 0.45; adopt 0.36.
5. **Water:** 186 from Table 4, + 3 % for slump 75 = 191.58, − 23 % for the superplasticizer = 148.
6. **Cement:** 148 ÷ 0.36 = 411.1, rounded up to 412; between 320 minimum and 450 maximum.
7. **Coarse aggregate fraction:** 0.62 from Table 5, + 0.028 for the lower w/c = 0.648.
8. **Absolute volumes:** 1 − 0.01 − 0.2947 = 0.695 m³ of aggregate.
9. **SSD mix:** 1234 kg coarse, 648 kg fine.
10. **Moisture:** dry aggregate absorbs 12 kg, so add 160 kg water.
11. **Trial mixes** at ±10 % w/c, then cube tests.

**07 Figure 1 live (0:40)**
This is Figure 1 drawn from our digitised data. The slider is the target strength; you can read the w/c on each
curve. Curve 2 is for OPC 43 and PPC. *(Drag to about 30.)* The red zone is not allowed by IS 456 for the
chosen exposure; here durability governs. *(Reset to 48.25.)* Our curve gives 0.3497, the standard reads 0.36
by eye. Both sit inside the ±0.01 band, the normal accuracy of reading a printed graph. That is why our report
said 0.35 and the code says 0.36.

**08 Durability (0:25)**
IS 456 Table 5 gives three limits for each exposure: minimum cement, maximum w/c, minimum grade. *(Click Mild,
then Extreme.)* Mild is 300 kg, 0.55, M20; Extreme is 360 kg, 0.40, M40. Table 6 adjusts the minimum cement
for aggregate size: +40 kg for 10 or 12.5 mm, −30 kg for 40 mm. For any exposure, more than 450 kg of cement
needs special care.

**09 Live mini calculator (1:30)**
This panel runs the real engine of our calculator, offline. *(Click each preset.)*
- **M40 Annex A:** 412 cement, 1234 coarse, 648 fine, ratio 1 : 1.57 : 3.00, all checks pass.
- **Exposure → Extreme:** limits tighten to 0.40 and 360 kg, but strength still governs, so the mix does not change.
- **Slump 75 → 125:** water 148 → 156 (3 % per 25 mm), so cement 412 → 434.
- **20 → 10 mm:** water 165, minimum cement 360, cement 459, so the **450 kg check turns red**.
- **Chute → Pumping:** coarse aggregate cut by 10 % (1234 → 1104 kg) to make the mix pumpable.
- **M20 in Severe:** Figure 1 gives 0.54, IS 456 caps it at 0.45, and M20 **fails** the minimum grade of M30.

**10 Full demo (0:30)**
The QR code and link open the full calculator; you can try it on your phone. If there is time, or if you ask,
we switch to the site and go through the checklist. Now [Presenter 3] will show how we verified it.

### Presenter 3

**11 Verification (0:45)**
IS 10262 has six worked examples, Annexes A to F. We built all six into the calculator and compare every
printed value. This is Annex A: all 14 values match exactly, from 48.25 target strength to 160 kg water to add.
**[Click]** Across all six annexes, 83 of 83 values agree and 62 match exactly. The rest differ only by how the
standard itself rounds: under 1 kg/m³ in Sections 2, 3 and 5; Annex E rounds each volume first, so it is 3 kg
off. This check runs automatically before every deploy.

**12 Hand vs calculator (0:30)**
We designed the M40 by hand for our report. We read 0.35 from the graph and got 423 kg cement and 1 : 1.52 :
2.91. The calculator in auto mode also reads 0.35 and gives exactly the same. **[Click]** The standard reads
0.36. Typing 0.36 into the calculator gives 412, 1234 and 648, exactly Annex A. So both are right; the only
difference is reading the graph, within ±0.01.

**13 Extra features (0:25)**
Aggregate grading: blending 20 mm and 10 mm fractions 60 : 40 lands inside the IS 383 limits, as Annex A
says. Batch quantities: 8.24 bags of 50 kg per m³. Trial mixes at ±10 % w/c. Standard deviation from your own
cube results. Saved designs with JSON export, a methodology tab, and a printed A4 report.

**14 Limitations (0:20)**
It gives the first trial mix only; cube tests must confirm it. Figure 1 is a printed graph, so any reading
carries about ±0.01. Admixture water reduction depends on the product and must come from trials. Specific
gravities, absorption and cement strength must come from tests on the actual materials.

**15 Conclusion (0:20)**
Our calculator follows IS 10262 step by step for all four sections, applies IS 456 automatically, reproduces
the standard's own examples and matches our hand design. The QR code opens it. Thank you; we are happy to take
questions.

---

## 4. The M40 design, both ways

Inputs (IS 10262 Annex A): M40, PPC (fly ash based, SG 2.88, Figure 1 Curve 2), 20 mm crushed angular coarse
aggregate (SG 2.74, absorption 0.5 %), Zone II natural sand (SG 2.65, absorption 1.0 %), slump 75 mm, severe
exposure, reinforced, good site control, superplasticizer 1 % by mass of cement (SG 1.145, 23 % water
reduction), chute placing.

| Step | Clause | Working | w/c 0.36 (IS) | w/c 0.35 (our report) |
|---|---|---|---|---|
| Target strength | 4.2 | max(40 + 1.65 × 5, 40 + 6.5) | 48.25 N/mm² | 48.25 |
| Air | 5.2, Table 3 | 20 mm | 1 % = 0.01 m³ | same |
| w/c | 5.1, Fig. 1 | Curve 2 at 48.25; IS 456 max 0.45 | 0.36 | 0.35 |
| Water | 5.3, Table 4 | 186 × 1.03 = 191.58; × 0.77 = 147.52 | 148 kg | 148 |
| Cement | 5.4 | 148 ÷ w/c, rounded up | 411.11 → **412** | 422.86 → **423** |
| CA fraction | 5.5, Table 5 | 0.62 + (0.50 − w/c)/0.05 × 0.01 | 0.648 | 0.650 |
| FA fraction | 5.5 | 1 − CA | 0.352 | 0.350 |
| Cement volume | 5.7 | C ÷ 2880 | 0.1431 m³ | 0.1469 |
| Water volume | 5.7 | 148 ÷ 1000 | 0.148 m³ | 0.148 |
| Admixture | 5.7 | 1 % × C; ÷ 1145 | 4.12 kg, 0.0036 m³ | 4.23 kg, 0.0037 |
| All-in aggregate | 5.7 | 1 − air − paste | 0.695 m³ | 0.691 |
| Coarse aggregate, SSD | A-9 | V × CA × 2.74 × 1000 | **1234 kg** | **1231** |
| Fine aggregate, SSD | A-9 | V × FA × 2.65 × 1000 | **648 kg** | **641** |
| Mix ratio C : FA : CA | | | **1 : 1.57 : 3.00** | **1 : 1.52 : 2.91** |
| Fresh density | | sum of masses | 2446 kg/m³ | 2447 |
| Dry aggregate (A-11) | A-11 | 648 ÷ 1.01; 1234 ÷ 1.005 | FA 642, CA 1228 | |
| Water to add (A-12) | A-12 | 148 + 6 + 6 | 160 kg | |
| Trial mixes 3, 4 | 5.8 | w/c × 0.9, × 1.1 | 0.324 → 457 kg; 0.396 → 374 kg | |

Checks for M40 at 0.36: w/c 0.36 ≤ 0.45 ✓ · cement 412 ≥ 320 ✓ · cement 412 ≤ 450 ✓ · M40 ≥ M30 ✓.

---

## 5. The 0.35 vs 0.36 answer (learn this one)

> Figure 1 of IS 10262 is a **printed graph**, so any value read from it carries about **±0.01**. The standard
> reads **0.36** by eye at 48.25 N/mm². We digitised the curve, and our Curve 2 gives **0.3497 ≈ 0.35**. Our
> hand calculation also read 0.35.
>
> It is not an error on either side: the standard's own readings scatter **both ways** against the curve.
> Annexes A to C read 0.36 where the curve gives 0.350; Annex E reads 0.43 where it gives 0.425; Annex F reads
> 0.61 where it gives 0.620. A systematic error would go one way only.
>
> So the calculator shows its reading, shades the ±0.01 band on the plot, and lets the user type the w/c they
> read. With **0.36** entered it reproduces Annex A **exactly**: 412 / 1234 / 648. With **0.35** it gives
> our hand result: 423 / 1231 / 641. Both are valid first trial mixes; the trial batches decide.

---

## 6. Cement below the minimum, or above 450

**Below the IS 456 minimum** (Table 5, adjusted by Table 6 for aggregate size): the cement is **raised to the
minimum** and the **water is kept the same**, so the **actual w/c becomes lower** (water ÷ new cement). The
lower w/c is on the safe side for both strength and durability.
*Example (calculator):* M20, mild exposure, otherwise Annex A inputs. Figure 1 gives 0.54, water 148, cement
148 ÷ 0.54 = 274 → 275, below the 300 kg minimum, so it is raised to **300 kg**. Actual w/c = 148 ÷ 300 =
**0.49**.
*Note:* the calculator's sheet shows the raised cement and its effect on the aggregates, but for a mix with no
fly ash or slag it keeps printing the adopted w/c (0.54) rather than 0.49 (see the discrepancy list). If asked,
give the 0.49 answer.

**Above 450 kg/m³** (IS 456 cl. 8.2.4.2): cement over 450 kg/m³ should not be used unless special
consideration is given to the increased risk of **drying shrinkage cracking, early thermal (heat of
hydration) cracking and alkali–silica reaction**. The calculator flags it as a warning. To bring it down:
- use **more or a stronger superplasticizer** (more water reduction → less water → less cement at the same w/c);
- use a **larger aggregate** (20 → 40 mm needs less water, and IS 456 Table 6 allows 30 kg less cement);
- replace part of the cement with **fly ash or GGBS** (the check is on OPC content);
- or improve site control or use a higher-strength cement (lower S or a higher curve → higher w/c).
*Example:* Annex A with 10 mm aggregate needs 165 kg water and 459 kg cement → fails 450.

---

## 7. Fifteen likely questions

1. **What is mix design?** Choosing the amounts of cement, water, fine and coarse aggregate and admixture per
   m³ so the concrete reaches its target strength, workability and durability with no more cement than needed.
2. **Why f′ck = the higher of fck + 1.65 S and fck + X?** 1.65 S means only about 5 % of results should fall
   below fck. X (Table 1) is a floor so the margin is not too small when S is small. For M40: 48.25 vs 46.5.
3. **Where do S and X come from?** Table 2 gives assumed S (5 N/mm² for M30–M60, good control; +1 for fair).
   With 30 or more cube results, S is calculated from them (cl. 4.2.1.2); our calculator has that tool.
4. **Which governs, Figure 1 or IS 456?** The lower w/c. M40 severe: 0.36 < 0.45 → strength governs. M20 severe:
   0.54 > 0.45 → durability governs.
5. **Why 0.36 in the code but 0.35 in our report?** See section 5: eye-reading of a printed graph, ±0.01.
6. **Which curve for PPC?** Figure 1 Note 2: curve for the actual cement strength; without that data, Curve 2.
7. **How is water found?** Table 4 (186 kg for 20 mm at 50 mm slump), +3 % per extra 25 mm slump, minus the
   admixture's water reduction (23 % here): 186 × 1.03 × 0.77 = 147.5 → 148.
8. **Why does the coarse aggregate fraction change with w/c?** Table 5 is for w/c 0.50. A lower w/c gives a
   richer, more workable paste, so more coarse aggregate can be used: +0.01 per 0.05 decrease (cl. 5.5.1).
9. **Why reduce coarse aggregate for pumping?** More mortar so the mix flows through the pipe without
   blocking: up to 10 % (cl. 5.5.2), 5 % for high strength.
10. **Why correct for moisture?** Table values assume saturated surface-dry aggregate. Dry aggregate absorbs
    water, so we add it (148 + 12 = 160 kg); wet aggregate brings water, so we subtract it.
11. **How did you digitise Figure 1, and how do you read it?** Three curves at every 0.01 of w/c from 0.25 to
    0.65 (123 points, calibrated against the plot frame). For a target strength, find the two points either
    side and interpolate linearly for w/c.
12. **How do you know it is correct?** It reproduces all six IS annex examples: 83/83 values within the
    standard's rounding, 62 exactly, Annex A 14/14. `npm run verify` runs before every deploy.
13. **What does Section 3 (high strength) change?** w/cm from Table 8 instead of Figure 1, water from Table 7,
    air from Table 6, coarse aggregate from Table 10 at w/cm 0.30, mineral admixture dosages from Table 9.
14. **What are the limitations?** First trial mix only; ±0.01 on Figure 1; admixture water reduction and all
    material properties must come from tests and trials.
15. **What would you add next?** Cost per m³, embodied CO₂, revising the mix from trial batch results, and
    site moisture corrections for each batch (the draft deck's future-scope list).

**Quick facts:** IS 456 Table 5 (reinforced): Mild 300 / 0.55 / M20 · Moderate 300 / 0.50 / M25 · Severe 320 /
0.45 / M30 · Very severe 340 / 0.45 / M35 · Extreme 360 / 0.40 / M40. Table 6: +40 kg (10, 12.5 mm), −30 kg
(40 mm). Air (Table 3): 1.5 / 1.0 / 0.8 % for 10 / 20 / 40 mm. Water (Table 4): 208 / 186 / 165 kg.
Table 5 (2019), Zones IV / III / II / I: 10 mm 0.54 / 0.52 / 0.50 / 0.48 · 20 mm 0.66 / 0.64 / 0.62 / 0.60 ·
40 mm 0.73 / 0.72 / 0.71 / 0.69.

---

## 8. Demo checklist (slide 10)

1. Open the site → Section 2, M40 Annex A inputs.
2. Change grade, exposure and slump → watch the one cubic metre panel and the checks.
3. Figure 1 plot → digitised 0.35 with the ±0.01 band → enter 0.36 manually → 412 / 1234 / 648.
4. Calculation sheet → every line with its clause and substitution.
5. Verification tab → Annex A 14/14, all annexes 83/83.
6. Print report → the A4 sheet.

---

## 9. Where our report or draft deck disagrees with the code or the standard

Use the deck's numbers, not these.

1. **Report, Image 9 (coarse aggregate volume table)** shows IS 10262 : **2009** values (10 mm 0.50 / 0.48 /
   0.46 / 0.44; 40 mm 0.75 / 0.73 / 0.71 / 0.69). The **2019** values are 10 mm 0.54 / 0.52 / 0.50 / 0.48 and
   40 mm 0.73 / 0.72 / 0.71 / 0.69 (20 mm is unchanged).
2. **Report, Image 8 caption** says IS 456 Table 5 is "for different types of cement". It is for different
   **exposure conditions**.
3. **Report and draft deck use w/c 0.35** "from the curve". IS Annex A reads 0.36. Both are shown in the deck
   (slide 12, and backup B2 in the HTML deck).
4. **Report, Scope** says the high-strength procedure "includes self compacting and mass concrete". They are
   separate sections (4 and 5). The draft deck's "2 procedures" should be **4 sections**.
5. **Draft deck, M70 slide:** "26 kg silica fume". The calculator's default M70 gives **26.8 kg** (Annex D
   prints 26.75). Its 80.4 kg fly ash and w/cm 0.263 match the calculator default; Annex D prints 80.25 kg and
   0.264, because it rounds the cementitious content to the nearest kg (535) where the default rounds up (536).
6. **Draft deck, scope:** "10/20/40 mm" — Section 3 also uses 12.5 mm.
7. **Report, conclusion:** "reduces design time from by hand to a few seconds" has a missing phrase.
8. **Calculator behaviour (not changed):** when cement is raised to the IS 456 minimum in a mix with no
   mineral admixture, the sheet keeps the adopted w/c (e.g. 0.54) instead of showing the actual water ÷ cement
   (0.49), and the coarse aggregate adjustment and trial mixes use the adopted value.
9. `src/lib/team.js` lists "Vikas Kumar"; the deck uses "Vikas" as given in the brief.

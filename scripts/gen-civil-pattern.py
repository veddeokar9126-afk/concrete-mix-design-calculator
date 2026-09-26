# Generates src/assets/bg/civil-pattern.svg: a tiling wallpaper of civil works,
# drawn in the colours the materials actually have.
import random
random.seed(11)

CONC_F, CONC_S = '#b9b4a9', '#6f6a60'    # cement / concrete
STEEL = '#7a4a2e'                         # rebar, slightly rusted
CRANE = '#d99a1e'                         # crane yellow
WATER = '#2e86ab'
GROUND = '#8a7f70'
STONES = ['#6b7078', '#8d8173', '#7d756b', '#a39a8c', '#5f5c57']  # coarse aggregate
SAND = '#c4954a'

def P(d, s, w=1.3, f='none', extra=''):
    return f'<path d="{d}" stroke="{s}" stroke-width="{w}" fill="{f}" {extra}/>'
def R(x, y, w, h, s, f='none', sw=1.3, rx=0):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" stroke="{s}" fill="{f}" stroke-width="{sw}"/>'
def C(cx, cy, r, s, f='none', sw=1.2):
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" stroke="{s}" fill="{f}" stroke-width="{sw}"/>'
def g(tx, ty, body, s=1, rot=0):
    return f'<g transform="translate({tx} {ty}) rotate({rot}) scale({s})">{body}</g>'

def stones(n, w, h, sand=True):
    out = []
    for _ in range(n):
        x, y = random.uniform(0, w), random.uniform(0, h)
        rx = random.uniform(4, 13); ry = rx * random.uniform(0.55, 0.85)
        c = random.choice(STONES)
        out.append(f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" transform="rotate({random.uniform(0,180):.0f} {x:.1f} {y:.1f})" fill="{c}" stroke="#4a463f" stroke-width="0.8"/>')
    if sand:
        for _ in range(n * 3):
            out.append(f'<circle cx="{random.uniform(0,w):.1f}" cy="{random.uniform(0,h):.1f}" r="{random.uniform(0.8,1.8):.1f}" fill="{SAND}"/>')
    return ''.join(out)

crane = (P('M0 200V30M16 200V30', CRANE, 1.6)
  + P('M' + ' L'.join(f'{0 if i%2==0 else 16} {200-i*17}' for i in range(11)), CRANE, 1)
  + P('M-150 30H90M-150 22H0', CRANE, 1.6)
  + P(''.join(f'M{x} 30L{x+10} 22L{x+20} 30' for x in range(-150, -10, 20)), CRANE, 0.9)
  + P('M8 22V0M8 0L-130 22M8 0L80 30', '#5f5c57', 1)
  + R(60, 30, 28, 16, '#4f585e', CONC_F)
  + P('M-100 30V90', '#4f585e', 0.9)
  + P('M-110 90h20l-4 14h-12z', '#4f585e', 1.1, CONC_F)
  + P('M-20 200H40', GROUND, 1.4))

frame = (''.join(R(x-5, 0, 10, 180, CONC_S, CONC_F, 1) for x in (0, 60, 120, 180))
  + ''.join(R(-10, y, 200, 8, CONC_S, CONC_F, 1) for y in (40, 95, 150))
  + ''.join(P(f'M{x-2} 0V-18M{x+2} 0V-16', STEEL, 1.1) for x in (0, 60, 120, 180))
  + P('M8 147L52 102M8 102L52 147', '#8a5a0b', 0.9, extra='stroke-dasharray="3 3"')
  + P('M-20 180H200', GROUND, 1.4))

def arch_y(t): return 130*(1-t)**2 + 2*t*(1-t)*10 + 130*t**2
bridge = (R(0, 60, 320, 7, CONC_S, CONC_F, 1)
  + P('M10 130Q160 10 310 130', CONC_S, 2.2)
  + ''.join(P(f'M{10+300*t:.1f} 67V{arch_y(t):.1f}', CONC_S, 1) for t in [i/14 for i in range(1, 14)])
  + R(4, 67, 12, 63, CONC_S, CONC_F, 1) + R(304, 67, 12, 63, CONC_S, CONC_F, 1)
  + P('M-10 130H330', GROUND, 1.4)
  + P('M20 142c15-6 30 6 45 0s30-6 45 0s30 6 45 0s30-6 45 0', WATER, 1.3)
  + P('M60 152c15-6 30 6 45 0s30-6 45 0s30 6 45 0', WATER, 1))

truck = (R(0, 32, 150, 18, '#3c3f42', '#5f5c57', 1)
  + P('M150 50h40V20l-12-14h-28z', '#8c2a1e', 1.2, '#c0392b')
  + P('M162 8h14l8 12h-22z', '#2b3338', 0.8, '#bfd7e3')
  + '<ellipse cx="60" cy="12" rx="58" ry="24" transform="rotate(-12 60 12)" fill="#ece8df" stroke="#6f6a60" stroke-width="1.2"/>'
  + P('M18 0l80 22M12 16l86 10M30 -6l62 36', '#e07b24', 2)
  + P('M-10 22l18-8M-14 30l10 2', '#5f5c57', 1.2)
  + ''.join(C(c, 56, 10, '#222', '#3a3a3a') + C(c, 56, 3, '#999', '#bbb') for c in (30, 80, 170)))

cone = (P('M0 100l20-100h34l20 100z', '#4f585e', 1.3, '#d7dadc')
  + P('M8 0h58', '#4f585e', 1.2)
  + P('M100 100c3-36 16-50 42-50s46 10 50 50z', CONC_S, 1.2, CONC_F)
  + g(122, 70, stones(5, 42, 20, sand=False))
  + P('M140 50V10M132 10h16', '#4f585e', 1.2)
  + P('M-10 100H210', GROUND, 1.4)
  + P('M208 50v50M204 50h8M204 100h8', '#7c1d2f', 0.9)
  + '<text x="214" y="80" font-size="11" font-family="monospace" fill="#7c1d2f">slump</text>')

cube = (P('M0 40l50-18l50 18l-50 18z', CONC_S, 1.2, '#cfcac0')
  + P('M0 40v60l50 18V58z', CONC_S, 1.2, CONC_F)
  + P('M100 40v60l-50 18V58z', CONC_S, 1.2, '#a39e93')
  + P('M0 128h100M0 124v8M100 124v8', '#7c1d2f', 0.8, extra='stroke-dasharray="4 2"')
  + '<text x="36" y="144" font-size="11" font-family="monospace" fill="#7c1d2f">150</text>')

beam = (R(0, 0, 90, 140, CONC_S, CONC_F, 1.2)
  + R(10, 10, 70, 120, STEEL, 'none', 1, 4)
  + ''.join(C(x, y, r, '#4a2c1c', STEEL) for x, y, r in [(20, 20, 4), (70, 20, 4), (20, 120, 6), (45, 120, 6), (70, 120, 6)])
  + P('M-14 0v140M-18 0h8M-18 140h8', '#7c1d2f', 0.8)
  + P('M0 156h90M0 152v8M90 152v8', '#7c1d2f', 0.8))

rebar = (''.join(P(f'M0 {y}H240', STEEL, 3) for y in (0, 14))
  + ''.join(P(f'M{x} -6l6 26', '#5a3520', 0.9) for x in range(0, 240, 12)))

blend = (P('M0 0V120H200', '#4f585e', 1)
  + P('M0 110C40 105 60 70 100 45S170 8 200 4', '#7c1d2f', 1.6)
  + P('M0 116C50 112 70 90 110 60S175 20 200 12', SAND, 1.3, extra='stroke-dasharray="4 3"')
  + ''.join(P(f'M{x} 120v4', '#4f585e', 0.8) for x in range(0, 201, 25)))

cement_bag = (P('M0 10q0-10 10-10h60q10 0 10 10v70q0 10-10 10h-60q-10 0-10-10z', '#8a7f70', 1.2, '#e9e1cf')
  + R(12, 26, 56, 26, '#7c1d2f', 'none', 0.9)
  + '<text x="40" y="44" font-size="11" font-family="monospace" text-anchor="middle" fill="#7c1d2f">OPC 53</text>'
  + '<text x="40" y="72" font-size="9" font-family="monospace" text-anchor="middle" fill="#6f6a60">50 kg</text>')

W, H = 1000, 760
parts = [g(250, 60, crane), g(560, 120, frame), g(40, 330, bridge), g(560, 440, truck), g(70, 580, cone),
         g(830, 300, cube), g(420, 300, beam), g(760, 610, rebar, 1, -8), g(800, 36, blend, 0.8),
         g(360, 620, stones(14, 110, 70)), g(900, 680, stones(9, 80, 60)), g(870, 150, stones(7, 70, 50)),
         g(24, 190, cement_bag, 0.8)]
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" '
       f'stroke-linecap="round" stroke-linejoin="round"><g opacity="OPACITY">{"".join(parts)}</g></svg>')
import sys
open(sys.argv[1], 'w').write(svg.replace('OPACITY', sys.argv[2]))

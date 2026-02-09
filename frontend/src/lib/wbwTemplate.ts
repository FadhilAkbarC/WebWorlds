export const DEFAULT_WBW_TEMPLATE = `// WBW Game Template v2
// WBW is the only game engine language used by WebWorlds.
// Syntax quick reference:
// player x y [w h]
// set NAME value | add NAME value | sub NAME value
// bg #hex | color #hex
// rect x y w h | platform x y w h | circle x y r
// text "Message" x y
// spawn enemy|item x y [w h]
// on left|right|up|down|space move dx dy
// on up jump height
// on space shoot dir
// loop N ... end
// if VAR [op] value goto label
// label:
// msg "Text" | sound name | shake amount | stop

bg #0f172a
color #38bdf8
platform 0 180 320 20
color #22d3ee
rect 220 40 60 10
text "WBW Demo" 10 20

player 40 140 16 16
set HP 3
set SCORE 0
set SPEED 2
set GRAVITY 0.6

on left  move -1 0
on right move 1 0
on up    jump 9
on space shoot 1

spawn item 120 150
loop 3
  spawn enemy rand 40 280 rand 80 140
end

enemy_hit:
  sub HP 1
  msg "Ouch!"
  if HP 0 goto gameover
end

item_pick:
  add SCORE 10
  msg "Nice!"
end

gameover:
  msg "Game Over"
  stop
end
`;

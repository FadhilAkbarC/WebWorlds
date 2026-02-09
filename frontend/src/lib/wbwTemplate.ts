export const DEFAULT_WBW_TEMPLATE = `// WBW Game Template v3 - Mega Platformer
// Short, readable, ultra-light WBW syntax.
// Core: player/spawn/platform/rect/circle/line/tri/text/hud
// Control: on/onpress/onrelease + move/jump/shoot/vel/push
// Logic: set/add/sub/mul/div/mod/rand, if/goto/loop/end
// Events: msg/shake/stop + checkpoint/respawn/patrol
// Built-in vars: PX PY VX VY TIME FRAME DT GROUND

bg #0b1120
color #22d3ee
speed 2.4
gravity 0.7
friction 0.08
size 18 22
textsize 16

set SCORE 0
set HP 3
set STAGE 1
set CHECK 0

// World
color #1e293b
platform 0 560 960 40
platform 120 480 180 14
platform 360 420 160 14
platform 560 360 160 14
platform 760 300 140 14
platform 240 260 140 14
platform 40 340 120 12

// Decor
color #0ea5e9
rect 20 520 30 30
circle 860 120 26
line 0 560 960 560
tri 420 560 460 520 500 560

// Player
pcolor #38bdf8
player 80 520

// Enemies + items
spawn enemy bat1 420 520 18 18
patrol bat1 360 520 1.3
spawn enemy bot2 620 340 18 18
patrol bot2 560 720 1.6
spawn item gem1 720 520 12 12
spawn item gem2 260 230 12 12
spawn custom gate 900 520 18 40

loop 4
  spawn item rand 160 880 rand 220 520 10 10
end

// HUD
color #f8fafc
hud "SCORE" SCORE 20 24
hud "HP" HP 20 46
hud "STAGE" STAGE 20 68
hud "WBW MEGA PLATFORMER" 520 24

// Controls
on left  move -1 0
on right move 1 0
onpress up jump 10
onpress space shoot 1
onpress z push 4 0
onpress c setpos player 120 520
onrelease left vel 0 0
onrelease right vel 0 0
onpress r respawn

// Runtime logic
tick:
  if CHECK == 0 goto maybe_checkpoint
  if PY > 620 goto fall
  if PX > 920 goto next_stage
end

maybe_checkpoint:
  if PX > 560 goto set_checkpoint
end

set_checkpoint:
  set CHECK 1
  checkpoint 560 320
  msg "Checkpoint!" 1.2
end

next_stage:
  add STAGE 1
  mod STAGE 5
  respawn
  msg "Stage Up!" 1.5
  if STAGE == 0 goto boss
end

boss:
  msg "Final Zone!" 2
end

fall:
  sub HP 1
  respawn
  msg "Watch your step!" 1.2
  if HP <= 0 goto gameover
end

enemy_hit:
  sub HP 1
  vel player -3 -2
  shake 10 0.25
  msg "Ouch!" 1
  if HP <= 0 goto gameover
end

item_pick:
  rand BONUS 3 7
  mul BONUS 2
  add SCORE BONUS
  msg "Item +" BONUS 1
  if SCORE > 200 goto open_gate
end

open_gate:
  remove gate
  msg "Gate Open!" 1.5
end

enemy_down:
  add SCORE 50
  div SCORE 1
  msg "Enemy down!" 1
end

gameover:
  msg "Game Over" 3
  stop
end
`;

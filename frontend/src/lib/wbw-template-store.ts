export type WBWTemplateCategory =
  | 'platformer'
  | 'rpg'
  | 'tycoon'
  | 'shooter'
  | 'puzzle'
  | 'survival';

export const WBW_TEMPLATE_CATEGORIES: WBWTemplateCategory[] = [
  'platformer',
  'rpg',
  'tycoon',
  'shooter',
  'puzzle',
  'survival',
];

export interface WBWTemplateDefinition {
  id: string;
  title: string;
  category: WBWTemplateCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  code: string;
}

export const WBW_BUILTIN_TEMPLATES: WBWTemplateDefinition[] = [
  {
    id: 'platformer-quest',
    title: 'Skyline Platformer',
    category: 'platformer',
    difficulty: 'beginner',
    description: 'Platformer siap pakai dengan checkpoint, coins, dan musuh patrol.',
    code: `bg #0b1120
world 2200 1200
camfollow player
camlerp 0.14
speed 2.8
gravity 0.75
friction 0.08
size 18 24
player 120 1030
platform 0 1120 2200 80
platform 260 980 170 18
platform 590 870 170 18
platform 930 760 170 18
enemy bat1 760 1090 18 18
patrol bat1 650 900 1.2
coin c1 300 950 10 10
coin c2 650 840 10 10
set SCORE 0
set HP 3
tick:
  if PY > 1190 goto player_fall
  if PX > 2050 goto stage_clear
end
player_fall:
  sub HP 1
  respawn
  if HP <= 0 goto game_over
end
stage_clear:
  msg "Stage clear!" 2
  stop
end
game_over:
  msg "Game Over" 2
  stop
end`,
  },
  {
    id: 'rpg-village',
    title: 'Village RPG Starter',
    category: 'rpg',
    difficulty: 'intermediate',
    description: 'RPG top-down ringan dengan NPC, quest points, dan dialog event.',
    code: `bg #111827
world 1400 900
speed 2
friction 0.2
gravity 0
player 120 120 20 20
set GOLD 10
set QUEST 0
npc elder 600 240 28 42
npc merchant 900 420 28 42
colorof elder #f59e0b
colorof merchant #10b981
uirect 20 20 280 120 #1f2937
button questBtn 40 70 240 44 "Accept Quest"
onui questBtn goto quest_accept
onpress e goto talk
tick:
  if QUEST == 1 goto quest_progress
end
talk:
  if PX < 700 goto elder_talk
  goto merchant_talk
end
elder_talk:
  msg "Collect 3 gems in the forest!" 1.8
end
merchant_talk:
  msg "Potion price: 5 gold" 1.5
end
quest_accept:
  set QUEST 1
  msg "Quest started" 1.2
end
quest_progress:
  hud "Quest Active" 20 160
end`,
  },
  {
    id: 'tycoon-factory',
    title: 'Mini Factory Tycoon',
    category: 'tycoon',
    difficulty: 'intermediate',
    description: 'Template idle/tycoon dengan income loop, upgrade cost, dan UI tombol.',
    code: `bg #0f172a
world 1200 720
gravity 0
friction 0.2
player 80 580 18 18
set MONEY 100
set RATE 2
set LEVEL 1
uirect 30 20 360 190 #1e293b
button buy 60 130 300 54 "Upgrade Conveyor"
onui buy goto buy_upgrade
every income 1 goto tick_income
tick:
  hud "Money" MONEY 40 60
  hud "Rate/s" RATE 40 85
  hud "Level" LEVEL 40 110
end
tick_income:
  add MONEY RATE
end
buy_upgrade:
  set COST 50
  mul COST LEVEL
  if MONEY < COST goto no_money
  sub MONEY COST
  inc LEVEL 1
  add RATE 2
  msg "Upgrade success" 1
end
no_money:
  msg "Not enough money" 1
end`,
  },
  {
    id: 'arena-shooter',
    title: 'Arena Shooter Loop',
    category: 'shooter',
    difficulty: 'advanced',
    description: 'Shooter template dengan wave system, spawn loop, dan skor.',
    code: `bg #020617
world 1800 1000
camfollow player
speed 3.2
gravity 0.4
friction 0.05
player 200 840
set SCORE 0
set WAVE 1
set HP 5
every wave_spawn 3 goto spawn_wave
on left move -1 0
on right move 1 0
onpress space shoot 1
tick:
  hud "Score" SCORE 20 24
  hud "Wave" WAVE 20 48
  hud "HP" HP 20 72
  if HP <= 0 goto lose
end
spawn_wave:
  loop 3
    enemy rand 600 1700 rand 700 930 20 20
  end
  inc WAVE 1
end
enemy_hit:
  add SCORE 25
end
lose:
  msg "Arena Failed" 2
  stop
end`,
  },
  {
    id: 'puzzle-switches',
    title: 'Switch Puzzle Adventure',
    category: 'puzzle',
    difficulty: 'beginner',
    description: 'Puzzle logic siap pakai dengan toggle switch dan trigger gerbang.',
    code: `bg #111827
world 1600 900
gravity 0.7
player 120 780
platform 0 860 1600 50
platform 460 760 260 16
platform 920 670 260 16
npc gate 1420 790 26 70
set SW1 0
set SW2 0
button s1 120 60 180 48 "Switch A"
button s2 320 60 180 48 "Switch B"
onui s1 toggle SW1
onui s2 toggle SW2
tick:
  hud "A" SW1 40 140
  hud "B" SW2 40 164
  if SW1 == 1 goto check_second
end
check_second:
  if SW2 == 1 goto open_gate
end
open_gate:
  remove gate
  msg "Puzzle solved!" 1.4
end`,
  },
  {
    id: 'survival-night',
    title: 'Night Survival Rush',
    category: 'survival',
    difficulty: 'advanced',
    description: 'Mode survival dengan timer malam, resource drop, dan pressure musuh.',
    code: `bg #030712
world 2200 1200
camfollow player
player 180 1030
platform 0 1120 2200 80
set FOOD 5
set HP 6
set NIGHT 60
every drain 1 goto night_drain
every loot 2 goto spawn_loot
tick:
  hud "Food" FOOD 20 24
  hud "HP" HP 20 46
  hud "Night" NIGHT 20 68
  if NIGHT <= 0 goto survive
  if FOOD <= 0 goto starve
end
night_drain:
  dec NIGHT 1
  dec FOOD 1
end
spawn_loot:
  item rand 400 2100 rand 900 1040 12 12
  enemy rand 500 2000 rand 960 1080 18 18
end
item_pick:
  inc FOOD 2
end
starve:
  dec HP 1
  set FOOD 2
  if HP <= 0 goto game_over
end
survive:
  msg "You survived the night" 2
  stop
end
game_over:
  msg "Survival failed" 2
  stop
end`,
  },
];

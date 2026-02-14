import type { GameProject, GameScript } from '@/types';

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

export function createTemplateScript(template: WBWTemplateDefinition): GameScript {
  return {
    id: 'main',
    name: 'main.wbw',
    code: template.code,
    language: 'wbw',
    createdAt: new Date().toISOString(),
  };
}

export function applyTemplateToProject(
  baseProject: GameProject,
  template: WBWTemplateDefinition
): GameProject {
  return {
    ...baseProject,
    title: template.title,
    description: template.description,
    scripts: [createTemplateScript(template)],
  };
}

export const WBW_BUILTIN_TEMPLATES: WBWTemplateDefinition[] = [
  {
    id: 'platformer-quest',
    title: 'Skyline Platformer',
    category: 'platformer',
    difficulty: 'beginner',
    description: 'Platformer siap main: checkpoint, coin objective, musuh patrol, dan finish gate.',
    code: `bg #0b1120
world 2400 1200
camfollow player
camlerp 0.14
speed 2.8
gravity 0.75
friction 0.08
size 18 24
player 120 1030
platform 0 1120 2400 80
platform 260 980 170 18
platform 590 870 170 18
platform 930 760 170 18
platform 1280 690 200 18
platform 1680 620 210 18
platform 2040 560 190 18
enemy bat1 760 1090 18 18
patrol bat1 650 920 1.2
enemy bat2 1580 600 18 18
patrol bat2 1510 1860 1.4
coin c1 300 950 10 10
coin c2 650 840 10 10
coin c3 1000 730 10 10
coin c4 1710 590 10 10
npc finishGate 2260 1030 26 70
set SCORE 0
set HP 3
set GOAL 4
checkpoint 120 1030
on left move -1 0
on right move 1 0
onpress up jump 10
onrelease left stopx
onrelease right stopx
tick:
  hud "Coin" SCORE 20 24
  hud "HP" HP 20 46
  hud "Goal" GOAL 20 68
  if PY > 1190 goto player_fall
  if SCORE >= GOAL goto unlock_finish
  if PX > 2320 goto check_finish
end
unlock_finish:
  remove finishGate
end
check_finish:
  if SCORE >= GOAL goto stage_clear
end
player_fall:
  sub HP 1
  respawn
  if HP <= 0 goto game_over
end
enemy_hit:
  sub HP 1
  respawn
  if HP <= 0 goto game_over
end
item_pick:
  add SCORE 1
  msg "Coin collected" 0.6
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
    description: 'RPG top-down: quest accept, objective progress, reward, dan ending clear.',
    code: `bg #111827
world 1500 920
speed 2.1
friction 0.22
gravity 0
player 120 120 20 20
set GOLD 10
set QUEST 0
set GEMS 0
set TARGET 3
npc elder 620 240 28 42
npc merchant 980 430 28 42
colorof elder #f59e0b
colorof merchant #10b981
item g1 380 520 12 12
item g2 760 640 12 12
item g3 1190 560 12 12
uirect 20 20 360 140 #1f2937
button questBtn 40 80 320 44 "Accept Quest"
onui questBtn goto quest_accept
onpress e goto talk
tick:
  hud "Gold" GOLD 30 170
  hud "Quest" QUEST 30 194
  hud "Gem" GEMS 30 218
  if QUEST == 1 goto quest_progress
end
talk:
  if PX < 760 goto elder_talk
  goto merchant_talk
end
elder_talk:
  if QUEST == 0 goto elder_hint
  if GEMS < TARGET goto elder_wait
  goto elder_finish
end
elder_hint:
  msg "Talk to board: Accept Quest" 1.4
end
elder_wait:
  msg "Find all gems in forest" 1.3
end
elder_finish:
  add GOLD 25
  set QUEST 2
  msg "Quest clear! Reward +25" 1.5
  stop
end
merchant_talk:
  if GOLD < 5 goto no_potion
  sub GOLD 5
  msg "Potion bought" 1
end
no_potion:
  msg "Need 5 gold" 1
end
quest_accept:
  if QUEST > 0 goto already_active
  set QUEST 1
  msg "Quest started" 1.2
end
already_active:
  msg "Quest already active" 0.8
end
item_pick:
  if QUEST < 1 goto ignore_gem
  add GEMS 1
  msg "Gem +1" 0.8
end
ignore_gem:
end
quest_progress:
  hud "Collect" TARGET 30 242
end`,
  },
  {
    id: 'tycoon-factory',
    title: 'Mini Factory Tycoon',
    category: 'tycoon',
    difficulty: 'intermediate',
    description: 'Idle tycoon siap jadi: income loop, auto-win target, upgrade scaling, dan fail-safe UI.',
    code: `bg #0f172a
world 1280 760
gravity 0
friction 0.18
player 80 600 18 18
set MONEY 100
set RATE 2
set LEVEL 1
set TARGET 1000
uirect 24 20 390 220 #1e293b
button buy 50 150 340 54 "Upgrade Conveyor"
button cashout 50 214 340 54 "Cashout & Finish"
onui buy goto buy_upgrade
onui cashout goto check_finish
every income 1 goto tick_income
tick:
  hud "Money" MONEY 40 60
  hud "Rate/s" RATE 40 85
  hud "Level" LEVEL 40 110
  hud "Target" TARGET 40 135
end
tick_income:
  add MONEY RATE
end
buy_upgrade:
  COST = 40
  COST *= LEVEL
  if MONEY < COST goto no_money
  sub MONEY COST
  inc LEVEL 1
  add RATE 3
  msg "Upgrade success" 0.9
end
no_money:
  msg "Not enough money" 0.9
end
check_finish:
  if MONEY < TARGET goto not_ready
  msg "Tycoon clear!" 1.8
  stop
end
not_ready:
  msg "Target belum tercapai" 1
end`,
  },
  {
    id: 'arena-shooter',
    title: 'Arena Shooter Loop',
    category: 'shooter',
    difficulty: 'advanced',
    description: 'Arena shooter: wave progression, score target, HP fail-state, dan victory condition.',
    code: `bg #020617
world 1900 1040
camfollow player
speed 3.2
gravity 0.45
friction 0.06
player 180 850
set SCORE 0
set WAVE 1
set HP 5
set TARGET 300
every wave_spawn 3 goto spawn_wave
on left move -1 0
on right move 1 0
onpress up jump 9
onpress space shoot 1
onrelease left stopx
onrelease right stopx
tick:
  hud "Score" SCORE 20 24
  hud "Wave" WAVE 20 48
  hud "HP" HP 20 72
  hud "Target" TARGET 20 96
  if HP <= 0 goto lose
  if SCORE >= TARGET goto win
end
spawn_wave:
  loop 2
    enemy rand 520 1820 rand 760 930 20 20
  end
  if WAVE > 8 goto keep_wave
  inc WAVE 1
end
keep_wave:
end
enemy_hit:
  add SCORE 30
end
item_pick:
  add SCORE 10
end
lose:
  msg "Arena Failed" 2
  stop
end
win:
  msg "Arena Victory" 2
  stop
end`,
  },
  {
    id: 'puzzle-switches',
    title: 'Switch Puzzle Adventure',
    category: 'puzzle',
    difficulty: 'beginner',
    description: 'Puzzle logic lengkap: dual switch, gate unlock, objective finish, dan clear state.',
    code: `bg #111827
world 1700 920
gravity 0.7
player 120 790
platform 0 870 1700 50
platform 460 760 260 16
platform 920 680 260 16
npc gate 1460 800 26 70
set SW1 0
set SW2 0
set DONE 0
button s1 120 60 180 48 "Switch A"
button s2 320 60 180 48 "Switch B"
onui s1 toggle SW1
onui s2 toggle SW2
tick:
  hud "A" SW1 40 140
  hud "B" SW2 40 164
  if SW1 == 1 goto check_second
  if PX > 1600 goto check_exit
end
check_second:
  if SW2 == 1 goto open_gate
end
open_gate:
  if DONE == 1 goto skip_open
  set DONE 1
  remove gate
  msg "Gate unlocked" 1.2
end
skip_open:
end
check_exit:
  if DONE == 1 goto puzzle_clear
end
puzzle_clear:
  msg "Puzzle solved!" 1.8
  stop
end`,
  },
  {
    id: 'survival-night',
    title: 'Night Survival Rush',
    category: 'survival',
    difficulty: 'advanced',
    description: 'Survival complete: countdown night, resource loop, starving penalty, dan ending survive/fail.',
    code: `bg #030712
world 2300 1200
camfollow player
player 180 1030
platform 0 1120 2300 80
set FOOD 6
set HP 6
set NIGHT 75
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
  item rand 450 2200 rand 900 1040 12 12
  enemy rand 500 2100 rand 960 1080 18 18
end
item_pick:
  inc FOOD 2
  msg "Food +2" 0.8
end
enemy_hit:
  dec HP 1
  msg "Enemy hit" 0.7
  if HP <= 0 goto game_over
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

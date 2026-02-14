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
    title: 'Titan Trials Platformer',
    category: 'platformer',
    difficulty: 'beginner',
    description:
      'Mega platformer siap publish: 3 zona, objective multi-fase, enemy wave, checkpoint chain, boss gate, dan ending menang/kalah.',
    code: `bg #0a1022
world 3600 1400
camfollow player
camlerp 0.12
camoffset 0 -70
speed 3
gravity 0.78
friction 0.07
size 18 24
touch auto

set HP 6
set SCORE 0
set WAVE 1
set TOXIN 0
set RADAR 0
set STAGE 1
set COIN 0
set KEY 0
set SHARD 0
set GOAL 12
set BOSSHP 16
set BOSSOPEN 0
set CLEAR 0
set COMBO 0
set ENERGY 100
set SEED 42

player 120 1180
checkpoint 120 1180
platform 0 1320 3600 80
platform 260 1180 190 16
platform 560 1060 190 16
platform 910 960 220 16
platform 1320 880 230 16
platform 1720 820 230 16
platform 2060 760 230 16
platform 2440 700 230 16
platform 2860 640 260 16
platform 3180 560 220 16

npc bossGate 3360 1240 34 78
colorof bossGate #f59e0b
enemy w1 780 1280 18 18
patrol w1 690 1020 1.1
enemy w2 1650 810 18 18
patrol w2 1540 1880 1.4
enemy w3 2570 690 18 18
patrol w3 2460 2940 1.7

loop 6
  coin rand 250 1500 rand 860 1220 10 10
end
loop 6
  item rand 1600 3320 rand 620 1100 12 12
end

button heal 40 94 220 42 "Use Medkit"
button dash 40 142 220 42 "Dash Burst"
button focus 40 190 220 42 "Focus Mode"
onui heal goto use_heal
onui dash goto dash_burst
onui focus goto focus_mode
onhoverui heal goto ui_hint

on left move -1 0
on right move 1 0
onpress up jump 10
onpress space shoot 1
onrelease left stopx
onrelease right stopx

every storm 12 goto storm_wave
every bonus_drop 9 goto bonus_drop
every combo_tick 2 goto combo_tick
after intro 2 goto intro_msg

tick:
  hud "Titan Trials" 24 30
  hud "HP" HP 24 56
  hud "Score" SCORE 24 82
  hud "Coin" COIN 24 108
  hud "Key" KEY 24 134
  hud "Shard" SHARD 24 160
  hud "Stage" STAGE 24 186
  hud "Combo" COMBO 24 212
  hud "Energy" ENERGY 24 238
  if PY > 1390 goto fail_fall
  if COIN >= GOAL goto unlock_gate
  if PX > 3350 goto check_gate
  if BOSSOPEN == 1 goto boss_loop
end

storm_wave:
  if CLEAR == 1 goto storm_skip
  enemy rand 900 3200 rand 620 1280 18 18
  add SCORE 4
end
storm_skip:
end

intro_msg:
  msg "Titan Trials initiated" 1
end

ui_hint:
  msg "Use shard for heal" 0.4
end

combo_tick:
  if COMBO <= 0 goto combo_hold
  dec COMBO 1
end
combo_hold:
end

bonus_drop:
  if CLEAR == 1 goto bonus_skip
  item rand 700 3300 rand 650 1180 12 12
end
bonus_skip:
end

unlock_gate:
  if KEY == 1 goto unlock_skip
  set KEY 1
  msg "Titan key obtained" 1.2
  remove bossGate
end
unlock_skip:
end

check_gate:
  if KEY == 1 goto open_boss
  msg "Collect more coin" 0.8
end

open_boss:
  if BOSSOPEN == 1 goto boss_entered
  set BOSSOPEN 1
  checkpoint 3310 1180
  enemy titan 3480 1230 28 28
  patrol titan 3400 3560 1.8
  msg "Boss awakened!" 1.1
end
boss_entered:
end

boss_loop:
  if BOSSHP <= 0 goto win
end

use_heal:
  if SHARD < 2 goto no_heal
  sub SHARD 2
  add HP 2
  msg "HP restored" 0.8
end
no_heal:
  msg "Need 2 shard" 0.8
end

item_pick:
  add SHARD 1
  add SCORE 12
  add COMBO 2
  clamp COMBO 0 99
  msg "Shard +1" 0.6
end

enemy_hit:
  sub HP 1
  if PX > 3360 goto boss_damage
  msg "Hit by enemy" 0.6
  if HP <= 0 goto game_over
end

boss_damage:
  sub BOSSHP 1
  add SCORE 18
  add COMBO 3
  sub ENERGY 4
  if ENERGY < 20 goto focus_prompt
  msg "Boss HP -1" 0.5
  if HP <= 0 goto game_over
end

coin_pick:
  inc COIN 1
  add SCORE 6
  add ENERGY 1
  clamp ENERGY 0 100
end

dash_burst:
  if ENERGY < 25 goto dash_fail
  sub ENERGY 25
  pushx player 5
  add SCORE 15
  msg "Dash!" 0.5
end
dash_fail:
  msg "Need 25 energy" 0.6
end

focus_mode:
  if ENERGY < 15 goto focus_fail
  sub ENERGY 15
  shake 3 0.2
  add SCORE 8
  msg "Focus activated" 0.6
end
focus_fail:
  msg "Low energy" 0.6
end

focus_prompt:
  msg "Energy critical" 0.6
end

fail_fall:
  sub HP 1
  respawn
  msg "Fall damage" 0.8
  if HP <= 0 goto game_over
end

win:
  set CLEAR 1
  msg "Titan Trials Clear!" 2
  stop
end

game_over:
  msg "Mission failed" 2
  stop
end`,
  },
  {
    id: 'rpg-village',
    title: 'Chronicle Kingdom RPG',
    category: 'rpg',
    difficulty: 'intermediate',
    description:
      'Mega RPG siap jadi: chapter questline, economy, merchant, raid timer, skill point, dan true ending multi-kondisi.',
    code: `bg #0f172a
world 2800 1600
speed 2.2
friction 0.2
gravity 0
touch auto

player 180 180 20 20
camfollow player
camlerp 0.16

set GOLD 40
set CHAPTER 0
set RELIC 0
set CRYSTAL 0
set SKILL 1
set HP 12
set REP 0
set RAID 90
set BOSS 0
set MANA 14
set THREAT 0
set ALIGN 0
set BOUNTY 0

npc king 540 180 30 48
npc priest 930 300 28 44
npc smith 1240 560 28 44
npc captain 1780 860 30 46
colorof king #f59e0b
colorof priest #14b8a6
colorof smith #f97316
colorof captain #38bdf8

uirect 24 20 420 210 #1e293b
button startQuest 46 90 380 44 "Start Royal Quest"
button train 46 142 380 44 "Train Skill (10 Gold)"
button raid 46 194 380 44 "Launch Raid"
button arcane 46 246 380 44 "Arcane Burst (3 Mana)"
onui startQuest goto quest_start
onui train goto train_skill
onui raid goto raid_launch
onui arcane goto cast_arcane
onhoverui arcane goto arcane_hint

loop 6
  item rand 760 2500 rand 280 1300 12 12
end
loop 4
  enemy rand 980 2600 rand 300 1400 18 18
end

every raid_tick 1 goto raid_tick
every market_tick 8 goto market_income
every mana_tick 4 goto mana_tick
every threat_tick 6 goto threat_tick

on left move -1 0
on right move 1 0
on up move 0 -1
on down move 0 1
onrelease left stopx
onrelease right stopx
onrelease up stopy
onrelease down stopy
onpress e goto interact

tick:
  hud "Chronicle Kingdom" 24 34
  hud "HP" HP 24 58
  hud "Gold" GOLD 24 82
  hud "Chapter" CHAPTER 24 106
  hud "Relic" RELIC 24 130
  hud "Crystal" CRYSTAL 24 154
  hud "Skill" SKILL 24 178
  hud "Raid" RAID 24 202
  hud "Mana" MANA 24 226
  hud "Threat" THREAT 24 250
  hud "Bounty" BOUNTY 24 274
  if HP <= 0 goto fail
  if BOSS == 1 goto boss_phase
end

quest_start:
  if CHAPTER > 0 goto quest_locked
  set CHAPTER 1
  msg "Chapter 1 started" 1
end
quest_locked:
  msg "Quest already active" 0.8
end

interact:
  if PX < 760 goto king_dialog
  if PX < 1140 goto priest_dialog
  if PX < 1540 goto smith_dialog
  goto captain_dialog
end

king_dialog:
  if CHAPTER == 0 goto king_wait
  if RELIC < 4 goto king_need_relic
  if CRYSTAL < 3 goto king_need_crystal
  goto king_promote
end
king_wait:
  msg "Start quest from panel" 0.9
end
king_need_relic:
  msg "Find 4 relic first" 0.9
end
king_need_crystal:
  msg "Bring 3 crystal from raid" 1
end
king_promote:
  set CHAPTER 3
  set BOSS 1
  msg "Final chapter unlocked" 1.2
end

priest_dialog:
  if GOLD < 12 goto priest_no_gold
  sub GOLD 12
  add HP 3
  add REP 1
  msg "Blessing restored HP" 0.9
end
priest_no_gold:
  msg "Need 12 gold" 0.8
end

smith_dialog:
  if GOLD < 16 goto smith_no_gold
  sub GOLD 16
  inc SKILL 1
  msg "Weapon upgrade" 0.9
end
smith_no_gold:
  msg "Not enough gold" 0.8
end

captain_dialog:
  if CHAPTER < 2 goto captain_locked
  msg "Raid route is open" 0.9
end
captain_locked:
  msg "Complete relic mission first" 0.9
end

train_skill:
  if GOLD < 10 goto train_fail
  sub GOLD 10
  add SKILL 1
  add REP 1
  msg "Skill trained" 0.8
end
train_fail:
  msg "Need 10 gold" 0.8
end

raid_launch:
  if CHAPTER < 2 goto raid_locked
  set RAID 45
  msg "Raid started" 0.8
end
raid_locked:
  msg "Progress to chapter 2" 0.8
end

market_income:
  add GOLD REP
  add BOUNTY 1
end

mana_tick:
  if MANA >= 20 goto mana_hold
  inc MANA 1
end
mana_hold:
end

threat_tick:
  if CHAPTER < 1 goto threat_skip
  inc THREAT 1
  if THREAT < 15 goto threat_skip
  enemy rand 1200 2600 rand 260 1400 20 20
  set THREAT 0
end
threat_skip:
end

arcane_hint:
  msg "Burst scales with skill" 0.4
end

raid_tick:
  if RAID <= 0 goto raid_done
  if CHAPTER < 2 goto raid_skip
  dec RAID 1
end
raid_skip:
end

toxin_tick:
  if TOXIN <= 0 goto toxin_safe
  dec HP 1
  dec TOXIN 1
end
toxin_safe:
end

radar_tick:
  if RADAR <= 0 goto radar_off
  item rand 800 3200 rand 980 1460 10 10
  dec RADAR 1
end
radar_off:
end
raid_done:
  if CHAPTER < 2 goto raid_reset
  inc CRYSTAL 1
  set CHAPTER 2
  set RAID 90
  msg "Raid reward: crystal" 0.9
end
raid_reset:
end

item_pick:
  if CHAPTER < 1 goto item_skip
  add RELIC 1
  add GOLD 5
  msg "Relic found" 0.6
end
item_skip:
end

enemy_hit:
  sub HP 1
  if BOSS == 1 goto boss_damage
  msg "Ambushed" 0.6
  if HP <= 0 goto fail
end

boss_phase:
  if CHAPTER < 3 goto boss_wait
  hud "Boss HP" BOSS 24 226
end
boss_wait:
end

boss_damage:
  if CHAPTER < 3 goto boss_none
  add BOSS 1
  sub MANA 1
  add BOUNTY 3
  if BOSS < 12 goto boss_none
  goto clear
end
boss_none:
end

cast_arcane:
  if MANA < 3 goto arcane_fail
  sub MANA 3
  ARCDMG = SKILL
  add ARCDMG 1
  add BOSS ARCDMG
  msg "Arcane burst" 0.7
end
arcane_fail:
  msg "Not enough mana" 0.6
end

clear:
  msg "True Ending Unlocked" 2
  stop
end

fail:
  msg "Kingdom collapsed" 2
  stop
end`,
  },
  {
    id: 'tycoon-factory',
    title: 'HyperGrid Conveyor Megafactory',
    category: 'tycoon',
    difficulty: 'advanced',
    description:
      'Mega tycoon conveyor penuh: multi-line belt, part jatuh + terseret, sorter lane, QA chain, packing, shipping, maintenance, dan prestige industrial endgame.',
    code: `bg #0b1220
world 3200 1700
gravity 0.66
friction 0.04
touch auto
camfollow player
camlerp 0.1
camoffset 120 -140

player 120 1430 18 18
checkpoint 120 1430

set MONEY 600
set RATE 8
set LEVEL 1
set STAFF 4
set STOCK 0
set QUALITY 1
set MARKET 110
set PRESTIGE 0
set TARGET 140000
set POWER 1
set TAX 0
set AUTO 0
set QA 0
set LINEHP 100
set SCRAP 0
set PART_RAW 0
set PART_SORT 0
set PART_QA 0
set CRATE 0
set SHIP 0
set BELT_A 1.4
set BELT_B 1.9
set BELT_C 2.3
set BELT_D 2.8
set HAZARD 0
set ENERGY 100
set SHIFT 1
set DEMAND 1
set EVENT 0

color #1e293b
platform 0 1600 3200 100
platform 180 1480 860 20
platform 1090 1380 860 20
platform 2020 1280 760 20
platform 2540 1170 520 20

color #334155
conveyor 220 1460 780 20 1.4
conveyor 1140 1360 760 20 1.9
conveyor 2060 1260 680 20 2.3
conveyor 2580 1150 420 20 2.8

color #0f172a
rect 208 1430 24 30
rect 1118 1330 24 30
rect 2038 1230 24 30
rect 2560 1120 24 30

uirect 20 20 560 470 #1e293b
button lineA 40 80 250 42 "Upgrade Smelter Line"
button lineB 310 80 250 42 "Upgrade Assembly Line"
button hire 40 128 250 42 "Hire Operator"
button marketBtn 310 128 250 42 "Expand Market"
button autoBtn 40 176 250 42 "Activate Auto Feeder"
button qaBtn 310 176 250 42 "Enable QA Scanner"
button beltBtn 40 224 250 42 "Overclock Conveyor"
button repairBtn 310 224 250 42 "Maintenance Repair"
button shipBtn 40 272 250 42 "Dispatch Cargo"
button auditBtn 310 272 250 42 "Tax Audit + Efficiency"
button powerBtn 40 320 250 42 "Power Core Boost"
button shiftBtn 310 320 250 42 "Shift Rotation"
button prestigeBtn 40 368 520 42 "Prestige Industrial Tier"
button emergencyBtn 40 416 520 42 "Emergency Cooldown"
onui lineA goto up_line_a
onui lineB goto up_line_b
onui hire goto hire_staff
onui marketBtn goto up_market
onui autoBtn goto buy_auto
onui qaBtn goto qa_protocol
onui beltBtn goto overclock_belt
onui repairBtn goto repair_line
onui shipBtn goto ship_crates
onui auditBtn goto tax_audit
onui powerBtn goto boost_power
onui shiftBtn goto switch_shift
onui prestigeBtn goto do_prestige
onui emergencyBtn goto emergency_cooldown

on left move -1 0
on right move 1 0
onpress up jump 10
onrelease left stopx
onrelease right stopx

// full conveyor production loops
every income_tick 1 goto income_tick
every spawn_raw 1 goto spawn_raw
every sort_tick 2 goto sort_tick
every qa_tick 2 goto qa_tick
every pack_tick 3 goto pack_tick
every ship_tick 6 goto ship_tick
every maintenance_tick 4 goto maintenance_tick
every tax_tick 11 goto tax_tick
every event_tick 8 goto event_tick
every energy_tick 2 goto energy_tick

tick:
  hud "HyperGrid Conveyor Megafactory" 24 34
  hud "Money" MONEY 24 58
  hud "Rate" RATE 24 82
  hud "Stock" STOCK 24 106
  hud "Raw" PART_RAW 24 130
  hud "Sorted" PART_SORT 24 154
  hud "QA" PART_QA 24 178
  hud "Crate" CRATE 24 202
  hud "Ship" SHIP 24 226
  hud "LineHP" LINEHP 24 250
  hud "Energy" ENERGY 24 274
  hud "Hazard" HAZARD 24 298
  hud "Shift" SHIFT 24 322
  if MONEY >= TARGET goto clear
  if LINEHP <= 0 goto meltdown
end

spawn_raw:
  if AUTO == 1 goto auto_spawn
  part rand 250 950 1340 10 10
  goto spawn_done
end
auto_spawn:
  loop 3
    part rand 240 1000 1320 10 10
  end
spawn_done:
end

sort_tick:
  // lane A->B sorting
  if PART_RAW <= 0 goto sort_idle
  SORTED = PART_RAW
  div SORTED 2
  if SORTED <= 0 goto sort_idle
  sub PART_RAW SORTED
  add PART_SORT SORTED
  add STOCK SORTED
  msg "Sorter moved parts" 0.45
end
sort_idle:
end

qa_tick:
  if QA == 0 goto qa_skip
  if PART_SORT <= 0 goto qa_skip
  QA_PASS = PART_SORT
  div QA_PASS 2
  if QA_PASS <= 0 goto qa_skip
  sub PART_SORT QA_PASS
  add PART_QA QA_PASS
  add QUALITY 1
  clamp QUALITY 1 20
  msg "QA approved batch" 0.5
end
qa_skip:
end

pack_tick:
  if PART_QA <= 0 goto pack_idle
  PACK = PART_QA
  div PACK 3
  if PACK <= 0 goto pack_idle
  sub PART_QA PACK
  add CRATE PACK
  add STOCK PACK
  msg "Packing station active" 0.5
end
pack_idle:
end

ship_tick:
  if CRATE < 8 goto ship_idle
  SALE = CRATE
  mul SALE MARKET
  mul SALE DEMAND
  div SALE 14
  add MONEY SALE
  add SHIP 1
  set CRATE 0
  msg "Cargo dispatched" 0.7
end
ship_idle:
end

income_tick:
  GAIN = RATE
  GAIN *= STAFF
  GAIN *= QUALITY
  GAIN *= POWER
  GAIN *= SHIFT
  div GAIN 3
  add MONEY GAIN
end

maintenance_tick:
  DRAIN = HAZARD
  div DRAIN 5
  add DRAIN 1
  sub LINEHP DRAIN
  if LINEHP > 0 goto maintenance_ok
  goto meltdown
end
maintenance_ok:
end

event_tick:
  EVENT = rand
  if EVENT > 82 goto event_boom
  if EVENT < 16 goto event_break
  if EVENT < 34 goto event_jam
  msg "Factory stable" 0.5
end

event_boom:
  add MARKET 12
  add DEMAND 1
  clamp DEMAND 1 5
  add MONEY 1200
  msg "Demand boom" 0.8
end

event_break:
  add HAZARD 8
  sub LINEHP 10
  add SCRAP 5
  msg "Machine breakdown" 0.8
end

event_jam:
  add HAZARD 4
  sub ENERGY 8
  msg "Conveyor jam" 0.8
end

energy_tick:
  if ENERGY >= 100 goto energy_cap
  add ENERGY 1
end
energy_cap:
end

tax_tick:
  if PRESTIGE < 1 goto tax_skip
  TAX = MARKET
  mul TAX DEMAND
  div TAX 10
  sub MONEY TAX
end
tax_skip:
end

up_line_a:
  COST = 220
  COST *= LEVEL
  if MONEY < COST goto no_cash
  sub MONEY COST
  add RATE 8
  inc LEVEL 1
  add LINEHP 7
  msg "Smelter upgraded" 0.8
end

up_line_b:
  COST = 180
  COST *= QUALITY
  if MONEY < COST goto no_cash
  sub MONEY COST
  add RATE 6
  inc QUALITY 1
  add LINEHP 5
  msg "Assembly upgraded" 0.8
end

hire_staff:
  COST = 210
  COST *= STAFF
  if MONEY < COST goto no_cash
  sub MONEY COST
  inc STAFF 1
  add RATE 4
  msg "Operator hired" 0.8
end

up_market:
  COST = 560
  COST *= PRESTIGE
  add COST 560
  if MONEY < COST goto no_cash
  sub MONEY COST
  add MARKET 20
  msg "Market expanded" 0.8
end

buy_auto:
  if MONEY < 3200 goto no_cash
  sub MONEY 3200
  set AUTO 1
  msg "Auto feeder online" 0.8
end

qa_protocol:
  if MONEY < 2200 goto no_cash
  sub MONEY 2200
  set QA 1
  msg "QA scanner online" 0.8
end

overclock_belt:
  if MONEY < 1700 goto no_cash
  if ENERGY < 20 goto low_energy
  sub MONEY 1700
  sub ENERGY 20
  add BELT_A 0.3
  add BELT_B 0.35
  add BELT_C 0.4
  add BELT_D 0.45
  add RATE 6
  add HAZARD 2
  msg "Conveyor overclocked" 0.8
end

repair_line:
  if MONEY < 900 goto no_cash
  sub MONEY 900
  add LINEHP 22
  sub HAZARD 3
  clamp LINEHP 0 100
  clamp HAZARD 0 100
  msg "Maintenance complete" 0.8
end

ship_crates:
  if CRATE < 3 goto no_crate
  SALE = CRATE
  mul SALE MARKET
  mul SALE DEMAND
  div SALE 12
  add MONEY SALE
  set CRATE 0
  add SHIP 1
  msg "Manual dispatch" 0.8
end

boost_power:
  if MONEY < 1200 goto no_cash
  sub MONEY 1200
  add POWER 1
  add ENERGY 10
  clamp ENERGY 0 100
  msg "Power boosted" 0.8
end

switch_shift:
  toggle SHIFT
  if SHIFT == 0 goto shift_night
  set SHIFT 2
  msg "Day shift" 0.6
  goto shift_done
end
shift_night:
  set SHIFT 1
  msg "Night shift" 0.6
end
shift_done:
end

tax_audit:
  if MONEY < 700 goto no_cash
  sub MONEY 700
  inc POWER 1
  sub HAZARD 2
  clamp HAZARD 0 100
  msg "Audit optimized plant" 0.8
end

do_prestige:
  if MONEY < 18000 goto prestige_fail
  inc PRESTIGE 1
  set MONEY 900
  set RATE 12
  set LEVEL 2
  set STAFF 5
  set QUALITY 2
  set LINEHP 100
  set HAZARD 0
  set ENERGY 100
  add TARGET 30000
  add MARKET 24
  add DEMAND 1
  msg "Industrial tier ascended" 1
end
prestige_fail:
  msg "Need 18000 money" 0.8
end

emergency_cooldown:
  if ENERGY < 25 goto low_energy
  sub ENERGY 25
  sub HAZARD 8
  add LINEHP 8
  clamp HAZARD 0 100
  clamp LINEHP 0 100
  msg "Emergency cooldown done" 0.8
end

low_energy:
  msg "Energy too low" 0.7
end

no_crate:
  msg "Not enough crates" 0.7
end

no_cash:
  msg "Insufficient money" 0.8
end

item_pick:
  add PART_RAW 1
  add MONEY 2
  if PX > 1120 goto lane_sorted
  msg "Raw part captured" 0.45
end

lane_sorted:
  add PART_SORT 1
  add STOCK 1
  if PX > 2020 goto lane_qc
  msg "Part moved to lane B" 0.45
end

lane_qc:
  add PART_QA 1
  add CRATE 1
  msg "Part packed on lane C" 0.45
end

enemy_hit:
  add HAZARD 4
  sub LINEHP 5
  add SCRAP 2
  msg "Hazard impact" 0.6
end

meltdown:
  msg "Factory meltdown" 2
  stop
end

clear:
  msg "Conveyor megafactory complete" 2
  stop
end`,
  },
  {
    id: 'arena-shooter',
    title: 'Omega Siege Shooter',
    category: 'shooter',
    difficulty: 'advanced',
    description:
      'Mega shooter siap jadi: wave director, elite spawn, ammo economy, supply drop, boss phase, combo score, dan survival objective.',
    code: `bg #020617
world 3200 1400
camfollow player
camlerp 0.15
speed 3.1
gravity 0.42
friction 0.05
touch auto

player 240 1180
platform 0 1320 3200 80
platform 420 1120 220 16
platform 980 980 220 16
platform 1660 900 220 16
platform 2420 840 220 16

set SCORE 0
set COMBO 0
set WAVE 1
set HP 7
set AMMO 16
set ELITE 0
set TARGET 2400
set BOSSHP 22
set PHASE 0
set HEAT 0
set SHIELD 4
set DRONE 0

button reloadBtn 40 96 240 42 "Reload"
button burstBtn 40 144 240 42 "Burst Fire"
button shieldBtn 40 192 240 42 "Shield Pulse"
button droneBtn 40 240 240 42 "Deploy Drone"
onui reloadBtn goto reload
onui burstBtn goto burst_fire
onui shieldBtn goto shield_pulse
onui droneBtn goto deploy_drone

on left move -1 0
on right move 1 0
onpress up jump 9
onpress space goto fire
onrelease left stopx
onrelease right stopx

every director 3 goto director
every supply 10 goto supply_drop
every combo_decay 2 goto combo_decay
every heat_tick 1 goto heat_tick
every drone_tick 3 goto drone_tick

tick:
  hud "Omega Siege" 24 30
  hud "HP" HP 24 54
  hud "Ammo" AMMO 24 78
  hud "Score" SCORE 24 102
  hud "Combo" COMBO 24 126
  hud "Wave" WAVE 24 150
  hud "Target" TARGET 24 174
  hud "Heat" HEAT 24 198
  hud "Shield" SHIELD 24 222
  hud "Drone" DRONE 24 246
  if HP <= 0 goto lose
  if SCORE >= TARGET goto start_boss
  if PHASE == 2 goto boss_phase
end

fire:
  if AMMO <= 0 goto no_ammo
  if HEAT > 90 goto overheat
  sub AMMO 1
  inc HEAT 6
  shoot 1
end
overheat:
  msg "Weapon overheated" 0.5
end
no_ammo:
  msg "Reload!" 0.5
end

reload:
  if AMMO > 8 goto reload_skip
  set AMMO 16
  msg "Ammo refilled" 0.7
end
reload_skip:
end

burst_fire:
  if AMMO < 3 goto no_ammo
  sub AMMO 3
  loop 3
    shoot 1
  end
  msg "Burst!" 0.5
end

director:
  if PHASE > 0 goto director_skip
  loop 2
    enemy rand 460 3060 rand 760 1260 18 18
  end
  if WAVE < 10 goto wave_up
  goto elite_spawn
end
director_skip:
end

wave_up:
  inc WAVE 1
end

elite_spawn:
  if ELITE > 5 goto elite_skip
  enemy rand 900 3000 rand 760 1240 26 26
  inc ELITE 1
  msg "Elite incoming" 0.7
end
elite_skip:
end

supply_drop:
  if PHASE == 2 goto supply_skip
  item rand 500 3000 rand 740 1240 12 12
end
supply_skip:
end

combo_decay:
  if COMBO <= 0 goto combo_keep
  dec COMBO 1
end
combo_keep:
end

heat_tick:
  if HEAT <= 0 goto heat_keep
  dec HEAT 3
end
heat_keep:
end

drone_tick:
  if DRONE <= 0 goto drone_keep
  add SCORE 8
  add COMBO 1
end
drone_keep:
end

start_boss:
  if PHASE > 0 goto boss_started
  set PHASE 2
  enemy omega 2920 1180 34 34
  patrol omega 2760 3120 2
  checkpoint 2660 1180
  msg "Omega Core detected" 1
end
boss_started:
end

boss_phase:
  hud "BossHP" BOSSHP 24 198
  if BOSSHP <= 0 goto win
end

enemy_hit:
  if PHASE == 2 goto boss_damage
  sub HP 1
  if HP <= 0 goto lose
  msg "Enemy struck" 0.5
end

boss_damage:
  sub BOSSHP 1
  add SCORE 40
  add COMBO 2
  if BOSSHP <= 0 goto win
end

item_pick:
  add AMMO 4
  add SCORE 20
  add COMBO 1
  msg "Supply picked" 0.5
end

enemy_down:
  add SCORE 25
  add COMBO 1
end

shield_pulse:
  if SHIELD <= 0 goto shield_fail
  dec SHIELD 1
  add HP 1
  msg "Shield restored HP" 0.6
end
shield_fail:
  msg "No shield charge" 0.6
end

deploy_drone:
  if DRONE > 0 goto drone_fail
  set DRONE 8
  msg "Drone deployed" 0.7
end
drone_fail:
  msg "Drone already active" 0.6
end

lose:
  msg "Omega Siege failed" 2
  stop
end

win:
  msg "Omega Siege complete" 2
  stop
end`,
  },
  {
    id: 'puzzle-switches',
    title: 'Quantum Vault Puzzle',
    category: 'puzzle',
    difficulty: 'beginner',
    description:
      'Mega puzzle adventure: panel logic berantai, memory sequence, power routing, anti-softlock reset, dan final vault finale.',
    code: `bg #0f172a
world 2600 1300
gravity 0.66
speed 2.7
friction 0.08
touch auto

player 120 1130
platform 0 1240 2600 60
platform 360 1080 220 16
platform 780 980 220 16
platform 1260 900 220 16
platform 1720 820 220 16
platform 2120 740 220 16
npc vaultGate 2400 1160 30 80
colorof vaultGate #fbbf24

set PWR 0
set SWA 0
set SWB 0
set SWC 0
set MEM1 0
set MEM2 0
set MEM3 0
set TOKEN 0
set LOCK 1
set FAIL 0
set PHASE 0
set CLOCK 180
set MIRROR 0

uirect 20 20 430 300 #1e293b
button swA 44 74 180 42 "Toggle A"
button swB 240 74 180 42 "Toggle B"
button swC 44 124 180 42 "Toggle C"
button mem1 44 182 120 38 "M1"
button mem2 176 182 120 38 "M2"
button mem3 308 182 120 38 "M3"
button resetP 44 236 384 42 "Reset Circuit"
button mirror 44 284 384 42 "Mirror Phase"
onui swA toggle SWA
onui swB toggle SWB
onui swC toggle SWC
onui mem1 goto mem_press_1
onui mem2 goto mem_press_2
onui mem3 goto mem_press_3
onui resetP goto circuit_reset
onui mirror goto mirror_phase

every pulse 2 goto pulse
every clock_tick 1 goto clock_tick

tick:
  hud "Quantum Vault" 24 32
  hud "Power" PWR 24 56
  hud "A" SWA 24 80
  hud "B" SWB 24 104
  hud "C" SWC 24 128
  hud "Token" TOKEN 24 152
  hud "Lock" LOCK 24 176
  hud "Clock" CLOCK 24 200
  hud "Mirror" MIRROR 24 224
  if SWA == 1 goto pwr_check_b
  if PX > 2440 goto check_exit
end

pwr_check_b:
  if SWB == 1 goto pwr_check_c
  goto pwr_drain
end

pwr_check_c:
  if SWC == 1 goto pwr_fill
  goto pwr_drain
end

pwr_fill:
  add PWR 2
  if PWR < 20 goto pwr_wait
  set TOKEN 1
  msg "Circuit stable" 0.8
end
pwr_wait:
end

pwr_drain:
  if PWR <= 0 goto pwr_zero
  dec PWR 1
end
pwr_zero:
end

pulse:
  if TOKEN == 0 goto pulse_skip
  if MEM1 == 1 goto pulse_mem2
  goto pulse_fail
end
pulse_mem2:
  if MEM2 == 1 goto pulse_mem3
  goto pulse_fail
end
pulse_mem3:
  if MEM3 == 1 goto unlock
  goto pulse_fail
end

pulse_fail:
  if TOKEN == 0 goto pulse_skip
  set FAIL 1
  msg "Memory mismatch" 0.7
end
pulse_skip:
end

clock_tick:
  dec CLOCK 1
  if CLOCK > 0 goto clock_ok
  goto fail
end
clock_ok:
end

mem_press_1:
  if TOKEN == 0 goto mem_locked
  set MEM1 1
  msg "M1 accepted" 0.5
end

mem_press_2:
  if MEM1 == 0 goto mem_locked
  set MEM2 1
  msg "M2 accepted" 0.5
end

mem_press_3:
  if MEM2 == 0 goto mem_locked
  set MEM3 1
  msg "M3 accepted" 0.5
end

mem_locked:
  msg "Sequence blocked" 0.6
end

mirror_phase:
  toggle MIRROR
  msg "Mirror phase toggled" 0.7
end

circuit_reset:
  set PWR 0
  set TOKEN 0
  set MEM1 0
  set MEM2 0
  set MEM3 0
  set FAIL 0
  msg "Circuit reset" 0.8
end

unlock:
  if LOCK == 0 goto unlock_done
  set LOCK 0
  remove vaultGate
  msg "Vault unlocked" 1
end
unlock_done:
end

check_exit:
  if LOCK == 0 goto clear
  if MIRROR == 1 goto mirror_hint
  msg "Vault still locked" 0.8
end

mirror_hint:
  msg "Try mirror phase" 0.8
end

fail:
  msg "Vault lockdown" 2
  stop
end

clear:
  msg "Quantum vault solved" 2
  stop
end`,
  },
  {
    id: 'survival-night',
    title: 'Ashfall Survival Frontier',
    category: 'survival',
    difficulty: 'advanced',
    description:
      'Mega survival siap jadi: siang-malam, hunger/thirst/temperature, camp build, raid night, extraction ending, dan fail-state komplit.',
    code: `bg #030712
world 3400 1600
camfollow player
camlerp 0.14
touch auto

player 180 1380
platform 0 1520 3400 80
platform 680 1360 200 16
platform 1380 1240 220 16
platform 1980 1160 220 16
platform 2640 1080 220 16

set DAYTIME 180
set NIGHT 0
set HP 10
set FOOD 12
set WATER 10
set TEMP 5
set WOOD 0
set ORE 0
set CAMP 0
set SIGNAL 0
set EVAC 0
set SCORE 0

button campBtn 40 94 260 42 "Build Campfire"
button signalBtn 40 146 260 42 "Build Signal"
button drinkBtn 40 198 260 42 "Emergency Drink"
button radarBtn 40 250 260 42 "Deploy Radar"
onui campBtn goto build_camp
onui signalBtn goto build_signal
onui drinkBtn goto emergency_drink
onui radarBtn goto deploy_radar

every survival_tick 1 goto survival_tick
every loot_tick 4 goto loot_tick
every raid_tick 8 goto raid_tick
every toxin_tick 5 goto toxin_tick
every radar_tick 3 goto radar_tick

on left move -1 0
on right move 1 0
onpress up jump 10
onrelease left stopx
onrelease right stopx

tick:
  hud "Ashfall Frontier" 24 30
  hud "HP" HP 24 54
  hud "Food" FOOD 24 78
  hud "Water" WATER 24 102
  hud "Temp" TEMP 24 126
  hud "Wood" WOOD 24 150
  hud "Ore" ORE 24 174
  hud "Signal" SIGNAL 24 198
  hud "Day" DAYTIME 24 222
  hud "Wave" WAVE 24 246
  hud "Toxin" TOXIN 24 270
  hud "Radar" RADAR 24 294
  if HP <= 0 goto fail
  if EVAC == 1 goto clear
end

survival_tick:
  dec DAYTIME 1
  if DAYTIME > 0 goto day_logic
  set NIGHT 1
  set DAYTIME 180
  msg "Night has begun" 0.8
end

day_logic:
  dec FOOD 1
  dec WATER 1
  if CAMP == 1 goto temp_safe
  dec TEMP 1
end
temp_safe:
  if FOOD > 0 goto food_ok
  sub HP 1
end
food_ok:
  if WATER > 0 goto water_ok
  sub HP 1
end
water_ok:
  if TEMP > 0 goto temp_ok
  sub HP 1
end
temp_ok:
end

loot_tick:
  item rand 500 3200 rand 900 1460 12 12
  enemy rand 700 3100 rand 1000 1460 18 18
end

raid_tick:
  if NIGHT == 0 goto raid_skip
  enemy rand 1200 3300 rand 980 1460 20 20
  inc WAVE 1
  add TOXIN 1
  msg "Night raid!" 0.7
end
raid_skip:
end

item_pick:
  ROLL = rand
  if ROLL < 40 goto gain_wood
  if ROLL < 70 goto gain_ore
  goto gain_food
end

gain_wood:
  add WOOD 2
  add SCORE 8
  msg "Wood +2" 0.6
end

gain_ore:
  add ORE 1
  add SCORE 10
  msg "Ore +1" 0.6
end

gain_food:
  add FOOD 2
  add WATER 2
  add SCORE 12
  msg "Supplies +" 0.6
end

enemy_hit:
  sub HP 1
  msg "Threat contact" 0.6
  if HP <= 0 goto fail
end

build_camp:
  if WOOD < 8 goto camp_fail
  sub WOOD 8
  set CAMP 1
  add TEMP 4
  msg "Campfire online" 0.8
end
camp_fail:
  msg "Need 8 wood" 0.8
end

build_signal:
  if ORE < 5 goto signal_fail
  if WOOD < 6 goto signal_fail
  sub ORE 5
  sub WOOD 6
  inc SIGNAL 1
  msg "Signal progress +1" 0.8
  if SIGNAL >= 3 goto evac_ready
end
signal_fail:
  msg "Need 5 ore & 6 wood" 0.8
end

deploy_radar:
  if ORE < 2 goto radar_fail
  sub ORE 2
  set RADAR 12
  msg "Radar active" 0.7
end
radar_fail:
  msg "Need 2 ore" 0.7
end

emergency_drink:
  add WATER 2
  sub SCORE 4
  msg "Emergency hydration" 0.7
end

evac_ready:
  set EVAC 1
  msg "Extraction incoming" 1
end

clear:
  msg "Frontier survived" 2
  stop
end

fail:
  msg "Expedition lost" 2
  stop
end`,
  },
];

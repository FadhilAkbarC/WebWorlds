export interface WBWSyntaxTopic {
  id: string;
  title: string;
  category: 'core' | 'logic' | 'events' | 'ui' | 'camera' | 'timers' | 'math';
  syntax: string;
  aliases?: string[];
  example: string;
  notes: string;
}

export const WBW_SYNTAX_TOPICS: WBWSyntaxTopic[] = [
  {
    id: 'player-spawn',
    title: 'Spawn Player',
    category: 'core',
    syntax: 'player x y [w h]',
    aliases: ['p', 'plr'],
    example: 'player 120 1040 18 24',
    notes: 'Membuat player utama. Jika ukuran tidak diisi, engine pakai ukuran default.',
  },
  {
    id: 'entity-spawn',
    title: 'Spawn Entity',
    category: 'core',
    syntax: 'enemy id x y [w h] / item id x y [w h] / npc id x y [w h]',
    aliases: ['spawn', 'coin'],
    example: 'enemy bat1 640 1040 18 18',
    notes: 'Gunakan untuk musuh, item collectable, atau NPC custom.',
  },
  {
    id: 'variable-set',
    title: 'Variable Set',
    category: 'logic',
    syntax: 'set NAME value | NAME = value | NAME := value',
    aliases: ['let', 'var', 'const'],
    example: 'SCORE = 0',
    notes: 'Format shorthand dan alias langsung dinormalisasi parser ke command set.',
  },
  {
    id: 'variable-update',
    title: 'Variable Update',
    category: 'logic',
    syntax: 'add/sub/mul/div/mod NAME value | NAME += value | NAME++',
    aliases: ['inc', 'dec'],
    example: 'HP--',
    notes: 'Support shorthand operator agar script lebih ringkas.',
  },
  {
    id: 'conditions',
    title: 'Condition & Flow',
    category: 'logic',
    syntax: 'if A >= B goto label',
    aliases: ['when', 'then', 'fn', 'goto', 'call'],
    example: 'when SCORE >= 100 then win',
    notes: 'Alias when/then/fn mempermudah style scripting mirip pseudo-code.',
  },
  {
    id: 'input',
    title: 'Input Binding',
    category: 'events',
    syntax: 'on key action / onpress key action / onrelease key action',
    aliases: ['left,right,up,down,space'],
    example: 'onpress up jump 10',
    notes: 'Bind command ke keyboard input dengan trigger hold/press/release.',
  },
  {
    id: 'ui-button',
    title: 'UI Buttons',
    category: 'ui',
    syntax: 'button id x y w h "Text" + onui id action',
    aliases: ['btn', 'onclick'],
    example: 'button start 430 300 340 64 "Start"',
    notes: 'Cocok untuk menu, shop, dan template creator flow.',
  },
  {
    id: 'camera',
    title: 'Camera Control',
    category: 'camera',
    syntax: 'camfollow target / camlerp value / camoffset x y',
    aliases: ['cam', 'camreset', 'camclamp'],
    example: 'camfollow player',
    notes: 'Gunakan untuk genre platformer, shooter, dan survival.',
  },
  {
    id: 'timers',
    title: 'Timers',
    category: 'timers',
    syntax: 'after sec goto label / every id sec goto label',
    aliases: ['wait', 'delay', 'interval', 'repeat'],
    example: 'every wave_spawn 3 goto spawn_wave',
    notes: 'Menjalankan event berkala atau delayed event.',
  },
  {
    id: 'math',
    title: 'Math Helpers',
    category: 'math',
    syntax: 'pow/sqrt/log/exp/sin/cos/tan/lerp/min/max/clamp',
    aliases: ['mix', 'randint', 'randfloat'],
    example: 'lerp MIX 0 100 0.25',
    notes: 'Membantu balancing gameplay dan procedural variation.',
  },
];

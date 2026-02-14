export interface WBWError {
  line: number;
  message: string;
}

interface CommandLine {
  tokens: string[];
  line: number;
  raw: string;
}

interface WBWProgram {
  init: CommandLine[];
  labels: Record<string, CommandLine[]>;
}

interface WBWEntity {
  id: string;
  type: 'player' | 'enemy' | 'item' | 'bullet' | 'custom';
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  color: string;
}

type WBWShape =
  | {
      kind: 'rect';
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
      solid: boolean;
    }
  | {
      kind: 'circle';
      x: number;
      y: number;
      r: number;
      color: string;
      solid: boolean;
    }
  | {
      kind: 'line';
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      color: string;
    }
  | {
      kind: 'tri';
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      x3: number;
      y3: number;
      color: string;
    };

interface WBWText {
  tokens: string[];
  x: number;
  y: number;
  color: string;
  size: number;
}

interface WBWMessage {
  text: string;
  timeLeft: number;
}

interface WBWPatrol {
  id: string;
  minX: number;
  maxX: number;
  speed: number;
}

type WBWUIShape =
  | {
      kind: 'rect';
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
    }
  | {
      kind: 'circle';
      x: number;
      y: number;
      r: number;
      color: string;
    }
  | {
      kind: 'line';
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      color: string;
    };

interface WBWUIButton {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  textTokens: string[];
  color: string;
  hoverColor: string;
  textColor: string;
  visible: boolean;
  enabled: boolean;
}

interface WBWTimer {
  id: string;
  label: string;
  remaining: number;
  interval: number;
  repeat: boolean;
}

type WBWCommandSource = 'init' | 'input' | 'tick' | 'ui';

type WBWTouchMode = 'auto' | 'on' | 'off';

type WBWExecutionContext = {
  speed?: number;
  gravity?: number;
  delta?: number;
  key?: string;
  source?: WBWCommandSource;
  mouseX?: number;
  mouseY?: number;
};

const DEFAULTS = {
  background: '#0b1120',
  color: '#38bdf8',
  playerSize: { w: 16, h: 16 },
  enemySize: 14,
  itemSize: 10,
  bulletSize: { w: 6, h: 2 },
  speed: 2,
  gravity: 0.6,
  friction: 0.08,
  textSize: 14,
  uiButtonColor: '#1e293b',
  uiButtonHoverColor: '#334155',
  uiButtonTextColor: '#e2e8f0',
};

const KEY_ALIASES: Record<string, string> = {
  left: 'arrowleft',
  right: 'arrowright',
  up: 'arrowup',
  down: 'arrowdown',
  space: 'space',
  esc: 'escape',
  enter: 'enter',
};

const COMMAND_ALIASES: Record<string, string> = {
  p: 'player',
  plr: 'player',
  sp: 'spawn',
  pl: 'platform',
  plat: 'platform',
  wall: 'platform',
  floor: 'platform',
  bg: 'bg',
  col: 'color',
  pc: 'pcolor',
  pcolor: 'pcolor',
  playercolor: 'pcolor',
  sz: 'size',
  size: 'size',
  ts: 'textsize',
  textsize: 'textsize',
  txt: 'text',
  hud: 'hud',
  mv: 'move',
  j: 'jump',
  sh: 'shoot',
  v: 'vel',
  tp: 'setpos',
  setpos: 'setpos',
  remove: 'remove',
  rm: 'remove',
  del: 'remove',
  respawn: 'respawn',
  checkpoint: 'checkpoint',
  speed: 'speed',
  grav: 'gravity',
  gravity: 'gravity',
  fric: 'friction',
  friction: 'friction',
  add: 'add',
  sub: 'sub',
  mul: 'mul',
  div: 'div',
  mod: 'mod',
  rand: 'rand',
  msg: 'msg',
  shake: 'shake',
  fx: 'shake',
  on: 'on',
  onpress: 'onpress',
  onrelease: 'onrelease',
  loop: 'loop',
  end: 'end',
  if: 'if',
  goto: 'goto',
  call: 'goto',
  stop: 'stop',
  exit: 'stop',
  line: 'line',
  tri: 'tri',
  rect: 'rect',
  circle: 'circle',
  platform: 'platform',
  patrol: 'patrol',
  move: 'move',
  jump: 'jump',
  shoot: 'shoot',
  vel: 'vel',
  push: 'push',
  sound: 'sound',
  box: 'rect',
  solid: 'platform',
  tile: 'platform',
  ledge: 'platform',
  teleport: 'setpos',
  mix: 'lerp',
  randi: 'randint',
  randf: 'randfloat',
  let: 'set',
  var: 'set',
  const: 'set',
  when: 'if',
  unless: 'ifnot',
  then: 'goto',
  fn: 'goto',
  camfollow: 'camfollow',
  camlerp: 'camlerp',
  camoffset: 'camoffset',
  camclamp: 'camclamp',
  camreset: 'camreset',
  btn: 'button',
  button: 'button',
  panel: 'uirect',
  uibox: 'uirect',
  uirow: 'uiline',
  onclick: 'onui',
  onui: 'onui',
  onhover: 'onhoverui',
  uihover: 'onhoverui',
  onhoverui: 'onhoverui',
  removeui: 'removeui',
  uirm: 'removeui',
  clearui: 'clearui',
  wait: 'after',
  delay: 'after',
  interval: 'every',
  repeat: 'every',
  stoptimer: 'canceltimer',
  stoptimers: 'cleartimers',
};

const KNOWN_COMMANDS = new Set<string>([
  'player',
  'spawn',
  'set',
  'add',
  'sub',
  'mul',
  'div',
  'mod',
  'rand',
  'bg',
  'color',
  'pcolor',
  'size',
  'textsize',
  'rect',
  'platform',
  'circle',
  'line',
  'tri',
  'text',
  'hud',
  'on',
  'onpress',
  'onrelease',
  'move',
  'vel',
  'push',
  'jump',
  'shoot',
  'if',
  'ifnot',
  'goto',
  'loop',
  'end',
  'msg',
  'sound',
  'shake',
  'stop',
  'respawn',
  'checkpoint',
  'setpos',
  'remove',
  'patrol',
  'speed',
  'gravity',
  'friction',
  'world',
  'cam',
  'camfollow',
  'camlerp',
  'camoffset',
  'camclamp',
  'camreset',
  'uirect',
  'uicircle',
  'uiline',
  'button',
  'onui',
  'onhoverui',
  'uivisible',
  'uienable',
  'uicolor',
  'removeui',
  'clearui',
  'after',
  'every',
  'canceltimer',
  'cleartimers',
  'enemy',
  'item',
  'coin',
  'npc',
  'setx',
  'sety',
  'addx',
  'addy',
  'velx',
  'vely',
  'pushx',
  'pushy',
  'stopx',
  'stopy',
  'flipx',
  'flipy',
  'bouncex',
  'bouncey',
  'sizeof',
  'colorof',
  'inc',
  'dec',
  'abs',
  'neg',
  'sign',
  'floor',
  'ceil',
  'round',
  'min',
  'max',
  'clamp',
  'pow',
  'sqrt',
  'log',
  'exp',
  'sin',
  'cos',
  'tan',
  'asin',
  'acos',
  'atan',
  'lerp',
  'swap',
  'copy',
  'toggle',
  'randint',
  'randfloat',
  'touch',
  'and',
  'or',
  'not',
]);

function normalizeKey(key: string): string {
  const lower = key.toLowerCase();
  if (lower === ' ') return 'space';
  return KEY_ALIASES[lower] || lower;
}

function normalizeCommand(command: string): string {
  const lower = command.toLowerCase();
  return COMMAND_ALIASES[lower] || lower;
}

function stripComments(line: string): string {
  let inQuote = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      inQuote = !inQuote;
      continue;
    }
    if (!inQuote && char === '/' && line[i + 1] === '/') {
      return line.slice(0, i);
    }
  }
  return line;
}

function tokenize(line: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inQuote = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      inQuote = !inQuote;
      if (!inQuote && current.length > 0) {
        tokens.push(current);
        current = '';
      }
      continue;
    }

    if (!inQuote && /\s/.test(char)) {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
      continue;
    }

    current += char;
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  return tokens;
}

function expandAssignmentShorthand(rawLine: string): string {
  const trimmed = rawLine.trim();

  const unaryMatch = trimmed.match(/^([A-Za-z_][\w.]*)\s*(\+\+|--)$/);
  if (unaryMatch) {
    const [, name, op] = unaryMatch;
    return `${op === '++' ? 'inc' : 'dec'} ${name} 1`;
  }

  const match = trimmed.match(/^([A-Za-z_][\w.]*)\s*(=|:=|\+=|-=|\*=|\/=|%=)\s*(.+)$/);
  if (!match) return rawLine;

  const [, name, operator, rhs] = match;
  const trimmedRhs = rhs.trim();
  if (!trimmedRhs) return rawLine;

  if (operator === '=' || operator === ':=') {
    return `set ${name} ${trimmedRhs}`;
  }

  const map: Record<string, string> = {
    '+=': 'add',
    '-=': 'sub',
    '*=': 'mul',
    '/=': 'div',
    '%=': 'mod',
  };
  const command = map[operator];
  return command ? `${command} ${name} ${trimmedRhs}` : rawLine;
}

function parseWBW(code: string): { program: WBWProgram; errors: WBWError[] } {
  const errors: WBWError[] = [];
  const init: CommandLine[] = [];
  const labels: Record<string, CommandLine[]> = {};
  let currentLabel: string | null = null;

  const lines = code.split(/\r?\n/);
  lines.forEach((raw, index) => {
    const lineNumber = index + 1;
    const stripped = stripComments(raw).trim();
    if (!stripped) return;

    const normalizedLine = expandAssignmentShorthand(stripped);

    const tokens = tokenize(normalizedLine);
    if (tokens.length === 0) return;

    const first = tokens[0];
    if (first.endsWith(':')) {
      const labelName = first.slice(0, -1).trim();
      if (!labelName) {
        errors.push({ line: lineNumber, message: 'Empty label name' });
        currentLabel = null;
        return;
      }
      if (!labels[labelName]) {
        labels[labelName] = [];
      } else {
        errors.push({ line: lineNumber, message: `Duplicate label: ${labelName}` });
      }
      currentLabel = labelName;
      return;
    }

    const command: CommandLine = { tokens, line: lineNumber, raw: normalizedLine };
    if (currentLabel) {
      labels[currentLabel].push(command);
    } else {
      init.push(command);
    }
  });

  return { program: { init, labels }, errors };
}


function validateParsedProgram(program: WBWProgram): WBWError[] {
  const validationErrors: WBWError[] = [];
  const allLines = [...program.init, ...Object.values(program.labels).flat()];

  const hasLabel = (label?: string) => Boolean(label && program.labels[label]);

  allLines.forEach((line) => {
    const command = normalizeCommand(line.tokens[0]);
    const tokens = line.tokens;

    if (!KNOWN_COMMANDS.has(command)) {
      validationErrors.push({ line: line.line, message: `Unknown command: ${line.tokens[0]}` });
      return;
    }

    if (command === 'goto') {
      const label = tokens[1];
      if (!label) {
        validationErrors.push({ line: line.line, message: 'goto requires a label target' });
      } else if (!hasLabel(label)) {
        validationErrors.push({ line: line.line, message: `goto label not found: ${label}` });
      }
    }

    if (command === 'if' || command === 'ifnot') {
      const gotoIndex = tokens.indexOf('goto');
      if (gotoIndex === -1 || !tokens[gotoIndex + 1]) {
        validationErrors.push({ line: line.line, message: `${command} requires "goto <label>"` });
      } else {
        const label = tokens[gotoIndex + 1];
        if (!hasLabel(label)) {
          validationErrors.push({ line: line.line, message: `${command} label not found: ${label}` });
        }
      }
    }

    if ((command === 'on' || command === 'onpress' || command === 'onrelease') && tokens.length < 3) {
      validationErrors.push({ line: line.line, message: `${command} requires key and action` });
    }

    if ((command === 'after' || command === 'every') && tokens.length < 4) {
      validationErrors.push({ line: line.line, message: `${command} requires duration and action` });
    }

    if (['set', 'add', 'sub', 'mul', 'div', 'mod'].includes(command) && tokens.length < 3) {
      validationErrors.push({ line: line.line, message: `${command} requires variable and value` });
    }

    if ((command === 'inc' || command === 'dec') && tokens.length < 2) {
      validationErrors.push({ line: line.line, message: `${command} requires variable name` });
    }

    if (command === 'jump' && tokens.length < 2) {
      validationErrors.push({ line: line.line, message: 'jump requires force value' });
    }

    if (command === 'touch' && tokens[1] && !['on', 'off', 'auto'].includes(tokens[1].toLowerCase())) {
      validationErrors.push({ line: line.line, message: 'touch mode must be on|off|auto' });
    }
  });

  return validationErrors;
}

export function analyzeWBWCode(code: string): WBWError[] {
  const { program, errors } = parseWBW(code);
  return [...errors, ...validateParsedProgram(program)];
}
function isNumber(value: string): boolean {
  return /^-?\d+(\.\d+)?$/.test(value);
}

function isNumberLike(value: string): boolean {
  return isNumber(value) || value.toLowerCase() === 'rand';
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function sanitizeNumber(value: number, fallback: number): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return num;
}

function sanitizeDimension(value: number, fallback: number): number {
  const num = sanitizeNumber(value, fallback);
  if (num <= 0) return fallback;
  return Math.floor(num);
}

function sanitizeFps(value: number, fallback: number): number {
  const num = sanitizeNumber(value, fallback);
  if (num <= 0) return fallback;
  return num;
}

function rectsIntersect(a: WBWEntity, b: WBWEntity): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export class WBWEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private fps: number;
  private program: WBWProgram | null = null;
  private parseErrors: WBWError[] = [];
  private animationId: number | null = null;
  private lastTime = 0;
  private running = false;
  private muted = false;

  private vars: Record<string, number | string> = {};
  private player: WBWEntity | null = null;
  private entities: WBWEntity[] = [];
  private shapes: WBWShape[] = [];
  private uiShapes: WBWUIShape[] = [];
  private uiButtons: WBWUIButton[] = [];
  private texts: WBWText[] = [];
  private hudTexts: WBWText[] = [];
  private messages: WBWMessage[] = [];
  private background = DEFAULTS.background;
  private color = DEFAULTS.color;
  private playerColor = DEFAULTS.color;
  private playerSize = { ...DEFAULTS.playerSize };
  private textSize = DEFAULTS.textSize;
  private spawnPoint = { x: 0, y: 0 };
  private shakeTime = 0;
  private shakeMagnitude = 0;
  private time = 0;
  private frame = 0;
  private playerGrounded = false;
  private patrols: WBWPatrol[] = [];
  private worldWidth = 0;
  private worldHeight = 0;
  private cameraX = 0;
  private cameraY = 0;
  private cameraTarget: string | null = 'player';
  private cameraLerp = 1;
  private cameraOffsetX = 0;
  private cameraOffsetY = 0;
  private cameraClamp = true;
  private uiButtonColor = DEFAULTS.uiButtonColor;
  private uiButtonHoverColor = DEFAULTS.uiButtonHoverColor;
  private uiButtonTextColor = DEFAULTS.uiButtonTextColor;
  private hoveredUiId: string | null = null;
  private pointerX = 0;
  private pointerY = 0;
  private pointerDown = false;
  private timers: WBWTimer[] = [];
  private touchMode: WBWTouchMode = 'auto';
  private isTouchActive = false;
  private touchKeys = new Set<string>();

  private inputBindings: Record<string, CommandLine[]> = {};
  private inputPressBindings: Record<string, CommandLine[]> = {};
  private inputReleaseBindings: Record<string, CommandLine[]> = {};
  private uiClickBindings: Record<string, CommandLine[]> = {};
  private uiHoverBindings: Record<string, CommandLine[]> = {};
  private keys: Record<string, boolean> = {};
  private prevKeys: Record<string, boolean> = {};

  private labelStack: string[] = [];

  constructor(canvas: HTMLCanvasElement, options: { width: number; height: number; fps: number }) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    this.ctx = ctx;
    const safeWidth = sanitizeDimension(options.width, 800);
    const safeHeight = sanitizeDimension(options.height, 600);
    const safeFps = sanitizeFps(options.fps, 60);
    this.width = safeWidth;
    this.height = safeHeight;
    this.fps = safeFps;
    this.resize(safeWidth, safeHeight);
  }

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  load(code: string): { errors: WBWError[] } {
    const { program, errors } = parseWBW(code);
    this.program = program;
    this.parseErrors = [...errors, ...validateParsedProgram(program)];
    return { errors: this.parseErrors };
  }

  start() {
    if (!this.program || this.parseErrors.length > 0) {
      return;
    }

    this.resetState();
    this.running = true;
    this.executeLines(this.program.init, { source: 'init' });
    if (!this.running) {
      return;
    }
    this.attachListeners();
    this.lastTime = 0;
    this.updateCamera(true);
    this.render();
    this.animationId = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.detachListeners();
  }

  destroy() {
    this.stop();
    this.program = null;
  }

  resize(width: number, height: number) {
    const safeWidth = sanitizeDimension(width, this.width || 800);
    const safeHeight = sanitizeDimension(height, this.height || 600);
    this.width = safeWidth;
    this.height = safeHeight;
    this.canvas.width = safeWidth;
    this.canvas.height = safeHeight;
  }

  getErrors() {
    return this.parseErrors;
  }

  private resetState() {
    this.vars = {};
    this.vars.UIHOVER = '';
    this.vars.UICLICK = '';
    this.player = null;
    this.entities = [];
    this.shapes = [];
    this.uiShapes = [];
    this.uiButtons = [];
    this.texts = [];
    this.hudTexts = [];
    this.messages = [];
    this.background = DEFAULTS.background;
    this.color = DEFAULTS.color;
    this.playerColor = DEFAULTS.color;
    this.playerSize = { ...DEFAULTS.playerSize };
    this.textSize = DEFAULTS.textSize;
    this.spawnPoint = { x: 0, y: 0 };
    this.shakeTime = 0;
    this.shakeMagnitude = 0;
    this.time = 0;
    this.frame = 0;
    this.playerGrounded = false;
    this.patrols = [];
    this.worldWidth = this.width;
    this.worldHeight = this.height;
    this.cameraX = 0;
    this.cameraY = 0;
    this.cameraTarget = 'player';
    this.cameraLerp = 1;
    this.cameraOffsetX = 0;
    this.cameraOffsetY = 0;
    this.cameraClamp = true;
    this.uiButtonColor = DEFAULTS.uiButtonColor;
    this.uiButtonHoverColor = DEFAULTS.uiButtonHoverColor;
    this.uiButtonTextColor = DEFAULTS.uiButtonTextColor;
    this.hoveredUiId = null;
    this.pointerX = 0;
    this.pointerY = 0;
    this.pointerDown = false;
    this.timers = [];
    this.inputBindings = {};
    this.inputPressBindings = {};
    this.inputReleaseBindings = {};
    this.uiClickBindings = {};
    this.uiHoverBindings = {};
    this.keys = {};
    this.prevKeys = {};
    this.labelStack = [];
  }

  private loop = (time: number) => {
    if (!this.running) return;
    if (!this.lastTime) {
      this.lastTime = time;
    }
    const delta = (time - this.lastTime) / 1000;
    const frameTime = 1 / Math.max(1, this.fps);
    if (delta >= frameTime) {
      this.update(delta);
      this.render();
      this.lastTime = time;
    }
    this.animationId = requestAnimationFrame(this.loop);
  };

  private update(delta: number) {
    if (!this.running) return;

    const scale = this.getScale(delta);
    const speed = this.getNumberVar('SPEED', DEFAULTS.speed);
    const gravity = this.getNumberVar('GRAVITY', DEFAULTS.gravity);
    const friction = clamp(this.getNumberVar('FRICTION', DEFAULTS.friction), 0, 1);

    this.time += delta;
    this.frame += 1;
    this.vars.TIME = Number(this.time.toFixed(3));
    this.vars.FRAME = this.frame;
    this.vars.DT = Number(delta.toFixed(4));
    this.vars.WORLDW = this.worldWidth;
    this.vars.WORLDH = this.worldHeight;
    this.vars.MX = Number(this.pointerX.toFixed(2));
    this.vars.MY = Number(this.pointerY.toFixed(2));
    this.vars.MOUSEDOWN = this.pointerDown ? 1 : 0;
    this.vars.TOUCH = this.isTouchActive ? 1 : 0;
    this.vars.UIHOVER = this.hoveredUiId ?? '';

    const keySet = new Set([
      ...Object.keys(this.inputBindings),
      ...Object.keys(this.inputPressBindings),
      ...Object.keys(this.inputReleaseBindings),
    ]);

    for (const key of keySet) {
      if (this.keys[key]) {
        for (const cmd of this.inputBindings[key] || []) {
          this.executeCommand(cmd.tokens, cmd.line, { speed, gravity, delta, key, source: 'input' });
        }
      }

      const wasDown = Boolean(this.prevKeys[key]);
      const isDown = Boolean(this.keys[key]);

      if (isDown && !wasDown) {
        for (const cmd of this.inputPressBindings[key] || []) {
          this.executeCommand(cmd.tokens, cmd.line, { speed, gravity, delta, key, source: 'input' });
        }
      }

      if (!isDown && wasDown) {
        for (const cmd of this.inputReleaseBindings[key] || []) {
          this.executeCommand(cmd.tokens, cmd.line, { speed, gravity, delta, key, source: 'input' });
        }
      }
    }

    this.updateTimers(delta, { speed, gravity });

    for (const patrol of this.patrols) {
      const entity = this.getEntityById(patrol.id);
      if (!entity) continue;
      if (entity.x <= patrol.minX) {
        patrol.speed = Math.abs(patrol.speed);
      }
      if (entity.x + entity.w >= patrol.maxX) {
        patrol.speed = -Math.abs(patrol.speed);
      }
      entity.vx = patrol.speed;
    }

    if (this.player) {
      const player = this.player;
      player.vy += gravity * scale;

      if (friction > 0) {
        const damp = clamp(1 - friction * scale, 0, 1);
        player.vx *= damp;
      }

      player.x += player.vx * scale;
      this.resolveHorizontalCollisions(player);

      player.y += player.vy * scale;
      this.playerGrounded = false;
      this.resolveVerticalCollisions(player);

      if (player.x < 0) {
        player.x = 0;
        player.vx = 0;
      }
      if (player.x + player.w > this.worldWidth) {
        player.x = this.worldWidth - player.w;
        player.vx = 0;
      }
      if (player.y < 0) {
        player.y = 0;
        player.vy = 0;
      }
      if (player.y + player.h >= this.worldHeight) {
        player.y = this.worldHeight - player.h;
        player.vy = 0;
        this.playerGrounded = true;
      }

      this.vars.PX = Number(player.x.toFixed(2));
      this.vars.PY = Number(player.y.toFixed(2));
      this.vars.VX = Number(player.vx.toFixed(2));
      this.vars.VY = Number(player.vy.toFixed(2));
      this.vars.GROUND = this.playerGrounded ? 1 : 0;
    }

    this.entities = this.entities.filter((entity) => {
      entity.x += entity.vx * scale;
      entity.y += entity.vy * scale;
      if (entity.type === 'bullet') {
        return entity.x >= -40 && entity.x <= this.worldWidth + 40;
      }
      return true;
    });

    this.runLabel('tick', { speed, gravity, delta, source: 'tick' });
    this.updateCamera();
    this.handleCollisions();
    this.updateMessages(delta);

    if (this.shakeTime > 0) {
      this.shakeTime = Math.max(0, this.shakeTime - delta);
    }

    this.prevKeys = { ...this.keys };
  }

  private render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const shakeX = this.shakeTime > 0 ? (Math.random() - 0.5) * this.shakeMagnitude : 0;
    const shakeY = this.shakeTime > 0 ? (Math.random() - 0.5) * this.shakeMagnitude : 0;

    ctx.fillStyle = this.background;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(-this.cameraX + shakeX, -this.cameraY + shakeY);

    for (const shape of this.shapes) {
      ctx.fillStyle = shape.color;
      if (shape.kind === 'rect') {
        ctx.fillRect(shape.x, shape.y, shape.w, shape.h);
      }
      if (shape.kind === 'circle') {
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (shape.kind === 'line') {
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(shape.x1, shape.y1);
        ctx.lineTo(shape.x2, shape.y2);
        ctx.stroke();
      }
      if (shape.kind === 'tri') {
        ctx.beginPath();
        ctx.moveTo(shape.x1, shape.y1);
        ctx.lineTo(shape.x2, shape.y2);
        ctx.lineTo(shape.x3, shape.y3);
        ctx.closePath();
        ctx.fill();
      }
    }

    if (this.player) {
      ctx.fillStyle = this.player.color;
      ctx.fillRect(this.player.x, this.player.y, this.player.w, this.player.h);
    }

    for (const entity of this.entities) {
      ctx.fillStyle = entity.color;
      ctx.fillRect(entity.x, entity.y, entity.w, entity.h);
    }

    for (const textItem of this.texts) {
      ctx.fillStyle = textItem.color;
      ctx.font = `${textItem.size}px Fira Mono, monospace`;
      ctx.fillText(this.resolveText(textItem.tokens), textItem.x, textItem.y);
    }

    ctx.restore();

    for (const hudItem of this.hudTexts) {
      ctx.fillStyle = hudItem.color;
      ctx.font = `${hudItem.size}px Fira Mono, monospace`;
      ctx.fillText(this.resolveText(hudItem.tokens), hudItem.x, hudItem.y);
    }

    this.renderUi();
    this.renderMessages();
  }

  private resolveText(tokens: string[]): string {
    if (tokens.length === 0) return '';
    return tokens
      .map((token) => {
        if (this.vars[token] !== undefined) {
          return String(this.vars[token]);
        }
        return token;
      })
      .join(' ');
  }

  private updateMessages(delta: number) {
    this.messages = this.messages
      .map((msg) => ({ ...msg, timeLeft: msg.timeLeft - delta }))
      .filter((msg) => msg.timeLeft > 0);
  }

  private updateTimers(delta: number, baseContext: { speed: number; gravity: number }) {
    if (this.timers.length === 0) return;

    const expired: WBWTimer[] = [];
    for (let i = this.timers.length - 1; i >= 0; i -= 1) {
      const timer = this.timers[i];
      timer.remaining -= delta;
      if (timer.remaining > 0) continue;

      expired.push({ ...timer });
      if (timer.repeat) {
        timer.remaining += Math.max(timer.interval, 1 / 60);
      } else {
        this.timers.splice(i, 1);
      }
    }

    expired.reverse().forEach((timer) => {
      this.runLabel(timer.label, {
        speed: baseContext.speed,
        gravity: baseContext.gravity,
        delta,
        source: 'tick',
      });
    });
  }

  private renderUi() {
    const ctx = this.ctx;

    for (const shape of this.uiShapes) {
      if (shape.kind === 'rect') {
        ctx.fillStyle = shape.color;
        ctx.fillRect(shape.x, shape.y, shape.w, shape.h);
      }
      if (shape.kind === 'circle') {
        ctx.fillStyle = shape.color;
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (shape.kind === 'line') {
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(shape.x1, shape.y1);
        ctx.lineTo(shape.x2, shape.y2);
        ctx.stroke();
      }
    }

    for (const button of this.uiButtons) {
      if (!button.visible) continue;

      const hovered = button.enabled && this.hoveredUiId === button.id;
      ctx.save();
      ctx.globalAlpha = button.enabled ? 1 : 0.55;
      ctx.fillStyle = hovered ? button.hoverColor : button.color;
      ctx.fillRect(button.x, button.y, button.w, button.h);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.strokeRect(button.x, button.y, button.w, button.h);
      ctx.fillStyle = button.textColor;
      ctx.font = `${Math.max(12, Math.floor(button.h * 0.42))}px Fira Mono, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        this.resolveText(button.textTokens),
        button.x + button.w / 2,
        button.y + button.h / 2
      );
      ctx.restore();
    }
  }

  private updateCamera(snap = false) {
    const targetId = this.cameraTarget;
    let target: WBWEntity | null = null;

    if (targetId === 'player') {
      target = this.player;
    } else if (targetId) {
      target = this.getEntityById(targetId);
    }

    if (target) {
      const desiredX = target.x + target.w / 2 - this.width / 2 + this.cameraOffsetX;
      const desiredY = target.y + target.h / 2 - this.height / 2 + this.cameraOffsetY;
      const lerp = snap ? 1 : clamp(this.cameraLerp, 0, 1);
      this.cameraX += (desiredX - this.cameraX) * lerp;
      this.cameraY += (desiredY - this.cameraY) * lerp;
    }

    if (this.cameraClamp) {
      const maxX = Math.max(0, this.worldWidth - this.width);
      const maxY = Math.max(0, this.worldHeight - this.height);
      this.cameraX = clamp(this.cameraX, 0, maxX);
      this.cameraY = clamp(this.cameraY, 0, maxY);
    }

    this.vars.CAMX = Number(this.cameraX.toFixed(2));
    this.vars.CAMY = Number(this.cameraY.toFixed(2));
  }

  private renderMessages() {
    if (this.messages.length === 0) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Fira Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const top = 16;
    this.messages.forEach((msg, index) => {
      ctx.fillText(msg.text, this.width / 2, top + index * 20);
    });
    ctx.restore();
  }

  private resolveHorizontalCollisions(player: WBWEntity) {
    const solids = this.shapes.filter((shape) => shape.kind === 'rect' && shape.solid) as Array<
      Extract<WBWShape, { kind: 'rect' }>
    >;
    for (const shape of solids) {
      const rect = { x: shape.x, y: shape.y, w: shape.w, h: shape.h };
      if (
        player.x < rect.x + rect.w &&
        player.x + player.w > rect.x &&
        player.y < rect.y + rect.h &&
        player.y + player.h > rect.y
      ) {
        if (player.vx > 0) {
          player.x = rect.x - player.w;
        } else if (player.vx < 0) {
          player.x = rect.x + rect.w;
        }
        player.vx = 0;
      }
    }
  }

  private resolveVerticalCollisions(player: WBWEntity) {
    const solids = this.shapes.filter((shape) => shape.kind === 'rect' && shape.solid) as Array<
      Extract<WBWShape, { kind: 'rect' }>
    >;
    for (const shape of solids) {
      const rect = { x: shape.x, y: shape.y, w: shape.w, h: shape.h };
      if (
        player.x < rect.x + rect.w &&
        player.x + player.w > rect.x &&
        player.y < rect.y + rect.h &&
        player.y + player.h > rect.y
      ) {
        if (player.vy > 0) {
          player.y = rect.y - player.h;
          this.playerGrounded = true;
        } else if (player.vy < 0) {
          player.y = rect.y + rect.h;
        }
        player.vy = 0;
      }
    }
  }

  private handleCollisions() {
    if (!this.player) return;
    const player = this.player;

    for (const entity of [...this.entities]) {
      if (!rectsIntersect(player, entity)) continue;

      if (entity.type === 'enemy') {
        this.runLabel('enemy_hit');
        player.vx = player.x < entity.x ? -2 : 2;
      }

      if (entity.type === 'item') {
        this.entities = this.entities.filter((e) => e !== entity);
        this.runLabel('item_pick');
      }
    }

    const bullets = this.entities.filter((e) => e.type === 'bullet');
    const enemies = this.entities.filter((e) => e.type === 'enemy');
    for (const bullet of bullets) {
      for (const enemy of enemies) {
        if (rectsIntersect(bullet, enemy)) {
          this.entities = this.entities.filter((e) => e !== bullet && e !== enemy);
          this.runLabel('enemy_down');
        }
      }
    }
  }

  private executeLines(
    lines: CommandLine[],
    context?: WBWExecutionContext
  ) {
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      const command = normalizeCommand(line.tokens[0]);
      if (command === 'loop') {
        const count = Math.max(0, Math.floor(this.getNumberValue(line.tokens[1])));
        const { block, endIndex } = this.collectLoopBlock(lines, i + 1);
        for (let loopIndex = 0; loopIndex < count; loopIndex += 1) {
          this.executeLines(block, context);
        }
        i = endIndex;
        continue;
      }

      if (command === 'end') {
        continue;
      }

      this.executeCommand(line.tokens, line.line, context);
      if (!this.running) {
        break;
      }
    }
  }

  private collectLoopBlock(lines: CommandLine[], startIndex: number) {
    const block: CommandLine[] = [];
    let depth = 0;
    let i = startIndex;
    for (; i < lines.length; i += 1) {
      const cmd = normalizeCommand(lines[i].tokens[0]);
      if (cmd === 'loop') {
        depth += 1;
      } else if (cmd === 'end') {
        if (depth === 0) break;
        depth -= 1;
      }
      block.push(lines[i]);
    }
    return { block, endIndex: i };
  }

  private executeCommand(
    tokens: string[],
    lineNumber: number,
    context?: WBWExecutionContext
  ) {
    const command = normalizeCommand(tokens[0]);

    switch (command) {
      case 'player': {
        const x = this.getNumberValue(tokens[1]);
        const y = this.getNumberValue(tokens[2]);
        const w = tokens[3] ? this.getNumberValue(tokens[3]) : this.playerSize.w;
        const h = tokens[4] ? this.getNumberValue(tokens[4]) : this.playerSize.h;
        this.player = {
          id: 'player',
          type: 'player',
          x,
          y,
          w,
          h,
          vx: 0,
          vy: 0,
          color: this.playerColor,
        };
        this.spawnPoint = { x, y };
        break;
      }
      case 'size': {
        const w = this.getNumberValue(tokens[1]);
        const h = this.getNumberValue(tokens[2]);
        if (w > 0 && h > 0) {
          this.playerSize = { w, h };
        }
        break;
      }
      case 'pcolor': {
        const color = tokens[1] || DEFAULTS.color;
        this.playerColor = color;
        if (this.player) {
          this.player.color = color;
        }
        break;
      }
      case 'textsize': {
        const size = this.getNumberValue(tokens[1]);
        if (size > 0) {
          this.textSize = size;
        }
        break;
      }
      case 'spawn': {
        const type = (tokens[1] || 'custom').toLowerCase();
        this.spawnEntity(type, tokens, 2);
        break;
      }
      case 'enemy': {
        this.spawnEntity('enemy', tokens, 1);
        break;
      }
      case 'item':
      case 'coin': {
        this.spawnEntity('item', tokens, 1);
        break;
      }
      case 'npc': {
        this.spawnEntity('custom', tokens, 1);
        break;
      }
      case 'patrol': {
        const id = tokens[1];
        if (!id) break;
        const minX = this.getNumberValue(tokens[2]);
        const maxX = this.getNumberValue(tokens[3]);
        const speed = this.getNumberValue(tokens[4] || '1');
        this.patrols.push({ id, minX, maxX, speed: speed || 1 });
        break;
      }
      case 'set': {
        const name = tokens[1];
        if (!name) break;
        if (tokens.length >= 3 && tokens[2]?.toLowerCase() === 'rand') {
          const result = this.readNumberExpr(tokens, 2);
          this.vars[name] = result.value;
          break;
        }
        if (tokens.length > 3 && !isNumber(tokens[2])) {
          this.vars[name] = tokens.slice(2).join(' ');
          break;
        }
        const value = tokens[2] !== undefined ? this.getValue(tokens[2]) : 0;
        this.vars[name] = value;
        break;
      }
      case 'rand': {
        const name = tokens[1];
        if (!name) break;
        const min = this.getNumberValue(tokens[2] || '0');
        const max = this.getNumberValue(tokens[3] || '1');
        this.vars[name] = Math.random() * (max - min) + min;
        break;
      }
      case 'add': {
        const name = tokens[1];
        if (!name) break;
        const value = this.getNumberValue(tokens[2]);
        this.vars[name] = this.getNumberVar(name, 0) + value;
        break;
      }
      case 'sub': {
        const name = tokens[1];
        if (!name) break;
        const value = this.getNumberValue(tokens[2]);
        this.vars[name] = this.getNumberVar(name, 0) - value;
        break;
      }
      case 'mul': {
        const name = tokens[1];
        if (!name) break;
        const value = this.getNumberValue(tokens[2]);
        this.vars[name] = this.getNumberVar(name, 0) * value;
        break;
      }
      case 'div': {
        const name = tokens[1];
        if (!name) break;
        const value = this.getNumberValue(tokens[2]);
        if (value === 0) break;
        this.vars[name] = this.getNumberVar(name, 0) / value;
        break;
      }
      case 'mod': {
        const name = tokens[1];
        if (!name) break;
        const value = this.getNumberValue(tokens[2]);
        if (value === 0) break;
        this.vars[name] = this.getNumberVar(name, 0) % value;
        break;
      }
      case 'inc': {
        const name = tokens[1];
        if (!name) break;
        const value = tokens[2] ? this.getNumberValue(tokens[2]) : 1;
        this.vars[name] = this.getNumberVar(name, 0) + value;
        break;
      }
      case 'dec': {
        const name = tokens[1];
        if (!name) break;
        const value = tokens[2] ? this.getNumberValue(tokens[2]) : 1;
        this.vars[name] = this.getNumberVar(name, 0) - value;
        break;
      }
      case 'abs': {
        const name = tokens[1];
        if (!name) break;
        this.vars[name] = Math.abs(this.getNumberVar(name, 0));
        break;
      }
      case 'neg': {
        const name = tokens[1];
        if (!name) break;
        this.vars[name] = -this.getNumberVar(name, 0);
        break;
      }
      case 'sign': {
        const name = tokens[1];
        if (!name) break;
        this.vars[name] = Math.sign(this.getNumberVar(name, 0));
        break;
      }
      case 'floor': {
        const name = tokens[1];
        if (!name) break;
        this.vars[name] = Math.floor(this.getNumberVar(name, 0));
        break;
      }
      case 'ceil': {
        const name = tokens[1];
        if (!name) break;
        this.vars[name] = Math.ceil(this.getNumberVar(name, 0));
        break;
      }
      case 'round': {
        const name = tokens[1];
        if (!name) break;
        this.vars[name] = Math.round(this.getNumberVar(name, 0));
        break;
      }
      case 'min': {
        const name = tokens[1];
        if (!name) break;
        const value = this.getNumberValue(tokens[2]);
        this.vars[name] = Math.min(this.getNumberVar(name, 0), value);
        break;
      }
      case 'max': {
        const name = tokens[1];
        if (!name) break;
        const value = this.getNumberValue(tokens[2]);
        this.vars[name] = Math.max(this.getNumberVar(name, 0), value);
        break;
      }
      case 'clamp': {
        const name = tokens[1];
        if (!name) break;
        const min = this.getNumberValue(tokens[2]);
        const max = this.getNumberValue(tokens[3]);
        this.vars[name] = clamp(this.getNumberVar(name, 0), min, max);
        break;
      }
      case 'pow': {
        const name = tokens[1];
        if (!name) break;
        const value = this.getNumberValue(tokens[2]);
        this.vars[name] = Math.pow(this.getNumberVar(name, 0), value);
        break;
      }
      case 'sqrt': {
        const name = tokens[1];
        if (!name) break;
        this.vars[name] = Math.sqrt(Math.max(0, this.getNumberVar(name, 0)));
        break;
      }
      case 'log': {
        const name = tokens[1];
        if (!name) break;
        this.vars[name] = Math.log(Math.max(1e-6, this.getNumberVar(name, 0)));
        break;
      }
      case 'exp': {
        const name = tokens[1];
        if (!name) break;
        this.vars[name] = Math.exp(this.getNumberVar(name, 0));
        break;
      }
      case 'sin': {
        const name = tokens[1];
        if (!name) break;
        this.vars[name] = Math.sin(this.getNumberVar(name, 0));
        break;
      }
      case 'cos': {
        const name = tokens[1];
        if (!name) break;
        this.vars[name] = Math.cos(this.getNumberVar(name, 0));
        break;
      }
      case 'tan': {
        const name = tokens[1];
        if (!name) break;
        this.vars[name] = Math.tan(this.getNumberVar(name, 0));
        break;
      }
      case 'asin': {
        const name = tokens[1];
        if (!name) break;
        this.vars[name] = Math.asin(clamp(this.getNumberVar(name, 0), -1, 1));
        break;
      }
      case 'acos': {
        const name = tokens[1];
        if (!name) break;
        this.vars[name] = Math.acos(clamp(this.getNumberVar(name, 0), -1, 1));
        break;
      }
      case 'atan': {
        const name = tokens[1];
        if (!name) break;
        this.vars[name] = Math.atan(this.getNumberVar(name, 0));
        break;
      }
      case 'lerp': {
        const name = tokens[1];
        if (!name) break;
        const a = this.getNumberValue(tokens[2]);
        const b = this.getNumberValue(tokens[3]);
        const t = clamp(this.getNumberValue(tokens[4]), 0, 1);
        this.vars[name] = a + (b - a) * t;
        break;
      }
      case 'swap': {
        const a = tokens[1];
        const b = tokens[2];
        if (!a || !b) break;
        const temp = this.vars[a] ?? 0;
        this.vars[a] = this.vars[b] ?? 0;
        this.vars[b] = temp;
        break;
      }
      case 'copy': {
        const dest = tokens[1];
        const src = tokens[2];
        if (!dest || !src) break;
        this.vars[dest] = this.vars[src] ?? this.getValue(src);
        break;
      }
      case 'toggle': {
        const name = tokens[1];
        if (!name) break;
        const current = this.getNumberVar(name, 0);
        this.vars[name] = current ? 0 : 1;
        break;
      }
      case 'randint': {
        const name = tokens[1];
        if (!name) break;
        const min = this.getNumberValue(tokens[2] || '0');
        const max = this.getNumberValue(tokens[3] || '1');
        const value = Math.floor(Math.random() * (max - min + 1)) + min;
        this.vars[name] = value;
        break;
      }
      case 'randfloat': {
        const name = tokens[1];
        if (!name) break;
        const min = this.getNumberValue(tokens[2] || '0');
        const max = this.getNumberValue(tokens[3] || '1');
        this.vars[name] = Math.random() * (max - min) + min;
        break;
      }
      case 'speed': {
        this.vars.SPEED = this.getNumberValue(tokens[1]);
        break;
      }
      case 'gravity': {
        this.vars.GRAVITY = this.getNumberValue(tokens[1]);
        break;
      }
      case 'friction': {
        this.vars.FRICTION = this.getNumberValue(tokens[1]);
        break;
      }
      case 'world': {
        const w = this.getNumberValue(tokens[1]);
        const h = this.getNumberValue(tokens[2]);
        if (w > 0) this.worldWidth = w;
        if (h > 0) this.worldHeight = h;
        this.vars.WORLDW = this.worldWidth;
        this.vars.WORLDH = this.worldHeight;
        break;
      }
      case 'cam': {
        this.cameraX = this.getNumberValue(tokens[1]);
        this.cameraY = this.getNumberValue(tokens[2]);
        break;
      }
      case 'camfollow': {
        const target = tokens[1];
        if (!target) {
          this.cameraTarget = null;
        } else {
          const normalized = target.toLowerCase();
          if (normalized === 'none' || normalized === 'off') {
            this.cameraTarget = null;
          } else if (normalized === 'player') {
            this.cameraTarget = 'player';
          } else {
            this.cameraTarget = target;
          }
        }
        break;
      }
      case 'camlerp': {
        const lerp = this.getNumberValue(tokens[1] || '1');
        this.cameraLerp = clamp(lerp, 0, 1);
        break;
      }
      case 'camoffset': {
        this.cameraOffsetX = this.getNumberValue(tokens[1]);
        this.cameraOffsetY = this.getNumberValue(tokens[2]);
        break;
      }
      case 'camclamp': {
        const value = tokens[1];
        if (value === undefined) {
          this.cameraClamp = true;
        } else {
          const normalized = value.toLowerCase();
          this.cameraClamp = normalized === '1' || normalized === 'true' || normalized === 'on';
        }
        break;
      }
      case 'camreset': {
        this.cameraX = 0;
        this.cameraY = 0;
        this.cameraTarget = 'player';
        this.cameraLerp = 1;
        this.cameraOffsetX = 0;
        this.cameraOffsetY = 0;
        this.cameraClamp = true;
        break;
      }
      case 'bg': {
        this.background = tokens[1] || DEFAULTS.background;
        break;
      }
      case 'color': {
        this.color = tokens[1] || DEFAULTS.color;
        break;
      }
      case 'uicolor': {
        if (tokens[1]) this.uiButtonColor = tokens[1];
        if (tokens[2]) this.uiButtonHoverColor = tokens[2];
        if (tokens[3]) this.uiButtonTextColor = tokens[3];
        break;
      }
      case 'uirect': {
        let index = 1;
        const xResult = this.readNumberExpr(tokens, index);
        index = xResult.nextIndex;
        const yResult = this.readNumberExpr(tokens, index);
        index = yResult.nextIndex;
        const wResult = this.readNumberExpr(tokens, index);
        index = wResult.nextIndex;
        const hResult = this.readNumberExpr(tokens, index);
        this.uiShapes.push({
          kind: 'rect',
          x: xResult.value,
          y: yResult.value,
          w: wResult.value,
          h: hResult.value,
          color: this.color,
        });
        break;
      }
      case 'uicircle': {
        let index = 1;
        const xResult = this.readNumberExpr(tokens, index);
        index = xResult.nextIndex;
        const yResult = this.readNumberExpr(tokens, index);
        index = yResult.nextIndex;
        const rResult = this.readNumberExpr(tokens, index);
        this.uiShapes.push({
          kind: 'circle',
          x: xResult.value,
          y: yResult.value,
          r: rResult.value,
          color: this.color,
        });
        break;
      }
      case 'uiline': {
        let index = 1;
        const x1 = this.readNumberExpr(tokens, index);
        index = x1.nextIndex;
        const y1 = this.readNumberExpr(tokens, index);
        index = y1.nextIndex;
        const x2 = this.readNumberExpr(tokens, index);
        index = x2.nextIndex;
        const y2 = this.readNumberExpr(tokens, index);
        this.uiShapes.push({
          kind: 'line',
          x1: x1.value,
          y1: y1.value,
          x2: x2.value,
          y2: y2.value,
          color: this.color,
        });
        break;
      }
      case 'button': {
        const id = tokens[1];
        if (!id) break;
        const x = this.getNumberValue(tokens[2]);
        const y = this.getNumberValue(tokens[3]);
        const w = Math.max(8, this.getNumberValue(tokens[4]));
        const h = Math.max(8, this.getNumberValue(tokens[5]));
        const textTokens = tokens.slice(6);
        const existing = this.getUiButtonById(id);

        if (existing) {
          existing.x = x;
          existing.y = y;
          existing.w = w;
          existing.h = h;
          existing.textTokens = textTokens.length > 0 ? textTokens : [id];
          existing.color = this.uiButtonColor;
          existing.hoverColor = this.uiButtonHoverColor;
          existing.textColor = this.uiButtonTextColor;
          break;
        }

        this.uiButtons.push({
          id,
          x,
          y,
          w,
          h,
          textTokens: textTokens.length > 0 ? textTokens : [id],
          color: this.uiButtonColor,
          hoverColor: this.uiButtonHoverColor,
          textColor: this.uiButtonTextColor,
          visible: true,
          enabled: true,
        });
        break;
      }
      case 'removeui': {
        const id = tokens[1];
        if (!id) break;
        this.uiButtons = this.uiButtons.filter((button) => button.id !== id);
        delete this.uiClickBindings[id];
        delete this.uiHoverBindings[id];
        if (this.hoveredUiId === id) {
          this.hoveredUiId = null;
          this.vars.UIHOVER = '';
        }
        break;
      }
      case 'clearui': {
        this.clearUi();
        break;
      }
      case 'uivisible': {
        const id = tokens[1];
        if (!id) break;
        const button = this.getUiButtonById(id);
        if (!button) break;
        button.visible = this.parseBooleanToken(tokens[2], true);
        if (!button.visible && this.hoveredUiId === id) {
          this.hoveredUiId = null;
          this.vars.UIHOVER = '';
        }
        break;
      }
      case 'uienable': {
        const id = tokens[1];
        if (!id) break;
        const button = this.getUiButtonById(id);
        if (!button) break;
        button.enabled = this.parseBooleanToken(tokens[2], true);
        if (!button.enabled && this.hoveredUiId === id) {
          this.hoveredUiId = null;
          this.vars.UIHOVER = '';
        }
        break;
      }
      case 'rect': {
        let index = 1;
        const xResult = this.readNumberExpr(tokens, index);
        index = xResult.nextIndex;
        const yResult = this.readNumberExpr(tokens, index);
        index = yResult.nextIndex;
        const wResult = this.readNumberExpr(tokens, index);
        index = wResult.nextIndex;
        const hResult = this.readNumberExpr(tokens, index);
        this.shapes.push({
          kind: 'rect',
          x: xResult.value,
          y: yResult.value,
          w: wResult.value,
          h: hResult.value,
          color: this.color,
          solid: false,
        });
        break;
      }
      case 'platform': {
        let index = 1;
        const xResult = this.readNumberExpr(tokens, index);
        index = xResult.nextIndex;
        const yResult = this.readNumberExpr(tokens, index);
        index = yResult.nextIndex;
        const wResult = this.readNumberExpr(tokens, index);
        index = wResult.nextIndex;
        const hResult = this.readNumberExpr(tokens, index);
        this.shapes.push({
          kind: 'rect',
          x: xResult.value,
          y: yResult.value,
          w: wResult.value,
          h: hResult.value,
          color: this.color,
          solid: true,
        });
        break;
      }
      case 'circle': {
        let index = 1;
        const xResult = this.readNumberExpr(tokens, index);
        index = xResult.nextIndex;
        const yResult = this.readNumberExpr(tokens, index);
        index = yResult.nextIndex;
        const rResult = this.readNumberExpr(tokens, index);
        this.shapes.push({
          kind: 'circle',
          x: xResult.value,
          y: yResult.value,
          r: rResult.value,
          color: this.color,
          solid: false,
        });
        break;
      }
      case 'line': {
        let index = 1;
        const x1 = this.readNumberExpr(tokens, index);
        index = x1.nextIndex;
        const y1 = this.readNumberExpr(tokens, index);
        index = y1.nextIndex;
        const x2 = this.readNumberExpr(tokens, index);
        index = x2.nextIndex;
        const y2 = this.readNumberExpr(tokens, index);
        this.shapes.push({
          kind: 'line',
          x1: x1.value,
          y1: y1.value,
          x2: x2.value,
          y2: y2.value,
          color: this.color,
        });
        break;
      }
      case 'tri': {
        let index = 1;
        const x1 = this.readNumberExpr(tokens, index);
        index = x1.nextIndex;
        const y1 = this.readNumberExpr(tokens, index);
        index = y1.nextIndex;
        const x2 = this.readNumberExpr(tokens, index);
        index = x2.nextIndex;
        const y2 = this.readNumberExpr(tokens, index);
        index = y2.nextIndex;
        const x3 = this.readNumberExpr(tokens, index);
        index = x3.nextIndex;
        const y3 = this.readNumberExpr(tokens, index);
        this.shapes.push({
          kind: 'tri',
          x1: x1.value,
          y1: y1.value,
          x2: x2.value,
          y2: y2.value,
          x3: x3.value,
          y3: y3.value,
          color: this.color,
        });
        break;
      }
      case 'text': {
        if (tokens.length < 4) break;
        const x = this.getNumberValue(tokens[tokens.length - 2]);
        const y = this.getNumberValue(tokens[tokens.length - 1]);
        const textTokens = tokens.slice(1, tokens.length - 2);
        this.texts.push({
          tokens: textTokens,
          x,
          y,
          color: this.color,
          size: this.textSize,
        });
        break;
      }
      case 'hud': {
        if (tokens.length < 4) break;
        const x = this.getNumberValue(tokens[tokens.length - 2]);
        const y = this.getNumberValue(tokens[tokens.length - 1]);
        const textTokens = tokens.slice(1, tokens.length - 2);
        this.hudTexts.push({
          tokens: textTokens,
          x,
          y,
          color: this.color,
          size: this.textSize,
        });
        break;
      }
      case 'on': {
        const key = tokens[1];
        if (!key) break;
        const action = tokens.slice(2);
        this.registerBinding(this.inputBindings, key, action, lineNumber);
        break;
      }
      case 'onpress': {
        const key = tokens[1];
        if (!key) break;
        const action = tokens.slice(2);
        this.registerBinding(this.inputPressBindings, key, action, lineNumber);
        break;
      }
      case 'onrelease': {
        const key = tokens[1];
        if (!key) break;
        const action = tokens.slice(2);
        this.registerBinding(this.inputReleaseBindings, key, action, lineNumber);
        break;
      }
      case 'onui': {
        const id = tokens[1];
        if (!id) break;
        const action = tokens.slice(2);
        this.registerUiBinding(this.uiClickBindings, id, action, lineNumber);
        break;
      }
      case 'onhoverui': {
        const id = tokens[1];
        if (!id) break;
        const action = tokens.slice(2);
        this.registerUiBinding(this.uiHoverBindings, id, action, lineNumber);
        break;
      }
      case 'move': {
        const { target, index } = this.resolveTarget(tokens, 1);
        if (!target) break;
        const dx = this.getNumberValue(tokens[index]);
        const dy = this.getNumberValue(tokens[index + 1]);
        const speed = context?.speed ?? this.getNumberVar('SPEED', DEFAULTS.speed);
        const scale = this.getScale(context?.delta);
        const factor = target === this.player ? speed : 1;
        target.x += dx * factor * scale;
        target.y += dy * factor * scale;
        break;
      }
      case 'vel': {
        const { target, index } = this.resolveTarget(tokens, 1);
        if (!target) break;
        const vx = this.getNumberValue(tokens[index]);
        const vy = this.getNumberValue(tokens[index + 1]);
        target.vx = vx;
        target.vy = vy;
        break;
      }
      case 'push': {
        const { target, index } = this.resolveTarget(tokens, 1);
        if (!target) break;
        const vx = this.getNumberValue(tokens[index]);
        const vy = this.getNumberValue(tokens[index + 1]);
        target.vx += vx;
        target.vy += vy;
        break;
      }
      case 'setx': {
        const { target, index } = this.resolveTarget(tokens, 1);
        if (!target) break;
        target.x = this.getNumberValue(tokens[index]);
        break;
      }
      case 'sety': {
        const { target, index } = this.resolveTarget(tokens, 1);
        if (!target) break;
        target.y = this.getNumberValue(tokens[index]);
        break;
      }
      case 'addx': {
        const { target, index } = this.resolveTarget(tokens, 1);
        if (!target) break;
        target.x += this.getNumberValue(tokens[index]);
        break;
      }
      case 'addy': {
        const { target, index } = this.resolveTarget(tokens, 1);
        if (!target) break;
        target.y += this.getNumberValue(tokens[index]);
        break;
      }
      case 'velx': {
        const { target, index } = this.resolveTarget(tokens, 1);
        if (!target) break;
        target.vx = this.getNumberValue(tokens[index]);
        break;
      }
      case 'vely': {
        const { target, index } = this.resolveTarget(tokens, 1);
        if (!target) break;
        target.vy = this.getNumberValue(tokens[index]);
        break;
      }
      case 'pushx': {
        const { target, index } = this.resolveTarget(tokens, 1);
        if (!target) break;
        target.vx += this.getNumberValue(tokens[index]);
        break;
      }
      case 'pushy': {
        const { target, index } = this.resolveTarget(tokens, 1);
        if (!target) break;
        target.vy += this.getNumberValue(tokens[index]);
        break;
      }
      case 'stopx': {
        const { target } = this.resolveTarget(tokens, 1);
        if (!target) break;
        target.vx = 0;
        break;
      }
      case 'stopy': {
        const { target } = this.resolveTarget(tokens, 1);
        if (!target) break;
        target.vy = 0;
        break;
      }
      case 'flipx': {
        const { target } = this.resolveTarget(tokens, 1);
        if (!target) break;
        target.vx = -target.vx;
        break;
      }
      case 'flipy': {
        const { target } = this.resolveTarget(tokens, 1);
        if (!target) break;
        target.vy = -target.vy;
        break;
      }
      case 'bouncex': {
        const { target, index } = this.resolveTarget(tokens, 1);
        if (!target) break;
        const factor = tokens[index] ? this.getNumberValue(tokens[index]) : 1;
        target.vx = -target.vx * factor;
        break;
      }
      case 'bouncey': {
        const { target, index } = this.resolveTarget(tokens, 1);
        if (!target) break;
        const factor = tokens[index] ? this.getNumberValue(tokens[index]) : 1;
        target.vy = -target.vy * factor;
        break;
      }
      case 'sizeof': {
        const { target, index } = this.resolveTarget(tokens, 1);
        if (!target) break;
        const w = this.getNumberValue(tokens[index]);
        const h = this.getNumberValue(tokens[index + 1] || String(w));
        if (w > 0) target.w = w;
        if (h > 0) target.h = h;
        break;
      }
      case 'colorof': {
        const { target, index } = this.resolveTarget(tokens, 1);
        if (!target) break;
        const color = tokens[index];
        if (color) target.color = color;
        break;
      }
      case 'setpos': {
        const { target, index } = this.resolveTarget(tokens, 1);
        if (!target) break;
        const x = this.getNumberValue(tokens[index]);
        const y = this.getNumberValue(tokens[index + 1]);
        target.x = x;
        target.y = y;
        target.vx = 0;
        target.vy = 0;
        break;
      }
      case 'remove': {
        const id = tokens[1];
        if (!id) break;
        this.entities = this.entities.filter((entity) => entity.id !== id);
        break;
      }
      case 'checkpoint': {
        if (tokens[1] && tokens[2]) {
          const x = this.getNumberValue(tokens[1]);
          const y = this.getNumberValue(tokens[2]);
          this.spawnPoint = { x, y };
        } else if (this.player) {
          this.spawnPoint = { x: this.player.x, y: this.player.y };
        }
        break;
      }
      case 'respawn': {
        if (!this.player) break;
        const x = tokens[1] ? this.getNumberValue(tokens[1]) : this.spawnPoint.x;
        const y = tokens[2] ? this.getNumberValue(tokens[2]) : this.spawnPoint.y;
        this.player.x = x;
        this.player.y = y;
        this.player.vx = 0;
        this.player.vy = 0;
        break;
      }
      case 'jump': {
        if (!this.player) break;
        const force = this.getNumberValue(tokens[1] || '8');
        if (this.playerGrounded || this.player.vy === 0) {
          this.player.vy = -force;
          this.playerGrounded = false;
        }
        break;
      }
      case 'shoot': {
        if (!this.player) break;
        const dir = this.getNumberValue(tokens[1] || '1');
        const speed = this.getNumberValue(tokens[2] || '6');
        const bullet = {
          id: `bullet-${Date.now()}-${Math.random()}`,
          type: 'bullet' as const,
          x: this.player.x + this.player.w / 2,
          y: this.player.y + this.player.h / 2,
          w: DEFAULTS.bulletSize.w,
          h: DEFAULTS.bulletSize.h,
          vx: dir >= 0 ? speed : -Math.abs(speed),
          vy: 0,
          color: '#f8fafc',
        };
        this.entities.push(bullet);
        break;
      }
      case 'if': {
        const gotoIndex = tokens.indexOf('goto');
        if (gotoIndex === -1) break;
        const label = tokens[gotoIndex + 1];
        if (!label) break;

        if (gotoIndex === 2) {
          const condition = this.getValue(tokens[1]);
          if (Boolean(condition)) {
            this.runLabel(label, context);
          }
          break;
        }

        let op = '==';
        let leftToken = tokens[1];
        let rightToken = tokens[2];
        if (gotoIndex >= 4) {
          op = tokens[2];
          rightToken = tokens[3];
        }

        const leftVal = this.getValue(leftToken);
        const rightVal = this.getValue(rightToken);
        const result = this.compareValues(leftVal, rightVal, op);
        if (result) {
          this.runLabel(label, context);
        }
        break;
      }
      case 'ifnot': {
        const gotoIndex = tokens.indexOf('goto');
        if (gotoIndex === -1) break;
        const label = tokens[gotoIndex + 1];
        if (!label) break;

        if (gotoIndex === 2) {
          const condition = this.getValue(tokens[1]);
          if (!Boolean(condition)) {
            this.runLabel(label, context);
          }
          break;
        }

        let op = '==';
        let leftToken = tokens[1];
        let rightToken = tokens[2];
        if (gotoIndex >= 4) {
          op = tokens[2];
          rightToken = tokens[3];
        }

        const leftVal = this.getValue(leftToken);
        const rightVal = this.getValue(rightToken);
        const result = this.compareValues(leftVal, rightVal, op);
        if (!result) {
          this.runLabel(label, context);
        }
        break;
      }
      case 'touch': {
        const raw = (tokens[1] || 'auto').toLowerCase();
        if (raw === 'on' || raw === 'off' || raw === 'auto') {
          this.touchMode = raw;
          if (raw === 'off') {
            this.releaseTouchKeys();
          }
        }
        break;
      }
      case 'and': {
        const name = tokens[1];
        if (!name) break;
        const a = this.getNumberValue(tokens[2]);
        const b = this.getNumberValue(tokens[3]);
        this.vars[name] = a !== 0 && b !== 0 ? 1 : 0;
        break;
      }
      case 'or': {
        const name = tokens[1];
        if (!name) break;
        const a = this.getNumberValue(tokens[2]);
        const b = this.getNumberValue(tokens[3]);
        this.vars[name] = a !== 0 || b !== 0 ? 1 : 0;
        break;
      }
      case 'not': {
        const name = tokens[1];
        if (!name) break;
        const source = tokens[2] ? this.getNumberValue(tokens[2]) : this.getNumberVar(name, 0);
        this.vars[name] = source !== 0 ? 0 : 1;
        break;
      }
      case 'goto': {
        const label = tokens[1];
        if (label) this.runLabel(label, context);
        break;
      }
      case 'after':
      case 'every': {
        const timer = this.parseTimerCommand(tokens);
        if (!timer) break;
        const repeat = command === 'every';
        if (!repeat && timer.seconds <= 0) {
          this.runLabel(timer.label, context);
          break;
        }

        const interval = Math.max(1 / 60, timer.seconds);
        const timerId = timer.id || `${command}:${lineNumber}:${timer.label}`;
        this.timers = this.timers.filter((item) => item.id !== timerId);
        this.timers.push({
          id: timerId,
          label: timer.label,
          remaining: interval,
          interval,
          repeat,
        });
        break;
      }
      case 'canceltimer': {
        const id = tokens[1];
        if (!id) break;
        this.timers = this.timers.filter((timer) => timer.id !== id);
        break;
      }
      case 'cleartimers': {
        this.timers = [];
        break;
      }
      case 'msg': {
        let textTokens = tokens.slice(1);
        let duration = 2;
        if (textTokens.length === 0) {
          textTokens = ['Message'];
        }
        const lastToken = textTokens[textTokens.length - 1];
        if (lastToken && isNumber(lastToken)) {
          duration = Number(lastToken);
          textTokens = textTokens.slice(0, -1);
        }
        const text = textTokens.length > 0 ? this.resolveText(textTokens) : 'Message';
        this.messages.push({ text, timeLeft: duration });
        break;
      }
      case 'sound': {
        if (this.muted) break;
        break;
      }
      case 'shake': {
        const amount = this.getNumberValue(tokens[1] || '6');
        const duration = this.getNumberValue(tokens[2] || '0.2');
        this.shakeMagnitude = amount;
        this.shakeTime = Math.max(0.05, duration);
        break;
      }
      case 'stop': {
        this.running = false;
        break;
      }
      default: {
        this.parseErrors.push({ line: lineNumber, message: `Unknown command: ${tokens[0]}` });
        break;
      }
    }
  }

  private runLabel(
    label: string,
    context?: WBWExecutionContext
  ) {
    if (!this.program || !this.program.labels[label]) return;
    if (this.labelStack.includes(label)) return;
    if (this.labelStack.length > 10) return;
    this.labelStack.push(label);
    this.executeLines(this.program.labels[label], context);
    this.labelStack.pop();
  }

  private compareValues(left: number | string, right: number | string, op: string): boolean {
    const leftNum = Number(left);
    const rightNum = Number(right);
    const bothNumbers = !Number.isNaN(leftNum) && !Number.isNaN(rightNum);
    const a = bothNumbers ? leftNum : String(left);
    const b = bothNumbers ? rightNum : String(right);

    switch (op) {
      case '>':
        return a > b;
      case '<':
        return a < b;
      case '>=':
        return a >= b;
      case '<=':
        return a <= b;
      case '!=':
        return a !== b;
      case '=':
      case '==':
        return a === b;
      default:
        return a === b;
    }
  }

  private getScale(delta: number | undefined) {
    if (!delta || !Number.isFinite(delta)) return 1;
    return clamp(delta * 60, 0, 3);
  }

  private getNumberVar(name: string, fallback: number) {
    const value = this.vars[name];
    if (typeof value === 'number') return value;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }

  private getValue(token: string): number | string {
    if (token === undefined) return 0;
    if (token === 'rand') return Math.random();
    if (token.includes('.')) {
      const namespaced = this.vars[token];
      if (namespaced !== undefined) return namespaced;
      const separatorIndex = token.lastIndexOf('.');
      const short = separatorIndex >= 0 ? token.slice(separatorIndex + 1) : token;
      if (short && this.vars[short] !== undefined) return this.vars[short];
    }
    if (this.vars[token] !== undefined) return this.vars[token];
    if (isNumber(token)) return Number(token);
    return token;
  }

  private getNumberValue(token: string | undefined): number {
    if (!token) return 0;
    if (token.toLowerCase() === 'rand') return Math.random();
    if (token.includes('.')) {
      const namespaced = this.vars[token];
      if (namespaced !== undefined) {
        const value = Number(namespaced);
        return Number.isNaN(value) ? 0 : value;
      }
      const separatorIndex = token.lastIndexOf('.');
      const short = separatorIndex >= 0 ? token.slice(separatorIndex + 1) : token;
      if (short && this.vars[short] !== undefined) {
        const value = Number(this.vars[short]);
        return Number.isNaN(value) ? 0 : value;
      }
    }
    if (this.vars[token] !== undefined) {
      const value = Number(this.vars[token]);
      return Number.isNaN(value) ? 0 : value;
    }
    return isNumber(token) ? Number(token) : 0;
  }

  private readNumberExpr(tokens: string[], index: number): { value: number; nextIndex: number } {
    const token = tokens[index];
    if (!token) return { value: 0, nextIndex: index + 1 };
    if (token.toLowerCase() === 'rand') {
      const min = this.getNumberValue(tokens[index + 1] || '0');
      const max = this.getNumberValue(tokens[index + 2] || '0');
      return { value: Math.random() * (max - min) + min, nextIndex: index + 3 };
    }
    return { value: this.getNumberValue(token), nextIndex: index + 1 };
  }

  private resolveTarget(tokens: string[], startIndex: number): { target: WBWEntity | null; index: number } {
    let index = startIndex;
    let target: WBWEntity | null = null;
    const token = tokens[index];
    if (token && !isNumberLike(token)) {
      if (token.toLowerCase() === 'player') {
        target = this.player;
      } else {
        target = this.getEntityById(token);
      }
      index += 1;
    } else {
      target = this.player;
    }
    return { target, index };
  }

  private getEntityById(id: string): WBWEntity | null {
    const entity = this.entities.find((item) => item.id === id);
    return entity || null;
  }

  private spawnEntity(type: string, tokens: string[], startIndex: number) {
    let index = startIndex;
    let id = '';
    const maybeId = tokens[index];
    if (maybeId && !isNumberLike(maybeId)) {
      id = maybeId;
      index += 1;
    }
    const xResult = this.readNumberExpr(tokens, index);
    index = xResult.nextIndex;
    const yResult = this.readNumberExpr(tokens, index);
    index = yResult.nextIndex;
    const size = type === 'enemy' ? DEFAULTS.enemySize : DEFAULTS.itemSize;
    let w = size;
    let h = size;
    if (tokens[index]) {
      const wResult = this.readNumberExpr(tokens, index);
      w = wResult.value;
      index = wResult.nextIndex;
    }
    if (tokens[index]) {
      const hResult = this.readNumberExpr(tokens, index);
      h = hResult.value;
    }
    const color =
      type === 'enemy'
        ? '#f87171'
        : type === 'item'
          ? '#facc15'
          : '#e2e8f0';
    this.entities.push({
      id: id || `${type}-${Date.now()}-${Math.random()}`,
      type: type === 'enemy' || type === 'item' ? (type as WBWEntity['type']) : 'custom',
      x: xResult.value,
      y: yResult.value,
      w,
      h,
      vx: 0,
      vy: 0,
      color,
    });
  }

  private registerBinding(map: Record<string, CommandLine[]>, key: string, action: string[], lineNumber: number) {
    if (action.length === 0) return;
    const normalized = normalizeKey(key);
    if (!map[normalized]) {
      map[normalized] = [];
    }
    const raw = action.join(' ');
    const exists = map[normalized].some((cmd) => cmd.raw === raw);
    if (!exists) {
      map[normalized].push({ tokens: action, line: lineNumber, raw });
    }
  }

  private registerUiBinding(
    map: Record<string, CommandLine[]>,
    id: string,
    action: string[],
    lineNumber: number
  ) {
    if (action.length === 0) return;
    if (!map[id]) {
      map[id] = [];
    }
    const raw = action.join(' ');
    const exists = map[id].some((cmd) => cmd.raw === raw);
    if (!exists) {
      map[id].push({ tokens: action, line: lineNumber, raw });
    }
  }

  private runUiBindings(
    map: Record<string, CommandLine[]>,
    id: string,
    context?: WBWExecutionContext
  ) {
    for (const cmd of map[id] || []) {
      this.executeCommand(cmd.tokens, cmd.line, context);
      if (!this.running) {
        break;
      }
    }
  }

  private getUiButtonById(id: string): WBWUIButton | null {
    const button = this.uiButtons.find((item) => item.id === id);
    return button || null;
  }

  private clearUi() {
    this.uiShapes = [];
    this.uiButtons = [];
    this.uiClickBindings = {};
    this.uiHoverBindings = {};
    this.hoveredUiId = null;
    this.vars.UIHOVER = '';
    this.vars.UICLICK = '';
  }

  private parseBooleanToken(token: string | undefined, fallback: boolean): boolean {
    if (token === undefined) return fallback;
    const normalized = token.toLowerCase();
    if (normalized === '1' || normalized === 'true' || normalized === 'on' || normalized === 'yes') {
      return true;
    }
    if (normalized === '0' || normalized === 'false' || normalized === 'off' || normalized === 'no') {
      return false;
    }
    return fallback;
  }

  private parseTimerCommand(tokens: string[]): { id: string; label: string; seconds: number } | null {
    if (tokens.length < 3) return null;

    let index = 1;
    let id = '';
    const maybeId = tokens[index];
    const maybeSecondsToken = tokens[index + 1];

    if (maybeId && maybeSecondsToken && !isNumberLike(maybeId)) {
      const resolved = this.getValue(maybeSecondsToken);
      const maybeNumericDuration = typeof resolved === 'number' || isNumberLike(maybeSecondsToken);
      if (maybeNumericDuration) {
        id = maybeId;
        index += 1;
      }
    }

    const seconds = this.getNumberValue(tokens[index]);
    index += 1;
    const marker = tokens[index];
    if (!marker) return null;

    let label = '';
    if (marker.toLowerCase() === 'goto') {
      label = tokens[index + 1] || '';
    } else {
      label = marker;
    }

    if (!label) return null;
    return { id, label, seconds };
  }

  private getButtonAt(x: number, y: number): WBWUIButton | null {
    for (let i = this.uiButtons.length - 1; i >= 0; i -= 1) {
      const button = this.uiButtons[i];
      if (!button.visible || !button.enabled) continue;
      const inside =
        x >= button.x &&
        x <= button.x + button.w &&
        y >= button.y &&
        y <= button.y + button.h;
      if (inside) {
        return button;
      }
    }
    return null;
  }

  private getPointerFromEvent(event: MouseEvent): { x: number; y: number } | null {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    const x = clamp(((event.clientX - rect.left) / rect.width) * this.width, 0, this.width);
    const y = clamp(((event.clientY - rect.top) / rect.height) * this.height, 0, this.height);
    return { x, y };
  }

  private updatePointer(pointer: { x: number; y: number }) {
    this.pointerX = pointer.x;
    this.pointerY = pointer.y;
    this.vars.MX = Number(pointer.x.toFixed(2));
    this.vars.MY = Number(pointer.y.toFixed(2));
  }

  private attachListeners() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('mouseup', this.handlePointerUp);
    this.canvas.addEventListener('mousemove', this.handlePointerMove);
    this.canvas.addEventListener('mousedown', this.handlePointerDown);
    this.canvas.addEventListener('mouseleave', this.handlePointerLeave);
    this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd);
    this.canvas.addEventListener('touchcancel', this.handleTouchEnd);
  }

  private detachListeners() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('mouseup', this.handlePointerUp);
    this.canvas.removeEventListener('mousemove', this.handlePointerMove);
    this.canvas.removeEventListener('mousedown', this.handlePointerDown);
    this.canvas.removeEventListener('mouseleave', this.handlePointerLeave);
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
    this.canvas.removeEventListener('touchcancel', this.handleTouchEnd);
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    const key = normalizeKey(event.key);
    this.keys[key] = true;
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    const key = normalizeKey(event.key);
    this.keys[key] = false;
  };

  private handlePointerMove = (event: MouseEvent) => {
    if (!this.running) return;
    const pointer = this.getPointerFromEvent(event);
    if (!pointer) return;

    this.updatePointer(pointer);
    const hovered = this.getButtonAt(pointer.x, pointer.y);
    const nextHoveredId = hovered?.id || null;
    if (nextHoveredId === this.hoveredUiId) {
      return;
    }

    this.hoveredUiId = nextHoveredId;
    this.vars.UIHOVER = nextHoveredId ?? '';
    if (hovered) {
      this.runUiBindings(this.uiHoverBindings, hovered.id, {
        source: 'ui',
        mouseX: pointer.x,
        mouseY: pointer.y,
      });
    }
  };

  private handlePointerDown = (event: MouseEvent) => {
    if (!this.running) return;
    const pointer = this.getPointerFromEvent(event);
    if (!pointer) return;

    this.updatePointer(pointer);
    this.pointerDown = true;
    this.vars.MOUSEDOWN = 1;
    const button = this.getButtonAt(pointer.x, pointer.y);
    if (!button) {
      this.vars.UICLICK = '';
      return;
    }

    this.vars.UICLICK = button.id;

    this.runUiBindings(this.uiClickBindings, button.id, {
      source: 'ui',
      mouseX: pointer.x,
      mouseY: pointer.y,
    });
  };

  private handlePointerUp = (event: MouseEvent) => {
    if (!this.running) return;
    const pointer = this.getPointerFromEvent(event);
    if (pointer) {
      this.updatePointer(pointer);
    }
    this.pointerDown = false;
    this.vars.MOUSEDOWN = 0;
  };

  private handlePointerLeave = () => {
    this.pointerDown = false;
    this.hoveredUiId = null;
    this.vars.MOUSEDOWN = 0;
    this.vars.UIHOVER = '';
  };

  private getPointerFromTouch(touch: Touch): { x: number; y: number } | null {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    const x = clamp(((touch.clientX - rect.left) / rect.width) * this.width, 0, this.width);
    const y = clamp(((touch.clientY - rect.top) / rect.height) * this.height, 0, this.height);
    return { x, y };
  }

  private releaseTouchKeys() {
    this.touchKeys.forEach((key) => {
      this.keys[key] = false;
    });
    this.touchKeys.clear();
    this.isTouchActive = false;
    this.vars.TOUCH = 0;
  }

  private applyTouchControls(event: TouchEvent) {
    if (this.touchMode === 'off') return;
    if (this.touchMode === 'auto' && event.touches.length === 0) {
      this.releaseTouchKeys();
      return;
    }

    const next = new Set<string>();
    let pointer: { x: number; y: number } | null = null;

    for (let i = 0; i < event.touches.length; i += 1) {
      const touch = event.touches.item(i);
      if (!touch) continue;
      const pos = this.getPointerFromTouch(touch);
      if (!pos) continue;
      pointer = pos;

      const leftZone = pos.x <= this.width * 0.45;
      const rightZone = pos.x >= this.width * 0.55;
      const upperZone = pos.y <= this.height * 0.45;
      const actionZone = pos.x >= this.width * 0.72 && pos.y >= this.height * 0.55;

      if (leftZone && pos.x < this.width * 0.28) next.add('arrowleft');
      if (leftZone && pos.x >= this.width * 0.28 && pos.x <= this.width * 0.45) next.add('arrowright');
      if (leftZone && upperZone) next.add('arrowup');
      if (rightZone && actionZone) next.add('space');
    }

    const allKeys = new Set([...this.touchKeys, ...next]);
    allKeys.forEach((key) => {
      const pressed = next.has(key);
      this.keys[key] = pressed;
    });
    this.touchKeys = next;
    this.isTouchActive = event.touches.length > 0;
    this.vars.TOUCH = this.isTouchActive ? 1 : 0;

    if (pointer) {
      this.updatePointer(pointer);
      this.pointerDown = true;
      this.vars.MOUSEDOWN = 1;
    } else {
      this.pointerDown = false;
      this.vars.MOUSEDOWN = 0;
    }
  }

  private handleTouchStart = (event: TouchEvent) => {
    if (!this.running) return;
    event.preventDefault();
    this.applyTouchControls(event);
  };

  private handleTouchMove = (event: TouchEvent) => {
    if (!this.running) return;
    event.preventDefault();
    this.applyTouchControls(event);
  };

  private handleTouchEnd = (event: TouchEvent) => {
    if (!this.running) return;
    this.applyTouchControls(event);
    if (event.touches.length === 0) {
      this.pointerDown = false;
      this.vars.MOUSEDOWN = 0;
      this.vars.UICLICK = '';
    }
  };
}

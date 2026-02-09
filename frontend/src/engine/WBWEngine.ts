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

interface WBWShape {
  kind: 'rect' | 'circle';
  x: number;
  y: number;
  w?: number;
  h?: number;
  r?: number;
  color: string;
  solid: boolean;
}

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

const DEFAULTS = {
  background: '#0b1120',
  color: '#38bdf8',
  playerSize: 16,
  enemySize: 14,
  itemSize: 10,
  bulletSize: { w: 6, h: 2 },
  speed: 2,
  gravity: 0.6,
};

const KEY_ALIASES: Record<string, string> = {
  left: 'arrowleft',
  right: 'arrowright',
  up: 'arrowup',
  down: 'arrowdown',
  space: 'space',
};

function normalizeKey(key: string): string {
  const lower = key.toLowerCase();
  if (lower === ' ') return 'space';
  return KEY_ALIASES[lower] || lower;
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

    const tokens = tokenize(stripped);
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
      }
      currentLabel = labelName;
      return;
    }

    const command: CommandLine = { tokens, line: lineNumber, raw: stripped };
    if (currentLabel) {
      labels[currentLabel].push(command);
    } else {
      init.push(command);
    }
  });

  return { program: { init, labels }, errors };
}

function isNumber(value: string): boolean {
  return /^-?\d+(\.\d+)?$/.test(value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
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
  private texts: WBWText[] = [];
  private messages: WBWMessage[] = [];
  private background = DEFAULTS.background;
  private color = DEFAULTS.color;
  private shakeTime = 0;
  private shakeMagnitude = 0;

  private inputBindings: Record<string, CommandLine[]> = {};
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
    this.width = options.width;
    this.height = options.height;
    this.fps = options.fps;
    this.resize(options.width, options.height);
  }

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  load(code: string): { errors: WBWError[] } {
    const { program, errors } = parseWBW(code);
    this.program = program;
    this.parseErrors = errors;
    return { errors };
  }

  start() {
    if (!this.program || this.parseErrors.length > 0) {
      return;
    }

    this.resetState();
    this.running = true;
    this.executeLines(this.program.init);
    if (!this.running) {
      return;
    }
    this.attachListeners();
    this.lastTime = 0;
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
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
  }

  getErrors() {
    return this.parseErrors;
  }

  private resetState() {
    this.vars = {};
    this.player = null;
    this.entities = [];
    this.shapes = [];
    this.texts = [];
    this.messages = [];
    this.background = DEFAULTS.background;
    this.color = DEFAULTS.color;
    this.shakeTime = 0;
    this.shakeMagnitude = 0;
    this.inputBindings = {};
    this.labelStack = [];
  }

  private loop = (time: number) => {
    if (!this.running) return;
    const delta = this.lastTime ? (time - this.lastTime) / 1000 : 0;
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

    const speed = this.getNumberVar('SPEED', DEFAULTS.speed);
    const gravity = this.getNumberVar('GRAVITY', DEFAULTS.gravity);

    for (const key of Object.keys(this.inputBindings)) {
      if (this.keys[key]) {
        for (const cmd of this.inputBindings[key]) {
          this.executeCommand(cmd.tokens, cmd.line, { speed, gravity, delta, key });
        }
      }
    }

    if (this.player) {
      const player = this.player;
      player.vy += gravity;
      player.x += player.vx;
      player.y += player.vy;

      let grounded = false;
      for (const shape of this.shapes) {
        if (!shape.solid || shape.kind !== 'rect') continue;
        const rect = {
          x: shape.x,
          y: shape.y,
          w: shape.w || 0,
          h: shape.h || 0,
        };
        const nextBottom = player.y + player.h;
        const withinX = player.x + player.w > rect.x && player.x < rect.x + rect.w;
        if (withinX && nextBottom >= rect.y && player.y < rect.y) {
          player.y = rect.y - player.h;
          player.vy = 0;
          grounded = true;
        }
      }

      if (player.y + player.h >= this.height) {
        player.y = this.height - player.h;
        player.vy = 0;
        grounded = true;
      }

      if (grounded) {
        player.vy = 0;
      }

      player.x = clamp(player.x, 0, this.width - player.w);
    }

    this.entities = this.entities.filter((entity) => {
      entity.x += entity.vx;
      entity.y += entity.vy;
      if (entity.type === 'bullet') {
        return entity.x >= -20 && entity.x <= this.width + 20;
      }
      return true;
    });

    this.handleCollisions();
    this.updateMessages(delta);

    this.prevKeys = { ...this.keys };
  }

  private render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const shakeX = this.shakeTime > 0 ? (Math.random() - 0.5) * this.shakeMagnitude : 0;
    const shakeY = this.shakeTime > 0 ? (Math.random() - 0.5) * this.shakeMagnitude : 0;
    if (this.shakeTime > 0) {
      this.shakeTime = Math.max(0, this.shakeTime - 0.016);
    }

    ctx.save();
    ctx.translate(shakeX, shakeY);

    ctx.fillStyle = this.background;
    ctx.fillRect(0, 0, this.width, this.height);

    for (const shape of this.shapes) {
      ctx.fillStyle = shape.color;
      if (shape.kind === 'rect' && shape.w !== undefined && shape.h !== undefined) {
        ctx.fillRect(shape.x, shape.y, shape.w, shape.h);
      }
      if (shape.kind === 'circle' && shape.r !== undefined) {
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.r, 0, Math.PI * 2);
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
      ctx.font = `${textItem.size}px Arial`;
      ctx.fillText(this.resolveText(textItem.tokens), textItem.x, textItem.y);
    }

    ctx.restore();

    this.renderMessages();
  }

  private resolveText(tokens: string[]): string {
    if (tokens.length === 0) return '';
    if (tokens.length === 1) {
      const token = tokens[0];
      if (this.vars[token] !== undefined) {
        return String(this.vars[token]);
      }
      return token;
    }
    return tokens.join(' ');
  }

  private updateMessages(delta: number) {
    this.messages = this.messages
      .map((msg) => ({ ...msg, timeLeft: msg.timeLeft - delta }))
      .filter((msg) => msg.timeLeft > 0);
  }

  private renderMessages() {
    if (this.messages.length === 0) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const top = 16;
    this.messages.forEach((msg, index) => {
      ctx.fillText(msg.text, this.width / 2, top + index * 20);
    });
    ctx.restore();
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

  private executeLines(lines: CommandLine[]) {
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      const command = line.tokens[0].toLowerCase();
      if (command === 'loop') {
        const count = Math.max(0, Math.floor(this.getNumberValue(line.tokens[1])));
        const { block, endIndex } = this.collectLoopBlock(lines, i + 1);
        for (let loopIndex = 0; loopIndex < count; loopIndex += 1) {
          this.executeLines(block);
        }
        i = endIndex;
        continue;
      }

      if (command === 'end') {
        continue;
      }

      this.executeCommand(line.tokens, line.line);
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
      const cmd = lines[i].tokens[0].toLowerCase();
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

  private executeCommand(tokens: string[], lineNumber: number, context?: { speed: number; gravity: number; delta: number; key: string }) {
    const command = tokens[0].toLowerCase();

    switch (command) {
      case 'player': {
        const x = this.getNumberValue(tokens[1]);
        const y = this.getNumberValue(tokens[2]);
        const w = tokens[3] ? this.getNumberValue(tokens[3]) : DEFAULTS.playerSize;
        const h = tokens[4] ? this.getNumberValue(tokens[4]) : DEFAULTS.playerSize;
        this.player = {
          id: 'player',
          type: 'player',
          x,
          y,
          w,
          h,
          vx: 0,
          vy: 0,
          color: this.color,
        };
        break;
      }
      case 'spawn': {
        const type = (tokens[1] || 'custom').toLowerCase();
        let index = 2;
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
          id: `${type}-${Date.now()}-${Math.random()}`,
          type: type === 'enemy' || type === 'item' ? (type as WBWEntity['type']) : 'custom',
          x: xResult.value,
          y: yResult.value,
          w,
          h,
          vx: 0,
          vy: 0,
          color,
        });
        break;
      }
      case 'set': {
        const name = tokens[1];
        if (!name) break;
        const value = tokens[2] !== undefined ? this.getValue(tokens[2]) : 0;
        this.vars[name] = value;
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
      case 'bg': {
        this.background = tokens[1] || DEFAULTS.background;
        break;
      }
      case 'color': {
        this.color = tokens[1] || DEFAULTS.color;
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
          size: 14,
        });
        break;
      }
      case 'on': {
        const key = tokens[1];
        if (!key) break;
        const action = tokens.slice(2);
        const normalized = normalizeKey(key);
        if (!this.inputBindings[normalized]) {
          this.inputBindings[normalized] = [];
        }
        this.inputBindings[normalized].push({ tokens: action, line: lineNumber, raw: tokens.join(' ') });
        break;
      }
      case 'move': {
        if (!this.player) break;
        const speed = context?.speed ?? this.getNumberVar('SPEED', DEFAULTS.speed);
        const dx = this.getNumberValue(tokens[1]);
        const dy = this.getNumberValue(tokens[2]);
        this.player.x += dx * speed;
        this.player.y += dy * speed;
        break;
      }
      case 'jump': {
        if (!this.player) break;
        const force = this.getNumberValue(tokens[1] || '8');
        if (this.player.vy === 0) {
          this.player.vy = -force;
        }
        break;
      }
      case 'shoot': {
        if (!this.player) break;
        const dir = this.getNumberValue(tokens[1] || '1');
        const bullet = {
          id: `bullet-${Date.now()}-${Math.random()}`,
          type: 'bullet' as const,
          x: this.player.x + this.player.w / 2,
          y: this.player.y + this.player.h / 2,
          w: DEFAULTS.bulletSize.w,
          h: DEFAULTS.bulletSize.h,
          vx: dir >= 0 ? 6 : -6,
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
            this.runLabel(label);
          }
          break;
        }

        let leftToken = tokens[1];
        let op = '==';
        let rightToken = tokens[2];
        if (gotoIndex >= 4) {
          op = tokens[2];
          rightToken = tokens[3];
        }

        const leftVal = this.getValue(leftToken);
        const rightVal = this.getValue(rightToken);
        const result = this.compareValues(leftVal, rightVal, op);
        if (result) {
          this.runLabel(label);
        }
        break;
      }
      case 'goto': {
        const label = tokens[1];
        if (label) this.runLabel(label);
        break;
      }
      case 'msg': {
        const text = tokens.slice(1).join(' ') || 'Message';
        this.messages.push({ text, timeLeft: 2 });
        break;
      }
      case 'sound': {
        if (this.muted) break;
        break;
      }
      case 'shake': {
        const amount = this.getNumberValue(tokens[1] || '6');
        this.shakeMagnitude = amount;
        this.shakeTime = 0.2;
        break;
      }
      case 'stop':
      case 'exit': {
        this.running = false;
        break;
      }
      default: {
        if (tokens[0].endsWith(':')) break;
        this.parseErrors.push({ line: lineNumber, message: `Unknown command: ${tokens[0]}` });
        break;
      }
    }
  }

  private runLabel(label: string) {
    if (!this.program || !this.program.labels[label]) return;
    if (this.labelStack.includes(label)) return;
    if (this.labelStack.length > 8) return;
    this.labelStack.push(label);
    this.executeLines(this.program.labels[label]);
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
      default:
        return a === b;
    }
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
    if (this.vars[token] !== undefined) return this.vars[token];
    if (isNumber(token)) return Number(token);
    return token;
  }

  private getNumberValue(token: string | undefined): number {
    if (!token) return 0;
    if (token.toLowerCase() === 'rand') return Math.random();
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

  private attachListeners() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  private detachListeners() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    const key = normalizeKey(event.key);
    this.keys[key] = true;
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    const key = normalizeKey(event.key);
    this.keys[key] = false;
  };
}

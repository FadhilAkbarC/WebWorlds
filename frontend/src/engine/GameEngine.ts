interface GameEngineOptions {
  width: number;
  height: number;
  fps: number;
}

interface GameUpdateCallback {
  (deltaTime: number, input: InputState): void;
}

interface GameRenderCallback {
  (ctx: CanvasRenderingContext2D): void;
}

interface InputState {
  keys: Record<string, boolean>;
  mouseX: number;
  mouseY: number;
  isMouseDown: boolean;
}

/**
 * Ultra-lightweight 2D game engine
 * Optimized for weak devices, ~30KB gzipped
 */
export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: GameEngineOptions;
  private isRunning = false;
  private lastFrameTime = 0;
  private frameCount = 0;
  private fps = 0;
  private updateCallbacks: GameUpdateCallback[] = [];
  private renderCallbacks: GameRenderCallback[] = [];
  private input: InputState = {
    keys: {},
    mouseX: 0,
    mouseY: 0,
    isMouseDown: false,
  };

  constructor(canvas: HTMLCanvasElement, options: GameEngineOptions) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.options = options;

    // Set canvas size
    this.canvas.width = options.width;
    this.canvas.height = options.height;

    // Setup input handlers
    this.setupInputHandlers();
  }

  private setupInputHandlers() {
    // Keyboard events
    document.addEventListener('keydown', (e) => {
      this.input.keys[e.key.toLowerCase()] = true;
    });

    document.addEventListener('keyup', (e) => {
      this.input.keys[e.key.toLowerCase()] = false;
    });

    // Mouse events
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.input.mouseX = e.clientX - rect.left;
      this.input.mouseY = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mousedown', () => {
      this.input.isMouseDown = true;
    });

    this.canvas.addEventListener('mouseup', () => {
      this.input.isMouseDown = false;
    });

    // Touch events for mobile
    this.canvas.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.input.mouseX = touch.clientX - rect.left;
      this.input.mouseY = touch.clientY - rect.top;
      this.input.isMouseDown = true;
    });

    this.canvas.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.input.mouseX = touch.clientX - rect.left;
      this.input.mouseY = touch.clientY - rect.top;
    });

    this.canvas.addEventListener('touchend', () => {
      this.input.isMouseDown = false;
    });
  }

  public onUpdate(callback: GameUpdateCallback) {
    this.updateCallbacks.push(callback);
  }

  public onRender(callback: GameRenderCallback) {
    this.renderCallbacks.push(callback);
  }

  public getInput(): InputState {
    return { ...this.input };
  }

  public drawRect(x: number, y: number, width: number, height: number, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }

  public drawCircle(x: number, y: number, radius: number, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  public drawText(text: string, x: number, y: number, options?: {
    font?: string;
    color?: string;
    align?: CanvasTextAlign;
    baseline?: CanvasTextBaseline;
  }) {
    this.ctx.fillStyle = options?.color || '#000';
    this.ctx.font = options?.font || '16px Arial';
    this.ctx.textAlign = options?.align || 'left';
    this.ctx.textBaseline = options?.baseline || 'top';
    this.ctx.fillText(text, x, y);
  }

  public drawImage(image: HTMLImageElement, x: number, y: number, width?: number, height?: number) {
    if (width && height) {
      this.ctx.drawImage(image, x, y, width, height);
    } else {
      this.ctx.drawImage(image, x, y);
    }
  }

  public clearCanvas(color: string = '#fff') {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public isKeyPressed(key: string): boolean {
    return this.input.keys[key.toLowerCase()] || false;
  }

  public getWidth(): number {
    return this.options.width;
  }

  public getHeight(): number {
    return this.options.height;
  }

  public getFPS(): number {
    return this.fps;
  }

  private gameLoop = (currentTime: number) => {
    if (!this.isRunning) return;

    if (!this.lastFrameTime) this.lastFrameTime = currentTime;
    const deltaTime = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;

    // Frame rate limiter
    const targetFrameTime = 1 / this.options.fps;
    if (deltaTime < targetFrameTime) {
      requestAnimationFrame(this.gameLoop);
      return;
    }

    // Update FPS counter
    this.frameCount++;
    if (currentTime % 1000 < 16) {
      this.fps = this.frameCount;
      this.frameCount = 0;
    }

    // Clear canvas
    this.clearCanvas();

    // Call update callbacks
    for (const callback of this.updateCallbacks) {
      callback(deltaTime, this.input);
    }

    // Call render callbacks
    for (const callback of this.renderCallbacks) {
      callback(this.ctx);
    }

    this.lastFrameTime = currentTime;
    requestAnimationFrame(this.gameLoop);
  };

  public start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastFrameTime = 0;
      requestAnimationFrame(this.gameLoop);
    }
  }

  public stop() {
    this.isRunning = false;
  }

  public resize(width: number, height: number) {
    this.options.width = width;
    this.options.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
  }
}

import { useRef, useEffect, useState, useCallback } from "react";

const WIDTH = 400;
const HEIGHT = 600;
const GRAVITY = 0.45;
const FLAP_VELOCITY = -8;
const PIPE_WIDTH = 62;
const PIPE_GAP = 155;
const PIPE_SPEED = 2.6;
const PIPE_SPACING = 220;
const BIRD_X = 90;
const BIRD_SIZE = 22;

const COLORS = {
  skyTop: "#2b1f4a",
  skyBottom: "#7c3f6b",
  sun: "#ffb347",
  pipe: "#3ecf8e",
  pipeDark: "#2ba36c",
  bird: "#ffd23f",
  birdWing: "#ff9f1c",
  ground: "#3a2a52",
  text: "#fdf6ec",
};

type Pipe = { x: number; gapY: number; scored?: boolean };

type GameState = {
  birdY: number;
  velocity: number;
  pipes: Pipe[];
  frame: number;
  currentScore: number;
};

type Phase = "ready" | "playing" | "over";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const gameRef = useRef<GameState | null>(null);

  const [phase, setPhase] = useState<Phase>("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  const initGame = useCallback(() => {
    gameRef.current = {
      birdY: HEIGHT / 2,
      velocity: 0,
      pipes: [
        { x: WIDTH + 100, gapY: 220 },
        { x: WIDTH + 100 + PIPE_SPACING, gapY: 320 },
        { x: WIDTH + 100 + PIPE_SPACING * 2, gapY: 260 },
      ],
      frame: 0,
      currentScore: 0,
    };
  }, []);

  const flap = useCallback(() => {
    setPhase((p) => {
      if (p === "ready") {
        initGame();
        gameRef.current!.velocity = FLAP_VELOCITY;
        return "playing";
      }
      if (p === "playing") {
        gameRef.current!.velocity = FLAP_VELOCITY;
        return "playing";
      }
      if (p === "over") {
        initGame();
        setScore(0);
        return "ready";
      }
      return p;
    });
  }, [initGame]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flap]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const g = gameRef.current;

      if (phase === "playing" && g) {
        g.velocity += GRAVITY;
        g.birdY += g.velocity;
        g.frame++;

        for (const pipe of g.pipes) {
          pipe.x -= PIPE_SPEED;
        }

        for (const pipe of g.pipes) {
          if (pipe.x + PIPE_WIDTH < 0) {
            pipe.x += PIPE_SPACING * g.pipes.length;
            pipe.gapY = 130 + Math.random() * (HEIGHT - 260);
            pipe.scored = false;
          }
          if (!pipe.scored && pipe.x + PIPE_WIDTH < BIRD_X) {
            pipe.scored = true;
            g.currentScore++;
            setScore(g.currentScore);
          }
        }

        const hitBounds =
          g.birdY + BIRD_SIZE / 2 > HEIGHT - 20 || g.birdY - BIRD_SIZE / 2 < 0;

        let hitPipe = false;
        for (const pipe of g.pipes) {
          const withinX =
            BIRD_X + BIRD_SIZE / 2 > pipe.x &&
            BIRD_X - BIRD_SIZE / 2 < pipe.x + PIPE_WIDTH;
          if (withinX) {
            const withinGap =
              g.birdY - BIRD_SIZE / 2 > pipe.gapY &&
              g.birdY + BIRD_SIZE / 2 < pipe.gapY + PIPE_GAP;
            if (!withinGap) hitPipe = true;
          }
        }

        if (hitBounds || hitPipe) {
          setPhase("over");
          setBest((b) => Math.max(b, g.currentScore));
        }
      }

      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      const skyGrad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      skyGrad.addColorStop(0, COLORS.skyTop);
      skyGrad.addColorStop(1, COLORS.skyBottom);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.fillStyle = COLORS.sun;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(320, 90, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      if (g) {
        for (const pipe of g.pipes) {
          ctx.fillStyle = COLORS.pipe;
          ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);
          ctx.fillRect(
            pipe.x,
            pipe.gapY + PIPE_GAP,
            PIPE_WIDTH,
            HEIGHT - (pipe.gapY + PIPE_GAP),
          );
          ctx.fillStyle = COLORS.pipeDark;
          ctx.fillRect(pipe.x - 4, pipe.gapY - 18, PIPE_WIDTH + 8, 18);
          ctx.fillRect(pipe.x - 4, pipe.gapY + PIPE_GAP, PIPE_WIDTH + 8, 18);
        }
      }

      ctx.fillStyle = COLORS.ground;
      ctx.fillRect(0, HEIGHT - 20, WIDTH, 20);

      const birdY = g ? g.birdY : HEIGHT / 2;
      const rotation = g ? Math.max(-0.5, Math.min(0.9, g.velocity * 0.06)) : 0;
      ctx.save();
      ctx.translate(BIRD_X, birdY);
      ctx.rotate(rotation);
      ctx.fillStyle = COLORS.bird;
      ctx.beginPath();
      ctx.arc(0, 0, BIRD_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = COLORS.birdWing;
      ctx.beginPath();
      ctx.ellipse(-4, 2, 8, 5, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#2b1f2f";
      ctx.beginPath();
      ctx.arc(6, -4, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = COLORS.text;
      ctx.font = "bold 28px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(String(g ? g.currentScore : 0), WIDTH / 2, 60);

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        fontFamily: "system-ui, sans-serif",
        userSelect: "none",
      }}
    >
      <div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          onClick={flap}
          onTouchStart={(e) => {
            e.preventDefault();
            flap();
          }}
          style={{
            borderRadius: 12,
            boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
            cursor: "pointer",
            touchAction: "none",
          }}
        />
        {phase !== "playing" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              color: "#fdf6ec",
              textShadow: "0 2px 8px rgba(0,0,0,0.6)",
              pointerEvents: "none",
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 800 }}>
              {phase === "ready" ? "Flappy Bird" : "Fim de jogo"}
            </div>
            {phase === "over" && (
              <div style={{ fontSize: 16 }}>
                Pontuação: {score} · Recorde: {best}
              </div>
            )}
            <div style={{ fontSize: 14, opacity: 0.85 }}>
              Clique, toque ou pressione espaço
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

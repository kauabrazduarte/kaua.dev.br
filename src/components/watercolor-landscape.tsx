"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

const W = 900;
const H = 320;

type Scene = {
  sky: [string, string, string];
  sun: string;
  far: string;
  middle: string;
  near: string;
  water: string;
  sunX: number;
  sunY: number;
  peaks: number[];
};

const DAWN: Scene = {
  sky: ["#193955", "#b96d72", "#f3b76e"],
  sun: "#fff2ba",
  far: "#a18e9a",
  middle: "#3c6384",
  near: "#173c55",
  water: "#8d9fa5",
  sunX: 595,
  sunY: 91,
  peaks: [214, 184, 205, 112, 167, 89, 159, 124, 208],
};
const PAINTING_COUNT = 4;

function random(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

type Mark = (ctx: CanvasRenderingContext2D) => void;

function paintDawn(scene: Scene, seed: number): Mark[] {
  const rng = random(seed);
  const marks: Mark[] = [];
  const dab = (x: number, y: number, rx: number, ry: number, color: string, alpha: number, rotation = 0) => {
    marks.push((ctx) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  };

  marks.push((ctx) => {
    const sky = ctx.createLinearGradient(0, 0, 0, 255);
    sky.addColorStop(0, scene.sky[0]);
    sky.addColorStop(0.52, scene.sky[1]);
    sky.addColorStop(1, scene.sky[2]);
    ctx.save();
    ctx.globalAlpha = 0.54;
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, 255);
    ctx.restore();
  });

  // Dilute, overlapping washes form the sky. The narrow translucent marks
  // leave the paper visible, unlike a flat gradient or a prerendered image.
  for (let layer = 0; layer < 3; layer++) {
    const top = layer === 0 ? 0 : layer === 1 ? 80 : 165;
    const bottom = layer === 0 ? 135 : layer === 1 ? 225 : 280;
    for (let i = 0; i < 175; i++) {
      dab(rng() * W, top + rng() * (bottom - top), 20 + rng() * 80, 6 + rng() * 17, scene.sky[layer], 0.045 + rng() * 0.04, (rng() - 0.5) * 0.13);
    }
  }

  // The rising sun is built out of transparent pigment rings and a paper core.
  for (let i = 0; i < 90; i++) {
    const angle = rng() * Math.PI * 2;
    const radius = Math.sqrt(rng()) * 105;
    dab(scene.sunX + Math.cos(angle) * radius, scene.sunY + Math.sin(angle) * radius, 7 + rng() * 25, 5 + rng() * 17, scene.sun, 0.018 + rng() * 0.05);
  }
  for (let i = 0; i < 38; i++) {
    const angle = rng() * Math.PI * 2;
    const radius = Math.sqrt(rng()) * 27;
    dab(scene.sunX + Math.cos(angle) * radius, scene.sunY + Math.sin(angle) * radius, 10 + rng() * 14, 8 + rng() * 11, scene.sun, 0.09);
  }
  marks.push((ctx) => {
    const glow = ctx.createRadialGradient(scene.sunX, scene.sunY, 4, scene.sunX, scene.sunY, 68);
    glow.addColorStop(0, "rgba(255,250,216,.94)");
    glow.addColorStop(0.26, "rgba(255,235,174,.72)");
    glow.addColorStop(0.55, "rgba(255,205,139,.25)");
    glow.addColorStop(1, "rgba(255,205,139,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(scene.sunX - 70, scene.sunY - 70, 140, 140);
  });

  const mountain = (base: number, peaks: number[], fill: string, pigment: string, amount: number) => {
    const points = peaks.map((y, i) => [i * W / (peaks.length - 1), y] as const);
    const path = (ctx: CanvasRenderingContext2D) => {
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
      ctx.lineTo(W, H);
      ctx.closePath();
    };
    marks.push((ctx) => { ctx.save(); ctx.globalAlpha = 0.76; ctx.fillStyle = fill; path(ctx); ctx.fill(); ctx.restore(); });
    for (let i = 0; i < amount; i++) {
      const x = rng() * W;
      const y = base - 40 + rng() * 145;
      const width = 9 + rng() * 45;
      const height = 2 + rng() * 12;
      const alpha = 0.025 + rng() * 0.085;
      marks.push((ctx) => {
        ctx.save();
        path(ctx);
        ctx.clip();
        ctx.translate(x, y);
        ctx.rotate(-0.1 + rng() * 0.15);
        ctx.fillStyle = pigment;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.ellipse(0, 0, width, height, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }
  };

  mountain(190, scene.peaks.map((p, i) => p + 24 + Math.sin(i * 2.6) * 12), scene.far, "#f5e8d8", 100);
  mountain(230, scene.peaks.map((p, i) => p + 38 + Math.sin(i * 3.7 + 2) * 42), scene.middle, "#d7bbc0", 130);

  // Broken chalky strokes catch morning light on the steep ridges.
  const ridges: [number, number, number, number][] = [
    [88, 197, 113, 174], [235, 214, 337, 155], [337, 155, 394, 188],
    [475, 189, 562, 138], [562, 138, 609, 174], [677, 206, 765, 164],
  ];
  for (const [x1, y1, x2, y2] of ridges) {
    for (let i = 0; i < 14; i++) {
      const start = rng() * 0.82;
      const length = 0.04 + rng() * 0.19;
      marks.push((ctx) => {
        ctx.save();
        ctx.strokeStyle = "#f3ddd3";
        ctx.globalAlpha = 0.05 + rng() * 0.16;
        ctx.lineWidth = 0.6 + rng() * 2.8;
        ctx.beginPath();
        ctx.moveTo(x1 + (x2 - x1) * start, y1 + (y2 - y1) * start + rng() * 3);
        ctx.lineTo(x1 + (x2 - x1) * (start + length), y1 + (y2 - y1) * (start + length) + rng() * 3);
        ctx.stroke();
        ctx.restore();
      });
    }
  }

  // A thin reflective lake separates the distant range from the dark bank.
  marks.push((ctx) => { ctx.save(); ctx.globalAlpha = 0.72; ctx.fillStyle = scene.water; ctx.fillRect(0, 249, W, 71); ctx.restore(); });
  for (let i = 0; i < 155; i++) {
    const y = 252 + rng() * 65;
    const x = rng() * W;
    dab(x, y, 6 + rng() * (y < 280 ? 35 : 57), 0.5 + rng() * 2.2, rng() > 0.45 ? scene.sun : scene.middle, 0.08 + rng() * 0.16);
  }
  for (let i = 0; i < 45; i++) {
    const y = 254 + rng() * 63;
    dab(scene.sunX + (rng() - 0.5) * (y - 230) * 2.4, y, 5 + rng() * 20, 0.8 + rng(), scene.sun, 0.17);
  }

  mountain(295, [315, 305, 319, 296, 310, 302, 316, 300, 315], scene.near, scene.middle, 100);
  for (let i = 0; i < 100; i++) {
    dab(rng() * W, 307 + rng() * 17, 3 + rng() * 22, 1 + rng() * 4, scene.near, 0.09 + rng() * 0.14);
  }
  return marks;
}

function brushKit(seed: number) {
  const rng = random(seed);
  const marks: Mark[] = [];
  const add = (mark: Mark) => marks.push(mark);
  const dab = (x: number, y: number, rx: number, ry: number, color: string, alpha: number, angle = 0) => {
    add((ctx) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  };
  const polygon = (points: [number, number][], color: string, alpha = 1) => {
    add((ctx) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(...points[0]);
      points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
  };
  const line = (points: [number, number][], color: string, width: number, alpha = 1) => {
    add((ctx) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(...points[0]);
      points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.stroke();
      ctx.restore();
    });
  };
  const wash = (stops: [string, string, string]) => {
    add((ctx) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, H);
      gradient.addColorStop(0, stops[0]);
      gradient.addColorStop(0.55, stops[1]);
      gradient.addColorStop(1, stops[2]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, W, H);
    });
  };
  return { rng, marks, add, dab, polygon, line, wash };
}

function paintFox(_scene: Scene, seed: number): Mark[] {
  const { rng, marks, add, dab, polygon, line, wash } = brushKit(seed);
  wash(["#aebdcc", "#d9dfe3", "#e9ece9"]);
  for (let i = 0; i < 240; i++) {
    dab(rng() * W, rng() * 228, 20 + rng() * 75, 5 + rng() * 17,
      rng() > 0.5 ? "#f7f5f0" : "#718aa3", 0.02 + rng() * 0.045);
  }
  // The single distant summit owns most of the empty, cold composition.
  polygon([[0, 240], [90, 181], [160, 190], [322, 64], [440, 173], [528, 128], [682, 226], [900, 226], [900, 320], [0, 320]], "#899fb1", 0.84);
  polygon([[160, 190], [322, 64], [440, 173], [384, 137], [357, 151], [322, 108], [285, 145], [250, 134]], "#f6f7f2", 0.92);
  polygon([[322, 64], [440, 173], [384, 137], [357, 151], [322, 108]], "#d5e1e6", 0.63);
  polygon([[460, 217], [528, 128], [682, 226]], "#c7d7df", 0.75);
  for (let i = 0; i < 210; i++) {
    const x = rng() * W;
    const y = 140 + rng() * 95;
    dab(x, y, 4 + rng() * 28, 1 + rng() * 5, rng() > 0.4 ? "#edf2ef" : "#597b98", 0.025 + rng() * 0.08, -0.18);
  }
  polygon([[0, 234], [85, 220], [203, 233], [347, 218], [492, 236], [638, 214], [790, 231], [900, 217], [900, 320], [0, 320]], "#edf0ed", 0.97);
  for (let i = 0; i < 270; i++) {
    dab(rng() * W, 234 + rng() * 90, 5 + rng() * 37, 0.8 + rng() * 4,
      rng() > 0.42 ? "#f9f9f3" : "#9eb3c2", 0.05 + rng() * 0.1);
  }
  for (let i = 0; i < 75; i++) {
    const x = rng() * W;
    const y = rng() * 290;
    dab(x, y, 0.7 + rng() * 2.3, 0.7 + rng() * 2.3, "#ffffff", 0.33 + rng() * 0.45);
  }

  // A small fox, painted last, gives the wide winter landscape its quiet scale.
  const foxStart = marks.length;
  const orange = "#c45b32";
  polygon([[478, 264], [515, 247], [543, 259], [558, 276], [533, 288], [491, 284]], orange, 0.9);
  add((ctx) => {
    ctx.save();
    ctx.fillStyle = "#bd542f";
    ctx.beginPath();
    ctx.moveTo(535, 270);
    ctx.bezierCurveTo(584, 246, 601, 261, 576, 283);
    ctx.bezierCurveTo(562, 296, 546, 293, 528, 284);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
  polygon([[579, 275], [589, 268], [584, 282], [566, 290], [552, 289]], "#f5eee1", 0.93);
  polygon([[458, 269], [443, 241], [453, 222], [469, 229], [486, 222], [499, 244], [489, 269]], orange);
  polygon([[451, 232], [451, 209], [468, 226]], "#98432d");
  polygon([[476, 226], [489, 208], [493, 238]], "#98432d");
  polygon([[447, 244], [420, 249], [448, 262]], "#cf6538");
  polygon([[429, 253], [449, 249], [458, 261]], "#f5eee1");
  polygon([[468, 256], [481, 272], [491, 277], [479, 280]], "#f8eee1");
  line([[489, 278], [484, 299]], "#433c42", 3.5);
  line([[525, 282], [524, 299]], "#433c42", 3.5);
  line([[447, 252], [441, 252]], "#302f36", 2);
  dab(462, 247, 1.7, 1.7, "#242830", 0.98);
  line([[399, 302], [613, 302]], "#aeb9bd", 1.5, 0.38);
  // A distant, slightly elevated side view: details merge into a tiny mark.
  for (let i = foxStart; i < marks.length; i++) {
    const mark = marks[i];
    marks[i] = (ctx) => {
      ctx.save();
      ctx.translate(560, 252);
      ctx.scale(0.38, 0.38);
      ctx.translate(-500, -260);
      mark(ctx);
      ctx.restore();
    };
  }
  return marks;
}

function paintGalaxy(_scene: Scene, seed: number): Mark[] {
  const { rng, marks, add, dab, line, wash } = brushKit(seed);
  wash(["#10162f", "#252148", "#081d37"]);
  for (let i = 0; i < 230; i++) {
    const x = rng() * W;
    const y = rng() * H;
    dab(x, y, 12 + rng() * 57, 4 + rng() * 18,
      ["#302b65", "#493672", "#1d5078"][Math.floor(rng() * 3)], 0.02 + rng() * 0.07, -0.32);
  }
  // A tilted luminous disk: transparent swirls and star dust, all drawn live.
  add((ctx) => {
    const glow = ctx.createRadialGradient(463, 154, 7, 463, 154, 180);
    glow.addColorStop(0, "rgba(255,243,214,.87)");
    glow.addColorStop(0.2, "rgba(223,164,208,.38)");
    glow.addColorStop(0.65, "rgba(82,82,166,.13)");
    glow.addColorStop(1, "rgba(50,70,150,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(270, 0, 390, 320);
  });
  for (let i = 0; i < 520; i++) {
    const angle = rng() * Math.PI * 2;
    const radius = Math.pow(rng(), 0.72) * 340;
    const arm = angle + radius * 0.017;
    const x = 463 + Math.cos(arm) * radius;
    const y = 154 + Math.sin(arm) * radius * 0.34 - (x - 463) * 0.25;
    const color = ["#a8bce7", "#e8b8d4", "#759ecb", "#f4e4d4"][Math.floor(rng() * 4)];
    dab(x, y, 2 + rng() * 19, 1 + rng() * 7, color, 0.035 + rng() * 0.13, -0.22);
  }
  for (let i = 0; i < 230; i++) {
    const x = rng() * W;
    const y = rng() * H;
    const size = rng() > 0.94 ? 2 + rng() * 2.5 : 0.5 + rng() * 1.25;
    dab(x, y, size, size, "#fff4e5", 0.25 + rng() * 0.65);
    if (size > 2.5) {
      line([[x - size * 2, y], [x + size * 2, y]], "#d9e8ff", 0.7, 0.4);
      line([[x, y - size * 2], [x, y + size * 2]], "#d9e8ff", 0.7, 0.4);
    }
  }
  for (let i = 0; i < 65; i++) {
    const angle = rng() * Math.PI * 2;
    const radius = rng() * 58;
    dab(463 + Math.cos(angle) * radius, 154 + Math.sin(angle) * radius * 0.4,
      1 + rng() * 4, 1 + rng() * 3, "#fff0d6", 0.12 + rng() * 0.35);
  }
  return marks;
}

function paintReflection(_scene: Scene, seed: number): Mark[] {
  const { rng, marks, dab, polygon, line, wash } = brushKit(seed);
  // Wide blue sky and a pale break at the horizon, following the reference's
  // strong negative space above the scarlet diagonal field.
  wash(["#1c356c", "#5077b2", "#e8e9ed"]);
  polygon([[0, 0], [900, 0], [900, 40], [760, 30], [650, 55], [490, 48], [350, 79], [190, 66], [0, 93]], "#223a72", 0.48);
  for (let i = 0; i < 340; i++) {
    const x = rng() * W;
    const y = 47 + rng() * 159;
    const bright = y > 112 || x > 540;
    dab(x, y, 14 + rng() * 68, 3 + rng() * 13,
      bright ? (rng() > 0.43 ? "#d9e7f1" : "#a3c4e3") : "#385b95",
      0.018 + rng() * 0.065, -0.1 - rng() * 0.1);
  }
  for (let i = 0; i < 80; i++) {
    const x = rng() * W;
    const y = 211 + rng() * 37;
    dab(x, y, 16 + rng() * 70, 2 + rng() * 8, "#f5eee8", 0.025 + rng() * 0.07, -0.08);
  }

  // Tall, abandoned machines frame a tiny human figure. Their silhouettes
  // echo the supplied frame without using a prerendered image or character.
  polygon([[765, 238], [786, 231], [610, 6], [594, 14]], "#a17785", 0.84);
  polygon([[760, 233], [772, 230], [605, 13], [599, 19]], "#ddbac2", 0.86);
  line([[594, 14], [606, 7]], "#3e354a", 5, 0.9);
  line([[602, 13], [596, 2]], "#742e49", 4, 0.8);
  polygon([[210, 264], [228, 263], [318, 145], [309, 138]], "#693e55", 0.86);
  line([[307, 144], [319, 143]], "#342c42", 4, 0.8);

  const fieldY = (x: number) => 282 - x * 0.075;
  polygon([[0, fieldY(0)], [900, fieldY(900)], [900, 320], [0, 320]], "#b91337");
  for (let i = 0; i < 540; i++) {
    const x = rng() * W;
    const y = fieldY(x) + rng() * (H - fieldY(x));
    dab(x, y, 2 + rng() * 15, 1 + rng() * 5,
      ["#e92945", "#fa624e", "#8d1537", "#f08b65"][Math.floor(rng() * 4)],
      0.07 + rng() * 0.23, -0.08);
  }
  line([[0, fieldY(0)], [900, fieldY(900)]], "#f05162", 3, 0.7);

  // Left wreck: low tripod and an exposed joint.
  polygon([[143, 275], [180, 245], [257, 242], [292, 272]], "#4e2e45", 0.84);
  line([[177, 257], [145, 282]], "#332b3f", 6, 0.86);
  line([[247, 252], [278, 269]], "#332b3f", 5, 0.86);
  dab(222, 247, 13, 13, "#694357", 0.87);
  dab(222, 247, 5, 5, "#342c42", 0.82);

  // Right wreck: angled armor, pivot, bolts and the dark recess under it.
  polygon([[676, 223], [729, 173], [805, 160], [893, 219], [900, 248], [737, 255]], "#4d344c", 0.84);
  polygon([[711, 198], [752, 133], [792, 156], [777, 213]], "#af8292", 0.86);
  polygon([[789, 143], [839, 164], [870, 225], [804, 223]], "#805669", 0.94);
  polygon([[698, 214], [725, 194], [760, 231], [736, 246]], "#c09aa5", 0.8);
  polygon([[746, 243], [824, 221], [887, 233], [877, 256]], "#2f3045", 0.9);
  dab(795, 205, 22, 22, "#594052", 0.95);
  dab(795, 205, 9, 9, "#ac7f8d", 0.83);
  for (let i = 0; i < 24; i++) {
    const x = 735 + rng() * 135;
    const y = 174 + rng() * 62;
    dab(x, y, 1 + rng() * 2.8, 1 + rng() * 2.8,
      rng() > 0.5 ? "#d7aeb1" : "#402e45", 0.45 + rng() * 0.42);
  }

  // Lone observer facing the empty sky, small enough to read as a memory.
  dab(449, 188, 7, 8, "#3a3345", 0.95);
  polygon([[442, 197], [454, 196], [462, 229], [439, 231]], "#843f51", 0.96);
  polygon([[440, 228], [461, 228], [457, 246], [440, 245]], "#5d394c", 0.96);
  line([[444, 243], [441, 255]], "#2f3041", 4, 0.95);
  line([[456, 243], [459, 255]], "#2f3041", 4, 0.95);
  line([[442, 204], [431, 196], [434, 189]], "#4c3447", 4, 0.9);
  line([[458, 203], [461, 226]], "#4c3447", 3, 0.9);
  line([[441, 256], [459, 256]], "#352f40", 2, 0.65);

  for (let i = 0; i < 28; i++) {
    const x = rng() * W;
    const y = 105 + rng() * 150;
    dab(x, y, 1.3 + rng() * 3.2, 0.8 + rng() * 2.2,
      rng() > 0.5 ? "#a7243e" : "#de3650", 0.4 + rng() * 0.48, rng() * 0.8);
  }
  return marks;
}

export function WatercolorLandscape() {
  const t = useTranslations("hero");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#f3eee4";
    ctx.fillRect(0, 0, W, H);

    const marks = [paintDawn, paintFox, paintGalaxy, paintReflection][index](DAWN, 1249 + index * 73);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      marks.forEach((mark) => mark(ctx));
      return;
    }
    let frame = 0;
    let cursor = 0;
    const render = () => {
      const end = Math.min(cursor + 8, marks.length);
      while (cursor < end) marks[cursor++](ctx);
      if (cursor < marks.length) frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [index]);

  return (
    <div className="relative overflow-hidden bg-[#f3eee4] shadow-[0_14px_55px_-35px_rgba(26,42,61,.7)]">
      <button
        type="button"
        onClick={() => setIndex((current) => (current + 1) % PAINTING_COUNT)}
        className="block w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-ring"
        aria-label={`${t("paintingAction")}: ${t(`paintings.${index}`)}`}
      >
        <canvas ref={canvasRef} width={W} height={H} className="block aspect-[900/320] w-full" aria-hidden="true" />
        <span className="absolute bottom-3 right-3 rounded-sm bg-background/85 px-2.5 py-1 font-mono text-[10px] text-foreground shadow-sm backdrop-blur-sm sm:bottom-4 sm:right-4">
          {String(index + 1).padStart(2, "0")} / {String(PAINTING_COUNT).padStart(2, "0")} · {t(`paintings.${index}`)} ↗
        </span>
      </button>
    </div>
  );
}

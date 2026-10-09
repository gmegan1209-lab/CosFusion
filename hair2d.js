/* 2D wig: user paints a hair mask, then the cutout is pasted onto the live face. */
(function (root) {
  "use strict";

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function distC(a, b) { return Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b); }
  function perc(arr, p) {
    if (!arr.length) return 0;
    const a = arr.slice().sort(function (x, y) { return x - y; });
    const i = (a.length - 1) * p;
    const lo = Math.floor(i), hi = Math.ceil(i);
    if (lo === hi) return a[lo];
    return a[lo] * (hi - i) + a[hi] * (i - lo);
  }
  function medianC(list) {
    if (!list.length) return { r: 80, g: 56, b: 40 };
    return {
      r: perc(list.map(function (p) { return p.r; }), 0.5),
      g: perc(list.map(function (p) { return p.g; }), 0.5),
      b: perc(list.map(function (p) { return p.b; }), 0.5)
    };
  }
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    const d = max - min;
    if (d) {
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
    }
    return { h: h, s: s, l: l };
  }
  function isFaceSkin(p) {
    if (p.a < 40) return false;
    const hsl = rgbToHsl(p.r, p.g, p.b);
    const hue = hsl.h * 360;
    if (p.r > 85 && p.g > 40 && p.b > 20 && p.r > p.g && p.g > p.b * 0.7 && hsl.s > 0.08 && hsl.l > 0.18 && hsl.l < 0.92) return true;
    if (hsl.l > 0.58 && hsl.s < 0.48 && hue < 55) return true;
    if (hue > 155 && hue < 230 && hsl.s > 0.12 && hsl.l > 0.22 && hsl.l < 0.78) return true;
    return false;
  }


  function analyzeMaskAnchor(data, w, h) {
    let minX = w, minY = h, maxX = 0, maxY = 0, n = 0;
    const hair = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] > 40) {
          hair[y * w + x] = 1;
          n++;
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
      }
    }
    if (!n) {
      return { x: w * 0.3, y: h * 0.12, w: w * 0.4, h: h * 0.28, cx: w * 0.5, cy: h * 0.32, lineY: h * 0.32 };
    }
    const bw = Math.max(8, maxX - minX);
    const bh = Math.max(8, maxY - minY);
    const x0 = Math.round(minX + bw * 0.18);
    const x1 = Math.round(minX + bw * 0.82);
    const lineYs = [];
    for (let x = x0; x <= x1; x++) {
      let y = minY;
      while (y <= maxY && !hair[y * w + x]) y++;
      if (y > maxY) continue;
      while (y <= maxY && hair[y * w + x]) y++;
      lineYs.push(y - 1);
    }
    const lineY = lineYs.length ? perc(lineYs, 0.55) : (minY + bh * 0.72);
    return {
      x: minX, y: minY, w: bw, h: bh,
      cx: (minX + maxX) * 0.5,
      cy: lineY,
      lineY: lineY
    };
  }

  function estimateFace(canvas) {
    const w = canvas.width, h = canvas.height;
    const data = canvas.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, w, h).data;
    let minX = w, minY = h, maxX = 0, maxY = 0, n = 0;
    const ys = [];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const p = { r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] };
        if (!isFaceSkin(p)) continue;
        ys.push(y); n++;
      }
    }
    const yCut = ys.length ? perc(ys, 0.74) : h * 0.62;
    for (let y = 0; y < h; y++) {
      if (y > yCut && y > h * 0.58) continue;
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const p = { r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] };
        if (!isFaceSkin(p)) continue;
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
    }
    if (maxX <= minX) {
      minX = w * 0.28; maxX = w * 0.72; minY = h * 0.12; maxY = h * 0.58;
    }
    const fw = Math.max(8, maxX - minX), fh = Math.max(8, maxY - minY);
    return { x: minX, y: minY, w: fw, h: fh, cx: minX + fw * 0.5, cy: minY + fh * 0.42 };
  }

  function makeCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    return c;
  }

  function makeSession(img) {
    const srcW = img.naturalWidth || img.width;
    const srcH = img.naturalHeight || img.height;
    const maxS = 560;
    const s = maxS / Math.max(srcW, srcH);
    const w = Math.max(32, Math.round(srcW * s));
    const h = Math.max(32, Math.round(srcH * s));
    const src = makeCanvas(w, h);
    const sctx = src.getContext("2d", { willReadFrequently: true });
    sctx.drawImage(img, 0, 0, w, h);
    const mask = makeCanvas(w, h);
    const mctx = mask.getContext("2d", { willReadFrequently: true });
    mctx.clearRect(0, 0, w, h);

    const srcData = sctx.getImageData(0, 0, w, h);
    let transparent = 0;
    for (let i = 3; i < srcData.data.length; i += 4) {
      if (srcData.data[i] < 250) transparent++;
    }
    if (transparent > w * h * 0.08) {
      const md = mctx.getImageData(0, 0, w, h);
      for (let i = 0; i < w * h; i++) {
        const a = srcData.data[i * 4 + 3];
        md.data[i * 4] = md.data[i * 4 + 1] = md.data[i * 4 + 2] = 255;
        md.data[i * 4 + 3] = a < 40 ? 0 : a;
      }
      mctx.putImageData(md, 0, 0);
    }

    const session = {
      src: src,
      mask: mask,
      width: w,
      height: h,
      tool: "brush",
      size: 28,
      last: null,
      face: estimateFace(src)
    };

    function paintStamp(x, y) {
      mctx.save();
      mctx.globalCompositeOperation = session.tool === "erase" ? "destination-out" : "source-over";
      mctx.strokeStyle = "#ffffff";
      mctx.fillStyle = "#ffffff";
      mctx.lineCap = "round";
      mctx.lineJoin = "round";
      mctx.lineWidth = session.size;
      if (session.last) {
        mctx.beginPath();
        mctx.moveTo(session.last.x, session.last.y);
        mctx.lineTo(x, y);
        mctx.stroke();
      } else {
        mctx.beginPath();
        mctx.arc(x, y, session.size * 0.5, 0, Math.PI * 2);
        mctx.fill();
      }
      mctx.restore();
      session.last = { x: x, y: y };
    }

    session.pointerToSrc = function (canvas, clientX, clientY) {
      const r = canvas.getBoundingClientRect();
      const cx = (clientX - r.left) / r.width * canvas.width;
      const cy = (clientY - r.top) / r.height * canvas.height;
      const scale = Math.min(canvas.width / w, canvas.height / h);
      const dw = w * scale, dh = h * scale;
      const ox = (canvas.width - dw) / 2, oy = (canvas.height - dh) / 2;
      const x = (cx - ox) / scale;
      const y = (cy - oy) / scale;
      return { x: x, y: y, inside: x >= 0 && y >= 0 && x < w && y < h };
    };

    session.strokeStart = function (x, y) {
      session.last = null;
      paintStamp(x, y);
    };
    session.strokeMove = function (x, y) { paintStamp(x, y); };
    session.strokeEnd = function () { session.last = null; };

    session.fillAt = function (x, y, tol) {
      x = x | 0; y = y | 0;
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      tol = tol == null ? 42 : tol;
      const data = srcData.data;
      const si = (y * w + x) * 4;
      const seed = { r: data[si], g: data[si + 1], b: data[si + 2], a: data[si + 3] };
      if (seed.a < 20) return;
      const seen = new Uint8Array(w * h);
      const md = mctx.getImageData(0, 0, w, h);
      const q = [y * w + x];
      seen[y * w + x] = 1;
      let n = 0;
      while (q.length && n < w * h) {
        const i = q.pop();
        const px = i % w, py = (i / w) | 0;
        const pi = i * 4;
        const p = { r: data[pi], g: data[pi + 1], b: data[pi + 2], a: data[pi + 3] };
        if (p.a < 20 || distC(p, seed) > tol) continue;
        md.data[pi] = md.data[pi + 1] = md.data[pi + 2] = 255;
        md.data[pi + 3] = 255;
        n++;
        const nbs = [i + 1, i - 1, i + w, i - w];
        for (let k = 0; k < 4; k++) {
          const ni = nbs[k];
          if (ni < 0 || ni >= w * h || seen[ni]) continue;
          const nx = ni % w;
          if (k < 2 && Math.abs(nx - px) !== 1) continue;
          seen[ni] = 1;
          q.push(ni);
        }
      }
      mctx.putImageData(md, 0, 0);
    };

    session.clear = function () {
      mctx.clearRect(0, 0, w, h);
      session.last = null;
    };

    session.setTool = function (t) { session.tool = t; session.last = null; };
    session.setSize = function (n) { session.size = clamp(n, 4, 90); };

    session.buildCutout = function () {
      const out = makeCanvas(w, h);
      const octx = out.getContext("2d");
      octx.drawImage(src, 0, 0);
      octx.globalCompositeOperation = "destination-in";
      octx.drawImage(mask, 0, 0);
      const id = octx.getImageData(0, 0, w, h);
      const cols = [];
      let covered = 0;
      for (let i = 0; i < w * h; i++) {
        const a = id.data[i * 4 + 3];
        if (a > 40) {
          covered++;
          cols.push({ r: id.data[i * 4], g: id.data[i * 4 + 1], b: id.data[i * 4 + 2] });
        }
      }
      const col = medianC(cols);
      const hi = cols.length ? {
        r: perc(cols.map(function (p) { return p.r; }), 0.82),
        g: perc(cols.map(function (p) { return p.g; }), 0.82),
        b: perc(cols.map(function (p) { return p.b; }), 0.82)
      } : col;
      session.face = analyzeMaskAnchor(id.data, w, h);
      return {
        canvas: out,
        face: session.face,
        faceN: { x: session.face.x / w, y: session.face.y / h, w: session.face.w / w, h: session.face.h / h },
        color: col,
        highlight: hi,
        coverage: covered / (w * h),
        name: covered > 40 ? "手动抠取假发" : "尚未涂出头发",
        width: w,
        height: h
      };
    };

    session.paintPreview = function (dest, destCtx) {
      const dw0 = dest.width, dh0 = dest.height;
      destCtx.fillStyle = "#12110f";
      destCtx.fillRect(0, 0, dw0, dh0);
      const scale = Math.min(dw0 / w, dh0 / h);
      const dw = w * scale, dh = h * scale;
      const ox = (dw0 - dw) / 2, oy = (dh0 - dh) / 2;
      destCtx.drawImage(src, ox, oy, dw, dh);
      const ov = makeCanvas(w, h);
      const ovx = ov.getContext("2d");
      ovx.fillStyle = "rgba(214,96,196,0.55)";
      ovx.fillRect(0, 0, w, h);
      ovx.globalCompositeOperation = "destination-in";
      ovx.drawImage(mask, 0, 0);
      destCtx.drawImage(ov, ox, oy, dw, dh);
      destCtx.strokeStyle = "rgba(196,168,255,.9)";
      destCtx.lineWidth = 2;
      destCtx.strokeRect(
        ox + session.face.x * scale,
        oy + session.face.y * scale,
        session.face.w * scale,
        session.face.h * scale
      );
      const ly = oy + session.face.lineY * scale;
      destCtx.strokeStyle = "#e6d2ae";
      destCtx.lineWidth = 2;
      destCtx.beginPath();
      destCtx.moveTo(ox + session.face.x * scale, ly);
      destCtx.lineTo(ox + (session.face.x + session.face.w) * scale, ly);
      destCtx.stroke();
      destCtx.fillStyle = "#e6d2ae";
      destCtx.font = "12px Segoe UI";
      destCtx.fillText("假发下沿 → 贴额头", ox + session.face.x * scale + 6, Math.max(14, ly - 6));
    };

    return session;
  }

  function lmPt(lm, i, w, h) {
    const p = lm && lm[i] ? lm[i] : { x: 0.5, y: 0.5 };
    return { x: p.x * w, y: p.y * h };
  }

  function draw(dest, w, h, lm, cut, params) {
    if (!cut || !cut.canvas || !lm) return;
    if (!cut.coverage || cut.coverage < 0.004) return;
    params = params || {};
    const opacity = clamp(params.opacity == null ? 0.92 : params.opacity, 0.05, 1);
    const scaleMul = clamp(params.scale == null ? 1 : params.scale, 0.12, 5);
    const volX = clamp(params.volume == null ? 1 : params.volume, 0.2, 3.5);
    const bangs = clamp(params.bangs == null ? 0.45 : params.bangs, 0, 1);

    const left = lmPt(lm, 234, w, h);
    const right = lmPt(lm, 454, w, h);
    const top = lmPt(lm, 10, w, h);
    const chin = lmPt(lm, 152, w, h);
    const browL = lmPt(lm, 70, w, h);
    const browR = lmPt(lm, 300, w, h);
    const faceW = Math.hypot(right.x - left.x, right.y - left.y) || 1;
    const faceH = Math.hypot(chin.x - top.x, chin.y - top.y) || 1;
    const roll = Math.atan2(top.x - chin.x, chin.y - top.y);
    const lineY = (cut.face && cut.face.lineY != null) ? cut.face.lineY : (cut.face ? cut.face.cy : 0);
    const ax = cut.face ? cut.face.cx : cut.width * 0.5;
    const hairW = Math.max(12, (cut.face && cut.face.w) || cut.width * 0.5);
    const capH = Math.max(8, lineY - ((cut.face && cut.face.y) || 0));
    const scaleW = faceW * 1.55 / hairW;
    const scaleH = faceH * 0.28 / capH;
    const scale = Math.max(scaleW, scaleH) * scaleMul;

    const layer = makeCanvas(w, h);
    const ctx = layer.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.save();
    ctx.translate(top.x + (params.ox || 0), top.y + (params.oy || 0));
    ctx.rotate(roll);
    ctx.scale(scale * volX, scale);
    ctx.translate(-ax, -lineY);
    ctx.drawImage(cut.canvas, 0, 0);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    const pcx = (left.x + right.x) * 0.5;
    const browY = (browL.y + browR.y) * 0.5;
    const punchTop = lerp(browY - faceH * 0.04, browY + faceH * 0.12, bangs);
    const punchCy = (punchTop + chin.y) * 0.5;
    ctx.beginPath();
    ctx.ellipse(pcx, punchCy, faceW * 0.44, Math.max(8, (chin.y - punchTop) * 0.52), roll, 0, Math.PI * 2);
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.restore();

    dest.save();
    dest.globalAlpha = opacity;
    dest.drawImage(layer, 0, 0);
    dest.restore();
  }

  root.CosFusionHair = { makeSession: makeSession, draw: draw };
})(window);

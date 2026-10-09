(() => {
        const sourceCanvas = document.getElementById("sourceCanvas");
        const canvas = document.getElementById("tryonCanvas");
        const sourceContext = sourceCanvas?.getContext("2d");
        const context = canvas?.getContext("2d");
        const video = document.getElementById("tryonVideo");
        const image = document.getElementById("tryonImage");
        const uploadInput = document.getElementById("faceUpload");
        const animeUploadInput = document.getElementById("animeUpload");
        const animeReferenceCanvas = document.getElementById("animeReferenceCanvas");
        const animeReferenceContext = animeReferenceCanvas?.getContext("2d");
        const animeReferenceImage = new Image();
        const startCameraBtn = document.getElementById("startCameraBtn");
        const stopCameraBtn = document.getElementById("stopCameraBtn");
        const captureFrameBtn = document.getElementById("captureFrameBtn");
        const demoStatus = document.getElementById("demoStatus");
        const modelViewport = document.getElementById("modelViewport");
        const modelFigure = document.getElementById("modelFigure");
        const modelFace = document.getElementById("modelFace");

        if (!sourceCanvas || !sourceContext || !canvas || !context || !video || !image || !uploadInput || !demoStatus) {
          return;
        }

        const ranges = {
          jaw: document.getElementById("jawRange"),
          eye: document.getElementById("eyeRange"),
          blush: document.getElementById("blushRange"),
          lip: document.getElementById("lipRange"),
          glow: document.getElementById("glowRange"),
          asianFit: document.getElementById("asianFitRange"),
        };

        const rangeOutputs = {
          jaw: document.getElementById("jawRangeValue"),
          eye: document.getElementById("eyeRangeValue"),
          blush: document.getElementById("blushRangeValue"),
          lip: document.getElementById("lipRangeValue"),
          glow: document.getElementById("glowRangeValue"),
          asianFit: document.getElementById("asianFitRangeValue"),
        };

        const readoutStyle = document.getElementById("readoutStyle");
        const readoutScene = document.getElementById("readoutScene");
        const readoutGuide = document.getElementById("readoutGuide");
        const readoutMood = document.getElementById("readoutMood");
        const readoutProfile = document.getElementById("readoutProfile");
        const analysisFaceType = document.getElementById("analysisFaceType");
        const analysisFaceTypeDesc = document.getElementById("analysisFaceTypeDesc");
        const analysisContour = document.getElementById("analysisContour");
        const analysisContourDesc = document.getElementById("analysisContourDesc");
        const analysisStyle = document.getElementById("analysisStyle");
        const analysisStyleDesc = document.getElementById("analysisStyleDesc");
        const analysisFeature = document.getElementById("analysisFeature");
        const analysisFeatureDesc = document.getElementById("analysisFeatureDesc");
        const analysisAdapt = document.getElementById("analysisAdapt");
        const analysisAdaptDesc = document.getElementById("analysisAdaptDesc");
        const analysisEngine = document.getElementById("analysisEngine");
        const analysisEngineDesc = document.getElementById("analysisEngineDesc");
        const analysisTags = document.getElementById("analysisTags");
        const animeArchetype = document.getElementById("animeArchetype");
        const animeKeywords = document.getElementById("animeKeywords");
        const animeContourTarget = document.getElementById("animeContourTarget");
        const animePaletteText = document.getElementById("animePaletteText");
        const animeSpecialDetail = document.getElementById("animeSpecialDetail");
        const animeAccessorySuggestion = document.getElementById("animeAccessorySuggestion");
        const swatch1 = document.getElementById("swatch1");
        const swatch2 = document.getElementById("swatch2");
        const swatch3 = document.getElementById("swatch3");
        const presetButtons = Array.from(document.querySelectorAll("[data-preset]"));

        const presets = {
          natural: {
            label: "自然感淡妆",
            scene: "日常漫展 / 新手试妆",
            guide: "低门槛引导线",
            mood: "柔和、通透、易上手",
            colors: {
              blush: "rgba(241, 170, 188, 0.22)",
              eye: "rgba(201, 175, 255, 0.34)",
              lip: "rgba(219, 118, 146, 0.58)",
              guide: "rgba(255, 244, 214, 0.9)",
              overlayA: "rgba(255, 229, 221, 0.18)",
              overlayB: "rgba(188, 170, 255, 0.08)",
              accent: "#ef8ca4",
              accentSoft: "rgba(239, 140, 164, 0.22)",
              eyeModel: "#caa7ff",
            },
            values: { jaw: 55, eye: 62, blush: 50, lip: 58, glow: 54 },
          },
          glam: {
            label: "角色浓妆",
            scene: "舞台妆 / 漫展高还原",
            guide: "高对比角色线",
            mood: "锐利、戏剧化、角色感强",
            colors: {
              blush: "rgba(255, 102, 153, 0.24)",
              eye: "rgba(146, 91, 255, 0.42)",
              lip: "rgba(228, 67, 119, 0.76)",
              guide: "rgba(255, 228, 246, 0.92)",
              overlayA: "rgba(255, 116, 175, 0.18)",
              overlayB: "rgba(122, 98, 255, 0.12)",
              accent: "#f56a9c",
              accentSoft: "rgba(245, 106, 156, 0.24)",
              eyeModel: "#9b79ff",
            },
            values: { jaw: 70, eye: 82, blush: 57, lip: 76, glow: 61 },
          },
          guofeng: {
            label: "新国风妆造",
            scene: "国风角色 / 东方审美",
            guide: "轮廓与纹样并重",
            mood: "暖金、雅致、东方韵味",
            colors: {
              blush: "rgba(214, 98, 98, 0.18)",
              eye: "rgba(238, 179, 66, 0.3)",
              lip: "rgba(199, 74, 74, 0.72)",
              guide: "rgba(255, 236, 199, 0.92)",
              overlayA: "rgba(244, 195, 116, 0.18)",
              overlayB: "rgba(214, 83, 83, 0.08)",
              accent: "#d96b63",
              accentSoft: "rgba(217, 107, 99, 0.22)",
              eyeModel: "#efc468",
            },
            values: { jaw: 60, eye: 68, blush: 46, lip: 70, glow: 64 },
          },
        };

        const state = {
          mode: "placeholder",
          stream: null,
          preset: "natural",
          imageReady: false,
          animationId: 0,
          frameTick: 0,
          landmarks: null,
          faceMesh: null,
          faceMeshBusy: false,
          faceMeshReady: false,
          faceMeshPromise: null,
          faceMeshError: false,
          referenceLoaded: false,
          referenceAnalysis: null,
          referenceName: "",
        };

        function setStatus(text) {
          demoStatus.textContent = text;
        }

        function updateReadoutsForWaitingReference() {
          const preset = presets[state.preset];
          readoutStyle.textContent = preset.label;
          readoutScene.textContent = preset.scene;
          readoutGuide.textContent = preset.guide;
          readoutMood.textContent = `${preset.mood} / 上传角色图可自动换妆`;
          if (readoutProfile) {
            readoutProfile.textContent = `亚洲脸型优先 / ${ranges.asianFit?.value || 72}`;
          }
        }

        function updateReadoutsFromReference() {
          const reference = state.referenceAnalysis;
          const preset = presets[state.preset];
          if (!reference) {
            updateReadoutsForWaitingReference();
            return;
          }

          readoutStyle.textContent = `${reference.archetype} / ${preset.label}`;
          readoutScene.textContent = `${reference.contourTarget} / ${reference.blushText}`;
          readoutGuide.textContent = `${reference.eyeShadowText} / ${reference.specialText}`;
          readoutMood.textContent = `${reference.lipText} / ${reference.accessoryText}`;
          if (readoutProfile) {
            readoutProfile.textContent = `亚洲脸型优先 / ${ranges.asianFit?.value || 72}`;
          }
        }

        function getValues() {
          return {
            jaw: Number(ranges.jaw.value),
            eye: Number(ranges.eye.value),
            blush: Number(ranges.blush.value),
            lip: Number(ranges.lip.value),
            glow: Number(ranges.glow.value),
            asianFit: Number(ranges.asianFit?.value || 72),
          };
        }

        function syncOutputs() {
          Object.entries(ranges).forEach(([key, input]) => {
            if (rangeOutputs[key]) {
              rangeOutputs[key].textContent = input.value;
            }
          });
        }

        function loadScript(src) {
          return new Promise((resolve, reject) => {
            const existing = document.querySelector(`script[data-src="${src}"]`);
            if (existing) {
              existing.addEventListener("load", resolve, { once: true });
              existing.addEventListener("error", reject, { once: true });
              if (existing.dataset.loaded === "true") {
                resolve();
              }
              return;
            }

            const script = document.createElement("script");
            script.src = src;
            script.async = true;
            script.dataset.src = src;
            script.onload = () => {
              script.dataset.loaded = "true";
              resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        function setAnalysisEngine(text, desc) {
          if (analysisEngine) analysisEngine.textContent = text;
          if (analysisEngineDesc) analysisEngineDesc.textContent = desc;
        }

        async function ensureFaceMesh() {
          if (state.faceMesh) {
            return state.faceMesh;
          }

          if (state.faceMeshError) {
            return null;
          }

          if (!state.faceMeshPromise) {
            setAnalysisEngine("正在加载 FaceMesh", "如果浏览器能访问 CDN，将启用真实关键点；否则自动回退到启发式模式。");
            state.faceMeshPromise = loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js")
              .then(() => {
                if (!window.FaceMesh) {
                  throw new Error("FaceMesh unavailable");
                }

                const instance = new window.FaceMesh({
                  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
                });

                instance.setOptions({
                  maxNumFaces: 1,
                  refineLandmarks: true,
                  minDetectionConfidence: 0.5,
                  minTrackingConfidence: 0.5,
                });

                instance.onResults((results) => {
                  state.landmarks = results?.multiFaceLandmarks?.[0] || null;
                  analyzeFace();
                  renderAll();
                });

                state.faceMesh = instance;
                state.faceMeshReady = true;
                setAnalysisEngine("MediaPipe FaceMesh", "已启用真实 468 点人脸关键点识别，将用于眼妆范围、轮廓和高光区域分析。");
                return instance;
              })
              .catch((error) => {
                console.error(error);
                state.faceMeshError = true;
                setAnalysisEngine("启发式关键点", "FaceMesh 未成功加载，当前使用本地轮廓估计与参数驱动的解析模式。");
                return null;
              });
          }

          return state.faceMeshPromise;
        }

        async function runFaceMesh(source) {
          const mesh = await ensureFaceMesh();
          if (!mesh || state.faceMeshBusy) {
            return;
          }

          try {
            state.faceMeshBusy = true;
            await mesh.send({ image: source });
          } catch (error) {
            console.error(error);
          } finally {
            state.faceMeshBusy = false;
          }
        }

        function setTagList(tags) {
          if (!analysisTags) {
            return;
          }

          analysisTags.innerHTML = "";
          tags.forEach((tag) => {
            const element = document.createElement("span");
            element.className = "analysis-tag";
            element.textContent = tag;
            analysisTags.appendChild(element);
          });
        }

        function rgbToHex(red, green, blue) {
          return `#${[red, green, blue]
            .map((value) => Math.max(0, Math.min(255, value)).toString(16).padStart(2, "0"))
            .join("")}`;
        }

        function rgbToHsl(red, green, blue) {
          const r = red / 255;
          const g = green / 255;
          const b = blue / 255;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          let h = 0;
          let s = 0;
          const l = (max + min) / 2;

          if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
              case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
              case g:
                h = (b - r) / d + 2;
                break;
              default:
                h = (r - g) / d + 4;
            }

            h /= 6;
          }

          return { h: h * 360, s, l };
        }

        function quantizeColor(red, green, blue) {
          return [
            Math.round(red / 32) * 32,
            Math.round(green / 32) * 32,
            Math.round(blue / 32) * 32,
          ];
        }

        function updateReferenceUi(result) {
          if (!result) {
            if (animeArchetype) animeArchetype.textContent = "等待角色图";
            if (animeKeywords) animeKeywords.textContent = "等待角色图";
            if (animeContourTarget) animeContourTarget.textContent = "等待角色图";
            if (animePaletteText) animePaletteText.textContent = "等待角色图";
            if (animeSpecialDetail) animeSpecialDetail.textContent = "等待角色图";
            if (animeAccessorySuggestion) animeAccessorySuggestion.textContent = "等待角色图";
            [swatch1, swatch2, swatch3].forEach((swatch) => {
              if (swatch) swatch.style.background = "rgba(255,255,255,0.1)";
            });
            return;
          }

          if (animeArchetype) animeArchetype.textContent = result.archetype;
          if (animeKeywords) animeKeywords.textContent = result.eyeShadowText || result.keywords.join(" / ");
          if (animeContourTarget) animeContourTarget.textContent = result.blushText || result.contourTarget;
          if (animePaletteText) animePaletteText.textContent = result.lipText || result.palette.join(" · ");
          if (animeSpecialDetail) animeSpecialDetail.textContent = result.specialText || "基础眼线";
          if (animeAccessorySuggestion) animeAccessorySuggestion.textContent = result.accessoryText || "等待角色图";
          [swatch1, swatch2, swatch3].forEach((swatch, index) => {
            if (swatch) {
              swatch.style.background = result.palette[index] || "rgba(255,255,255,0.1)";
            }
          });
        }

        function renderReferencePreview() {
          if (!animeReferenceCanvas || !animeReferenceContext) {
            return;
          }

          const rect = animeReferenceCanvas.getBoundingClientRect();
          const width = Math.max(160, Math.round(rect.width || 160));
          const height = Math.max(220, Math.round(rect.height || 220));
          const dpr = window.devicePixelRatio || 1;

          if (animeReferenceCanvas.width !== width * dpr || animeReferenceCanvas.height !== height * dpr) {
            animeReferenceCanvas.width = width * dpr;
            animeReferenceCanvas.height = height * dpr;
          }

          animeReferenceContext.setTransform(dpr, 0, 0, dpr, 0, 0);
          animeReferenceContext.clearRect(0, 0, width, height);

          if (state.referenceLoaded && animeReferenceImage.naturalWidth) {
            fitDraw.call({ context: animeReferenceContext }, animeReferenceImage, width, height);
            return;
          }

          const gradient = animeReferenceContext.createLinearGradient(0, 0, 0, height);
          gradient.addColorStop(0, "#202020");
          gradient.addColorStop(1, "#0f0f0f");
          animeReferenceContext.fillStyle = gradient;
          animeReferenceContext.fillRect(0, 0, width, height);
          animeReferenceContext.fillStyle = "rgba(246,242,235,0.82)";
          animeReferenceContext.font = "600 15px Segoe UI";
          animeReferenceContext.textAlign = "center";
          animeReferenceContext.fillText("上传角色参考图", width / 2, height * 0.48);
          animeReferenceContext.fillStyle = "rgba(246,242,235,0.56)";
          animeReferenceContext.font = "12px Segoe UI";
          animeReferenceContext.fillText("系统将提取主色、气质和轮廓方向", width / 2, height * 0.56);
        }

        function analyzeReferenceImage(filename = state.referenceName) {
          if (!animeReferenceImage.naturalWidth) {
            state.referenceAnalysis = null;
            updateReferenceUi(null);
            renderReferencePreview();
            return null;
          }

          const sampleCanvas = document.createElement("canvas");
          const sampleSize = 48;
          sampleCanvas.width = sampleSize;
          sampleCanvas.height = sampleSize;
          const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });
          sampleContext.drawImage(animeReferenceImage, 0, 0, sampleSize, sampleSize);
          const { data } = sampleContext.getImageData(0, 0, sampleSize, sampleSize);

          let totalR = 0;
          let totalG = 0;
          let totalB = 0;
          let totalS = 0;
          let totalL = 0;
          let count = 0;
          const buckets = new Map();

          for (let index = 0; index < data.length; index += 4) {
            const alpha = data[index + 3];
            if (alpha < 20) continue;

            const red = data[index];
            const green = data[index + 1];
            const blue = data[index + 2];
            const [qr, qg, qb] = quantizeColor(red, green, blue);
            const key = `${qr},${qg},${qb}`;
            buckets.set(key, (buckets.get(key) || 0) + 1);

            const hsl = rgbToHsl(red, green, blue);
            totalR += red;
            totalG += green;
            totalB += blue;
            totalS += hsl.s;
            totalL += hsl.l;
            count += 1;
          }

          if (!count) {
            return null;
          }

          const average = {
            r: Math.round(totalR / count),
            g: Math.round(totalG / count),
            b: Math.round(totalB / count),
            s: totalS / count,
            l: totalL / count,
          };
          const hsl = rgbToHsl(average.r, average.g, average.b);

          const palette = Array.from(buckets.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([key]) => {
              const [red, green, blue] = key.split(",").map(Number);
              return rgbToHex(red, green, blue);
            });

          while (palette.length < 3) {
            palette.push(rgbToHex(average.r, average.g, average.b));
          }

          let archetype = "柔和幻想系";
          let keywords = ["清透", "柔光", "渐层眼妆"];
          let contourTarget = "柔化下颌，保留中庭通透感";
          let blushText = "轻扫苹果肌";
          let specialText = "基础眼线";
          let accessoryText = "建议搭配浅色假发 / 发饰";

          if (hsl.s > 0.42 && (hsl.h < 25 || hsl.h > 320)) {
            archetype = "高饱和角色系";
            keywords = ["高对比", "强角色感", "舞台唇妆"];
            contourTarget = "强化眼尾与唇峰，轮廓收束更明显";
            blushText = "横向角色腮红";
            specialText = "上扬眼线 / 局部亮片";
            accessoryText = "建议搭配深色或撞色发饰";
          } else if (hsl.h > 25 && hsl.h < 75) {
            archetype = "新国风东方系";
            keywords = ["暖金", "绛红", "东方纹样"];
            contourTarget = "提亮中轴与颧区，适合花钿与国风轮廓线";
            blushText = "中庭提气腮红";
            specialText = "花钿 / 金色细节";
            accessoryText = "建议搭配簪花、流苏或古风发饰";
          } else if (hsl.h > 190 && hsl.h < 290) {
            archetype = "冷调幻想系";
            keywords = ["冷紫", "高光感", "轻科幻角色"];
            contourTarget = "强调额头、鼻梁高光和锐化眼妆走向";
            blushText = "低饱和冷调腮红";
            specialText = "冷调眼线 / 亮面高光";
            accessoryText = "建议搭配银色或冷调配饰";
          }

          if (String(filename || "").match(/国风|古风|汉服|华|凤/i)) {
            archetype = "新国风东方系";
            keywords = ["暖金", "绛红", "东方纹样"];
            contourTarget = "提亮中轴与颧区，适合花钿与国风轮廓线";
            blushText = "中庭提气腮红";
            specialText = "花钿 / 金色细节";
            accessoryText = "建议搭配簪花、流苏或古风发饰";
          } else if (String(filename || "").match(/赛博|紫|夜|cool|cyber/i)) {
            specialText = "冷调眼线 / 亮面高光";
            accessoryText = "建议搭配银色或冷调配饰";
          }

          const eyeShadowText = `${keywords[0]} / ${keywords[1]}`;
          const lipText = `${keywords[keywords.length - 1]} / ${palette[0]}`;

          const result = {
            average,
            palette,
            hue: hsl.h,
            saturation: hsl.s,
            lightness: hsl.l,
            archetype,
            keywords,
            contourTarget,
            blushText,
            specialText,
            accessoryText,
            eyeShadowText,
            lipText,
          };

          state.referenceAnalysis = result;
          updateReferenceUi(result);
          renderReferencePreview();
          return result;
        }

        function fitDraw(source, width, height) {
          const targetContext = this?.context || context;
          const sw = source.videoWidth || source.naturalWidth || source.width;
          const sh = source.videoHeight || source.naturalHeight || source.height;

          if (!sw || !sh) {
            return;
          }

          const sourceRatio = sw / sh;
          const targetRatio = width / height;
          let sx = 0;
          let sy = 0;
          let sWidth = sw;
          let sHeight = sh;

          if (sourceRatio > targetRatio) {
            sWidth = sh * targetRatio;
            sx = (sw - sWidth) / 2;
          } else {
            sHeight = sw / targetRatio;
            sy = (sh - sHeight) / 2;
          }

          targetContext.drawImage(source, sx, sy, sWidth, sHeight, 0, 0, width, height);
        }

        function drawPlaceholder(width, height) {
          const background = context.createLinearGradient(0, 0, 0, height);
          background.addColorStop(0, "#1b1b1b");
          background.addColorStop(1, "#0b0b0b");
          context.fillStyle = background;
          context.fillRect(0, 0, width, height);

          const halo = context.createRadialGradient(width / 2, height * 0.22, 20, width / 2, height * 0.22, width * 0.5);
          halo.addColorStop(0, "rgba(240, 223, 194, 0.28)");
          halo.addColorStop(1, "rgba(240, 223, 194, 0)");
          context.fillStyle = halo;
          context.fillRect(0, 0, width, height);

          context.fillStyle = "rgba(255,255,255,0.12)";
          context.beginPath();
          context.ellipse(width / 2, height * 0.42, width * 0.2, height * 0.24, 0, 0, Math.PI * 2);
          context.fill();

          context.fillStyle = "rgba(255,255,255,0.08)";
          context.fillRect(width * 0.32, height * 0.58, width * 0.36, height * 0.22);

          context.fillStyle = "rgba(246,242,235,0.9)";
          context.font = "600 22px Segoe UI";
          context.textAlign = "center";
          context.fillText("上传一张正脸照片，或开启摄像头", width / 2, height * 0.84);

          context.fillStyle = "rgba(246,242,235,0.62)";
          context.font = "14px Segoe UI";
          context.fillText("系统会在画面上生成妆容叠加、引导线和关键点示意", width / 2, height * 0.88);
        }

        function getCanvasMetrics(targetCanvas, targetContext) {
          const rect = targetCanvas.getBoundingClientRect();
          const width = Math.max(320, Math.round(rect.width || 640));
          const height = Math.max(400, Math.round(rect.height || 800));
          const dpr = window.devicePixelRatio || 1;

          if (targetCanvas.width !== width * dpr || targetCanvas.height !== height * dpr) {
            targetCanvas.width = width * dpr;
            targetCanvas.height = height * dpr;
          }

          targetContext.setTransform(dpr, 0, 0, dpr, 0, 0);
          targetContext.clearRect(0, 0, width, height);
          return { width, height };
        }

        function drawBase(targetContext, width, height) {
          if (state.mode === "camera" && video.readyState >= 2) {
            fitDraw.call({ context: targetContext }, video, width, height);
            return true;
          }

          if (state.mode === "image" && image.complete && image.naturalWidth) {
            fitDraw.call({ context: targetContext }, image, width, height);
            return true;
          }

          return false;
        }

        function canvasPoint(point, width, height) {
          return {
            x: point.x * width,
            y: point.y * height,
          };
        }

        function getFeaturePoints(width, height, values) {
          if (state.landmarks) {
            const point = (index) => canvasPoint(state.landmarks[index], width, height);
            return {
              forehead: point(10),
              chin: point(152),
              nose: point(1),
              leftCheek: point(234),
              rightCheek: point(454),
              leftEyeOuter: point(33),
              rightEyeOuter: point(263),
              leftEyeUpper: point(159),
              leftEyeLower: point(145),
              rightEyeUpper: point(386),
              rightEyeLower: point(374),
              leftMouth: point(61),
              rightMouth: point(291),
            };
          }

          const centerX = width * 0.5;
          const centerY = height * 0.47;
          const faceWidth = width * (0.28 + values.jaw / 600);
          const faceHeight = height * 0.34;
          const blushOffset = (values.blush - 50) / 180;

          return {
            forehead: { x: centerX, y: centerY - faceHeight * 0.85 },
            chin: { x: centerX, y: centerY + faceHeight * 0.92 },
            nose: { x: centerX, y: centerY + faceHeight * 0.02 },
            leftCheek: { x: centerX - faceWidth * 0.78, y: centerY + faceHeight * (0.16 + blushOffset) },
            rightCheek: { x: centerX + faceWidth * 0.78, y: centerY + faceHeight * (0.16 + blushOffset) },
            leftEyeOuter: { x: centerX - faceWidth * 0.46, y: centerY - faceHeight * 0.22 },
            rightEyeOuter: { x: centerX + faceWidth * 0.46, y: centerY - faceHeight * 0.22 },
            leftEyeUpper: { x: centerX - faceWidth * 0.3, y: centerY - faceHeight * 0.26 },
            leftEyeLower: { x: centerX - faceWidth * 0.3, y: centerY - faceHeight * 0.17 },
            rightEyeUpper: { x: centerX + faceWidth * 0.3, y: centerY - faceHeight * 0.26 },
            rightEyeLower: { x: centerX + faceWidth * 0.3, y: centerY - faceHeight * 0.17 },
            leftMouth: { x: centerX - faceWidth * 0.2, y: centerY + faceHeight * 0.48 },
            rightMouth: { x: centerX + faceWidth * 0.2, y: centerY + faceHeight * 0.48 },
          };
        }

        function drawGuides(width, height, colors, values) {
          const points = getFeaturePoints(width, height, values);
          const faceWidth = Math.abs(points.rightCheek.x - points.leftCheek.x) / 1.55;
          const faceHeight = Math.abs(points.chin.y - points.forehead.y) / 1.8;
          const eyeScale = 0.8 + values.eye / 250;
          const glowStrength = values.glow / 100;

          context.save();
          context.strokeStyle = colors.guide;
          context.lineWidth = 1.4;
          context.setLineDash([7, 7]);

          context.beginPath();
          context.moveTo(points.forehead.x, points.forehead.y);
          context.quadraticCurveTo(points.leftCheek.x, points.leftCheek.y - faceHeight * 0.7, points.chin.x, points.chin.y);
          context.quadraticCurveTo(points.rightCheek.x, points.rightCheek.y - faceHeight * 0.7, points.forehead.x, points.forehead.y);
          context.stroke();

          context.beginPath();
          context.moveTo(points.nose.x, points.forehead.y + faceHeight * 0.12);
          context.lineTo(points.nose.x, points.chin.y);
          context.stroke();

          context.beginPath();
          context.moveTo(points.leftEyeOuter.x - faceWidth * 0.18, points.leftEyeOuter.y);
          context.lineTo(points.rightEyeOuter.x + faceWidth * 0.18, points.rightEyeOuter.y);
          context.moveTo(points.leftCheek.x + faceWidth * 0.12, points.leftCheek.y);
          context.lineTo(points.rightCheek.x - faceWidth * 0.12, points.rightCheek.y);
          context.stroke();
          context.setLineDash([]);

          const eyeGradientLeft = context.createRadialGradient(points.leftEyeOuter.x, points.leftEyeOuter.y, 2, points.leftEyeOuter.x, points.leftEyeOuter.y, faceWidth * 0.36);
          eyeGradientLeft.addColorStop(0, colors.eye);
          eyeGradientLeft.addColorStop(1, "rgba(0,0,0,0)");
          context.fillStyle = eyeGradientLeft;
          context.beginPath();
          context.ellipse(points.leftEyeOuter.x, points.leftEyeOuter.y, faceWidth * 0.26, faceHeight * 0.12 * eyeScale, -0.12, 0, Math.PI * 2);
          context.fill();

          const eyeGradientRight = context.createRadialGradient(points.rightEyeOuter.x, points.rightEyeOuter.y, 2, points.rightEyeOuter.x, points.rightEyeOuter.y, faceWidth * 0.36);
          eyeGradientRight.addColorStop(0, colors.eye);
          eyeGradientRight.addColorStop(1, "rgba(0,0,0,0)");
          context.fillStyle = eyeGradientRight;
          context.beginPath();
          context.ellipse(points.rightEyeOuter.x, points.rightEyeOuter.y, faceWidth * 0.26, faceHeight * 0.12 * eyeScale, 0.12, 0, Math.PI * 2);
          context.fill();

          const blushLeft = context.createRadialGradient(points.leftCheek.x, points.leftCheek.y, 2, points.leftCheek.x, points.leftCheek.y, faceWidth * 0.42);
          blushLeft.addColorStop(0, colors.blush);
          blushLeft.addColorStop(1, "rgba(0,0,0,0)");
          context.fillStyle = blushLeft;
          context.beginPath();
          context.ellipse(points.leftCheek.x, points.leftCheek.y, faceWidth * 0.28, faceHeight * 0.14, -0.22, 0, Math.PI * 2);
          context.fill();

          const blushRight = context.createRadialGradient(points.rightCheek.x, points.rightCheek.y, 2, points.rightCheek.x, points.rightCheek.y, faceWidth * 0.42);
          blushRight.addColorStop(0, colors.blush);
          blushRight.addColorStop(1, "rgba(0,0,0,0)");
          context.fillStyle = blushRight;
          context.beginPath();
          context.ellipse(points.rightCheek.x, points.rightCheek.y, faceWidth * 0.28, faceHeight * 0.14, 0.22, 0, Math.PI * 2);
          context.fill();

          const glow = context.createRadialGradient(points.forehead.x, points.forehead.y + faceHeight * 0.34, 4, points.forehead.x, points.forehead.y + faceHeight * 0.34, faceWidth * 0.8);
          glow.addColorStop(0, `rgba(255,255,255,${0.12 + glowStrength * 0.26})`);
          glow.addColorStop(1, "rgba(255,255,255,0)");
          context.fillStyle = glow;
          context.fillRect(points.forehead.x - faceWidth, points.forehead.y, faceWidth * 2, faceHeight);

          context.strokeStyle = colors.lip;
          context.lineWidth = 3;
          context.beginPath();
          context.moveTo(points.leftMouth.x, points.leftMouth.y);
          context.quadraticCurveTo(points.nose.x, points.leftMouth.y + faceHeight * 0.08, points.rightMouth.x, points.rightMouth.y);
          context.stroke();

          [points.forehead, points.nose, points.leftEyeOuter, points.rightEyeOuter, points.leftCheek, points.rightCheek, points.chin, points.leftMouth, points.rightMouth].forEach((point) => {
            context.beginPath();
            context.fillStyle = colors.guide;
            context.arc(point.x, point.y, 2.6, 0, Math.PI * 2);
            context.fill();
          });

          context.fillStyle = "rgba(0,0,0,0.42)";
          context.fillRect(16, 16, 176, 54);
          context.fillStyle = "rgba(246,242,235,0.9)";
          context.font = "600 14px Segoe UI";
          context.fillText(state.landmarks ? "FaceMesh Overlay" : "Heuristic Overlay", 30, 38);
          context.fillStyle = "rgba(246,242,235,0.68)";
          context.font = "12px Segoe UI";
          context.fillText(`Jaw ${values.jaw} / Eye ${values.eye} / Glow ${values.glow}`, 30, 58);
          context.restore();
        }

        function drawReferenceInset(width, height) {
          if (!state.referenceLoaded || !animeReferenceImage.naturalWidth) {
            return;
          }

          const insetWidth = width * 0.2;
          const insetHeight = insetWidth * 1.25;
          const insetX = width - insetWidth - 18;
          const insetY = 18;

          context.save();
          context.fillStyle = "rgba(0,0,0,0.44)";
          context.fillRect(insetX - 6, insetY - 6, insetWidth + 12, insetHeight + 32);
          context.strokeStyle = "rgba(240,223,194,0.5)";
          context.lineWidth = 1;
          context.strokeRect(insetX - 6, insetY - 6, insetWidth + 12, insetHeight + 32);
          context.drawImage(animeReferenceImage, 0, 0, animeReferenceImage.naturalWidth, animeReferenceImage.naturalHeight, insetX, insetY, insetWidth, insetHeight);
          context.fillStyle = "rgba(246,242,235,0.92)";
          context.font = "12px Segoe UI";
          context.fillText("角色参考图", insetX, insetY + insetHeight + 18);
          context.restore();
        }

        function drawAnimeFusion(width, height, colors, values) {
          const points = getFeaturePoints(width, height, values);
          const faceWidth = Math.abs(points.rightCheek.x - points.leftCheek.x);
          const faceHeight = Math.abs(points.chin.y - points.forehead.y);
          const reference = state.referenceAnalysis;
          const primary = reference?.palette?.[0] || colors.lip;
          const secondary = reference?.palette?.[1] || colors.eye;
          const tertiary = reference?.palette?.[2] || colors.blush;

          context.save();

          const contourGradient = context.createLinearGradient(points.leftCheek.x, points.forehead.y, points.rightCheek.x, points.chin.y);
          contourGradient.addColorStop(0, `${primary}22`);
          contourGradient.addColorStop(1, `${secondary}18`);
          context.fillStyle = contourGradient;
          context.beginPath();
          context.moveTo(points.forehead.x, points.forehead.y + faceHeight * 0.06);
          context.quadraticCurveTo(points.leftCheek.x + faceWidth * 0.05, points.leftCheek.y - faceHeight * 0.24, points.chin.x, points.chin.y);
          context.quadraticCurveTo(points.rightCheek.x - faceWidth * 0.05, points.rightCheek.y - faceHeight * 0.24, points.forehead.x, points.forehead.y + faceHeight * 0.06);
          context.fill();

          context.strokeStyle = secondary;
          context.lineWidth = 4;
          context.beginPath();
          context.moveTo(points.leftEyeOuter.x - faceWidth * 0.08, points.leftEyeOuter.y - faceHeight * 0.02);
          context.quadraticCurveTo(points.leftEyeUpper.x, points.leftEyeUpper.y - faceHeight * 0.06, points.leftEyeUpper.x + faceWidth * 0.18, points.leftEyeUpper.y + faceHeight * 0.01);
          context.stroke();
          context.beginPath();
          context.moveTo(points.rightEyeOuter.x + faceWidth * 0.08, points.rightEyeOuter.y - faceHeight * 0.02);
          context.quadraticCurveTo(points.rightEyeUpper.x, points.rightEyeUpper.y - faceHeight * 0.06, points.rightEyeUpper.x - faceWidth * 0.18, points.rightEyeUpper.y + faceHeight * 0.01);
          context.stroke();

          context.fillStyle = `${secondary}55`;
          context.beginPath();
          context.ellipse(points.leftEyeOuter.x, points.leftEyeOuter.y, faceWidth * 0.16, faceHeight * (0.03 + values.eye / 1800), -0.22, 0, Math.PI * 2);
          context.fill();
          context.beginPath();
          context.ellipse(points.rightEyeOuter.x, points.rightEyeOuter.y, faceWidth * 0.16, faceHeight * (0.03 + values.eye / 1800), 0.22, 0, Math.PI * 2);
          context.fill();

          context.fillStyle = `${primary}aa`;
          context.beginPath();
          context.moveTo(points.leftMouth.x, points.leftMouth.y);
          context.quadraticCurveTo(points.nose.x, points.leftMouth.y + faceHeight * 0.08, points.rightMouth.x, points.rightMouth.y);
          context.quadraticCurveTo(points.nose.x, points.leftMouth.y + faceHeight * 0.18, points.leftMouth.x, points.leftMouth.y);
          context.fill();

          context.strokeStyle = `${tertiary}aa`;
          context.lineWidth = 2;
          context.beginPath();
          context.moveTo(points.nose.x, points.forehead.y + faceHeight * 0.24);
          context.lineTo(points.nose.x, points.chin.y - faceHeight * 0.28);
          context.stroke();

          if (reference?.archetype?.includes("国风")) {
            context.fillStyle = `${primary}cc`;
            context.beginPath();
            context.arc(points.forehead.x, points.forehead.y + faceHeight * 0.2, faceWidth * 0.04, 0, Math.PI * 2);
            context.fill();
          }

          context.fillStyle = `${tertiary}55`;
          context.beginPath();
          context.ellipse(points.leftCheek.x, points.leftCheek.y, faceWidth * 0.12, faceHeight * 0.06, -0.3, 0, Math.PI * 2);
          context.fill();
          context.beginPath();
          context.ellipse(points.rightCheek.x, points.rightCheek.y, faceWidth * 0.12, faceHeight * 0.06, 0.3, 0, Math.PI * 2);
          context.fill();

          context.fillStyle = "rgba(0,0,0,0.46)";
          context.fillRect(18, height - 78, 210, 52);
          context.fillStyle = "rgba(246,242,235,0.92)";
          context.font = "600 14px Segoe UI";
          context.fillText("角色妆容已融合到真人脸", 32, height - 48);
          context.fillStyle = "rgba(246,242,235,0.68)";
          context.font = "12px Segoe UI";
          context.fillText(reference ? reference.keywords.join(" / ") : "风格预设映射中", 32, height - 28);

          drawReferenceInset(width, height);
          context.restore();
        }

        function renderSource() {
          const { width, height } = getCanvasMetrics(sourceCanvas, sourceContext);
          const hasSource = drawBase(sourceContext, width, height);
          if (!hasSource) {
            drawPlaceholder(width, height);
          }
        }

        function renderPreview() {
          const { width, height } = getCanvasMetrics(canvas, context);
          const hasSource = drawBase(context, width, height);
          if (!hasSource) {
            drawPlaceholder(width, height);
          }

          const preset = presets[state.preset];
          const values = getValues();
          const reference = state.referenceAnalysis;
          const overlay = context.createLinearGradient(0, 0, width, height);
          overlay.addColorStop(0, reference ? `${reference.palette[0]}28` : preset.colors.overlayA);
          overlay.addColorStop(1, reference ? `${reference.palette[1]}20` : preset.colors.overlayB);
          context.fillStyle = overlay;
          context.fillRect(0, 0, width, height);

          const guideColors = reference
            ? {
                ...preset.colors,
                eye: `${reference.palette[1]}66`,
                lip: `${reference.palette[0]}cc`,
                blush: `${reference.palette[2]}44`,
                guide: "rgba(255, 245, 220, 0.9)",
              }
            : preset.colors;

          drawGuides(width, height, guideColors, values);
          drawAnimeFusion(width, height, guideColors, values);
        }

        function renderAll() {
          renderSource();
          renderPreview();
        }

        function analyzeFace() {
          const values = getValues();
          const preset = presets[state.preset];
          const reference = state.referenceAnalysis;

          let widthRatio = 0.84;
          let cheekLift = 0.52;
          let eyeOpen = 0.32;
          let chinNarrow = 0.5;
          let lipWidth = 0;
          let cheekSpan = 0;

          if (state.landmarks) {
            const faceWidth = Math.abs(state.landmarks[454].x - state.landmarks[234].x);
            const faceHeight = Math.abs(state.landmarks[152].y - state.landmarks[10].y) || 0.0001;
            widthRatio = faceWidth / faceHeight;
            cheekLift = 1 - (state.landmarks[234].y + state.landmarks[454].y) / 2;
            eyeOpen =
              ((state.landmarks[145].y - state.landmarks[159].y) +
                (state.landmarks[374].y - state.landmarks[386].y)) / 2;
            chinNarrow = Math.abs(state.landmarks[172].x - state.landmarks[397].x) / faceWidth;
            lipWidth = Math.abs(state.landmarks[291].x - state.landmarks[61].x) * 1000;
            cheekSpan = Math.abs(state.landmarks[454].x - state.landmarks[234].x) * 1000;
          }

          let profileLabel = values.asianFit >= 60 ? "亚洲脸型优先" : "通用脸型映射";
          let faceType = "鹅蛋脸";
          let faceTypeDesc = "脸部纵横比均衡，适合做大多数动漫角色的基础适配。";

          if (widthRatio > 0.95) {
            faceType = "田字 / 方圆脸";
            faceTypeDesc = "横向轮廓更明显，建议通过下颌柔化和高光纵向提亮增强角色精致感。";
          } else if (widthRatio < 0.78 && chinNarrow < 0.72) {
            faceType = "甲字 / 瓜子脸";
            faceTypeDesc = "下庭收束感更强，适合强化眼妆延展和角色尖下巴表达。";
          } else if (widthRatio < 0.84) {
            faceType = "由字 / 长脸";
            faceTypeDesc = "纵向比例更强，建议通过腮红位置和中庭提亮平衡视觉长度。";
          }

          const contourSummary =
            state.landmarks ? "外唇轮廓已提取" : "待识别";

          const contourDesc = state.landmarks
            ? `已提取嘴角、唇峰与外唇轮廓，估算唇宽约 ${lipWidth.toFixed(1)}px，可承载口红与唇峰细节映射。`
            : "等待外唇轮廓、唇峰与嘴角定位。";

          const styleSummary =
            reference
              ? `${reference.eyeShadowText} / ${preset.label}`
              : preset.label === "角色浓妆"
              ? "高对比眼妆 / 长眼尾角色风格"
              : preset.label === "新国风妆造"
                ? "暖金眼影 / 东方纹样风格"
                : "自然晕染 / 新手友好风格";

          const styleDesc = state.landmarks
            ? `已提取左右眼角、上下眼睑与眼裂高度；当前眼妆强度 ${values.eye}，眼裂开合度${eyeOpen > 0.028 ? "较明显" : "偏收束"}，${reference ? `建议向“${reference.keywords.join(" / ")}”靠拢。` : "可继续通过预设风格微调眼影与眼尾方向。"}`
            : "等待 FaceMesh 提取左右眼角、上下眼睑与眼裂高度。";

          const featureSummary =
            reference
              ? `${reference.blushText} / ${reference.specialText}`
              : values.glow > 62
                ? "高光强、纹理感偏舞台化"
                : values.glow > 48
                  ? "高光均衡、适合镜头表现"
                  : "高光轻量、强调自然皮感";

          const featureDesc = reference
            ? `角色图解析得到 ${reference.eyeShadowText}、${reference.blushText}、${reference.lipText} 与 ${reference.specialText}，当前会把这些信息用于妆面建议与预览叠加。`
            : "等待角色图参数后生成眼影、腮红、口红与特殊细节建议。";

          const adaptSummary =
            `${state.mode === "camera" ? "实时预览模式" : state.mode === "image" ? "图片模式" : "待机模式"} / ${profileLabel}`;

          const adaptDesc = `当前脸型为 ${faceType}，亚洲适配权重 ${values.asianFit}；建议采用“脸型权重 ${Math.round((1 - Math.abs(widthRatio - 0.84)) * 100)} / 风格权重 ${values.eye}”的方式执行角色融合，${reference ? `目标轮廓建议：${reference.contourTarget}。` : "上传角色图后会进一步细化轮廓方向。"}`

          if (analysisFaceType) analysisFaceType.textContent = faceType;
          if (analysisFaceTypeDesc) analysisFaceTypeDesc.textContent = faceTypeDesc;
          if (analysisContour) analysisContour.textContent = contourSummary;
          if (analysisContourDesc) analysisContourDesc.textContent = contourDesc;
          if (analysisStyle) analysisStyle.textContent = styleSummary;
          if (analysisStyleDesc) analysisStyleDesc.textContent = styleDesc;
          if (analysisFeature) analysisFeature.textContent = featureSummary;
          if (analysisFeatureDesc) analysisFeatureDesc.textContent = reference ? `${featureDesc} 角色主色板偏向 ${reference.palette.join(" / ")}。` : featureDesc;
          if (analysisAdapt) analysisAdapt.textContent = adaptSummary;
          if (analysisAdaptDesc) analysisAdaptDesc.textContent = adaptDesc;
          if (readoutProfile) readoutProfile.textContent = `${profileLabel} / ${values.asianFit}`;

          setTagList([
            faceType,
            preset.label,
            ...(reference ? [reference.archetype] : []),
            state.landmarks ? "FaceMesh 已识别" : "启发式轮廓",
            reference ? reference.blushText : (values.eye > 72 ? "高还原眼妆" : "渐层眼妆"),
            reference ? reference.specialText : (values.jaw > 64 ? "骨相柔化" : "原生保留"),
            profileLabel,
            values.glow > 60 ? "高光增强" : "高光平衡",
          ]);
        }

        function renderLoop() {
          state.frameTick += 1;
          renderAll();
          if (state.mode === "camera" && state.stream) {
            if (video.readyState >= 2 && state.frameTick % 8 === 0) {
              runFaceMesh(video);
            }
            state.animationId = window.requestAnimationFrame(renderLoop);
          }
        }

        function stopLoop() {
          if (state.animationId) {
            window.cancelAnimationFrame(state.animationId);
            state.animationId = 0;
          }
        }

        function stopCamera() {
          stopLoop();
          if (state.stream) {
            state.stream.getTracks().forEach((track) => track.stop());
            state.stream = null;
          }
          video.srcObject = null;
          if (state.mode === "camera") {
            state.mode = image.naturalWidth ? "image" : "placeholder";
            setStatus(state.mode === "image" ? "已关闭摄像头，保留当前图片预览" : "摄像头已关闭");
          }
          analyzeFace();
          renderAll();
        }

        async function startCamera() {
          try {
            stopCamera();
            state.stream = await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: "user",
                width: { ideal: 1280 },
                height: { ideal: 960 },
              },
              audio: false,
            });
            video.srcObject = state.stream;
            await video.play();
            state.mode = "camera";
            setStatus("摄像头已开启，正在实时预览");
            runFaceMesh(video);
            renderLoop();
          } catch (error) {
            console.error(error);
            setStatus("摄像头调用失败，请改用上传图片模式");
            renderAll();
          }
        }

        function applyPreset(name) {
          const preset = presets[name];
          if (!preset) {
            return;
          }

          state.preset = name;
          Object.entries(preset.values).forEach(([key, value]) => {
            if (ranges[key]) {
              ranges[key].value = String(value);
            }
          });
          syncOutputs();

          presetButtons.forEach((button) => {
            button.classList.toggle("is-active", button.dataset.preset === name);
          });

          if (state.referenceAnalysis) {
            updateReadoutsFromReference();
          } else {
            updateReadoutsForWaitingReference();
          }

          updateModel();
          analyzeFace();
          renderAll();
        }

        function updateModel() {
          if (!modelFace) {
            return;
          }

          const preset = presets[state.preset];
          const values = getValues();

          modelFace.style.setProperty("--accent-color", preset.colors.accent);
          modelFace.style.setProperty("--accent-soft-color", preset.colors.accentSoft);
          modelFace.style.setProperty("--eye-color", preset.colors.eyeModel);
          modelFace.style.setProperty("--jaw-scale", (1 - (values.jaw - 50) / 420).toFixed(3));
          modelFace.style.setProperty("--eye-scale", (0.82 + values.eye / 240).toFixed(3));
          modelFace.style.setProperty("--blush-pos", `${50 + (values.blush - 50) / 4}%`);
          modelFace.style.setProperty("--lip-alpha", (0.22 + values.lip / 120).toFixed(3));
          modelFace.style.setProperty("--glow-strength", (values.glow / 100).toFixed(3));
        }

        function freezeCurrentFrame() {
          if (state.mode !== "camera" || video.readyState < 2) {
            setStatus("请先开启摄像头，再定格画面");
            return;
          }

          const snapCanvas = document.createElement("canvas");
          snapCanvas.width = video.videoWidth;
          snapCanvas.height = video.videoHeight;
          snapCanvas.getContext("2d").drawImage(video, 0, 0);
          image.onload = () => {
            state.mode = "image";
            setStatus("已定格当前画面，可继续调参");
            stopCamera();
            runFaceMesh(image);
            analyzeFace();
            renderAll();
          };
          image.src = snapCanvas.toDataURL("image/png");
        }

        uploadInput.addEventListener("change", (event) => {
          const [file] = event.target.files || [];
          if (!file) {
            return;
          }

          stopCamera();
          const url = URL.createObjectURL(file);
          image.onload = () => {
            URL.revokeObjectURL(url);
            state.mode = "image";
            setStatus("已加载上传图片，可继续试妆");
            runFaceMesh(image);
            analyzeFace();
            renderAll();
          };
          image.src = url;
        });

        animeUploadInput?.addEventListener("change", (event) => {
          const [file] = event.target.files || [];
          if (!file) {
            return;
          }

          const url = URL.createObjectURL(file);
          animeReferenceImage.onload = () => {
            URL.revokeObjectURL(url);
            state.referenceLoaded = true;
            state.referenceName = file.name;
            analyzeReferenceImage(file.name);

            const reference = state.referenceAnalysis;
            if (reference) {
              if (reference.archetype.includes("国风")) {
                applyPreset("guofeng");
              } else if (reference.archetype.includes("高饱和")) {
                applyPreset("glam");
              } else {
                applyPreset("natural");
              }
            } else {
              updateReadoutsForWaitingReference();
              analyzeFace();
              renderAll();
            }
          };
          animeReferenceImage.src = url;
        });

        Object.entries(ranges).forEach(([key, input]) => {
          input.addEventListener("input", () => {
            if (rangeOutputs[key]) {
              rangeOutputs[key].textContent = input.value;
            }
            updateModel();
            analyzeFace();
            renderAll();
          });
        });

        presetButtons.forEach((button) => {
          button.addEventListener("click", () => applyPreset(button.dataset.preset));
        });

        startCameraBtn?.addEventListener("click", startCamera);
        stopCameraBtn?.addEventListener("click", stopCamera);
        captureFrameBtn?.addEventListener("click", freezeCurrentFrame);

        modelViewport?.addEventListener("mousemove", (event) => {
          const bounds = modelViewport.getBoundingClientRect();
          const dx = (event.clientX - bounds.left) / bounds.width - 0.5;
          const dy = (event.clientY - bounds.top) / bounds.height - 0.5;
          modelFigure.style.transform = `rotateY(${dx * 22}deg) rotateX(${dy * -18}deg)`;
        });

        modelViewport?.addEventListener("mouseleave", () => {
          modelFigure.style.transform = "rotateY(0deg) rotateX(0deg)";
        });

        window.addEventListener("resize", () => {
          renderReferencePreview();
          renderAll();
        });


        function initGeminiPolish() {
          const progress = document.querySelector(".scroll-progress");
          const navLinks = Array.from(document.querySelectorAll(".nav a[href^='#']"));
          const navSections = navLinks
            .map((link) => ({ link, section: document.querySelector(link.getAttribute("href")) }))
            .filter((item) => item.section);
          const promptText = document.getElementById("geminiPromptText");
          const prompts = [
            "上传角色图，我会生成适合真人脸型的妆造方案",
            "选择风格预设，实时查看眼妆、腮红与唇妆变化",
            "从项目定位到商业模式，像对话一样快速理解平台价值"
          ];
          let promptIndex = 0;

          const updateScrollState = () => {
            const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
            const ratio = Math.min(1, Math.max(0, window.scrollY / maxScroll));
            if (progress) {
              progress.style.width = `${ratio * 100}%`;
            }

            const active = navSections.find((item) => {
              const rect = item.section.getBoundingClientRect();
              return rect.top <= 170 && rect.bottom > 170;
            });
            navLinks.forEach((link) => link.classList.toggle("is-active", active?.link === link));
          };

          if (promptText && prompts.length > 1) {
            window.setInterval(() => {
              promptIndex = (promptIndex + 1) % prompts.length;
              promptText.textContent = prompts[promptIndex];
            }, 3200);
          }

          const revealTargets = document.querySelectorAll(
            ".hero__copy, .hero__side, .section-card, .cta, .module-card, .market-card, .target-card, .tech-card, .business-card, .timeline-card, .risk-card, .progress-card"
          );
          revealTargets.forEach((element) => element.classList.add("reveal"));

          if ("IntersectionObserver" in window) {
            const observer = new IntersectionObserver(
              (entries) => {
                entries.forEach((entry) => {
                  if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                  }
                });
              },
              { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
            );
            revealTargets.forEach((element) => observer.observe(element));
          } else {
            revealTargets.forEach((element) => element.classList.add("is-visible"));
          }

          document
            .querySelectorAll(".glass, .metric, .panel, .module-card, .market-card, .target-card, .tech-card, .business-card, .timeline-card, .risk-card, .progress-card, .demo-shell, .demo-controls, .analysis-shell")
            .forEach((card) => {
              card.addEventListener("pointermove", (event) => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
                card.style.setProperty("--my", `${event.clientY - rect.top}px`);
              });
            });

          window.addEventListener("scroll", updateScrollState, { passive: true });
          updateScrollState();
        }
        initGeminiPolish();
        syncOutputs();
        updateReadoutsForWaitingReference();
        applyPreset("natural");
        analyzeFace();
        renderReferencePreview();
        renderAll();
      })();

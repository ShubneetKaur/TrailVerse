import { useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  ArrowDownRight, ArrowLeft, ArrowRight, Check, ChevronDown, CircleHelp,
  Download, Frame, ImagePlus, RotateCcw, Sparkles, Upload, WandSparkles
} from "lucide-react";

const initial = {
  category: "Wall art",
  style: "Royal miniature",
  material: "Hand-painted canvas",
  frame: "Antique gold",
  palette: "Jewel tones",
  width: 24,
  height: 36,
  budget: "₹10,000 – ₹25,000",
  deadline: "Flexible",
  description: "",
};

const palettes = {
  "Jewel tones": ["#7d1f32", "#d2a64b", "#1d5b55", "#f5e7c9"],
  "Earth & clay": ["#9b5f42", "#c99a72", "#6d6b45", "#f2dfc3"],
  "Ivory & gold": ["#f6eddc", "#b39a62", "#d9c5a2", "#6b392f"],
  "Midnight": ["#20283b", "#8b5a76", "#c4a66a", "#eee4d3"],
};
const frameColors = {
  "Antique gold": "#b39a62",
  "Deep walnut": "#563728",
  "Matte black": "#292624",
  "Ivory": "#e9ddc8",
};
const styleNames = ["Royal miniature", "Botanical", "Abstract", "Portrait", "Folk art"];
const categories = ["Wall art", "Portrait", "Sculpture", "Decorative panel", "Textile art"];
const materials = ["Hand-painted canvas", "Archival paper", "Wood panel", "Metal relief", "Textile"];
const money = (v) => Number(v).toLocaleString("en-IN");

const paletteTint = {
  "Jewel tones": "#fff8f0",
  "Earth & clay": "#edc7a6",
  "Ivory & gold": "#fff0cf",
  "Midnight": "#c5c9dc",
};

const heritageArtwork = {
  "Basohli miniature": "https://commons.wikimedia.org/wiki/Special:FilePath/The_Diversion_of_the_Jamuna.jpg",
  "Kashmiri pashmina": "https://commons.wikimedia.org/wiki/Special:FilePath/Handwoven-kashmir-pashmina.jpg",
  "Pahari painting": "https://commons.wikimedia.org/wiki/Special:FilePath/Krishna_and_Gopas_playing_with_cowherds_on_the_banks_of_Yamuna_%3B_c_1780CE%3B_Basholi_school%3B_Government_Museum_and_Art_Gallery%2C_Chandigarh_%281%29.jpg",
  "Indian pottery": "https://commons.wikimedia.org/wiki/Special:FilePath/Earthen_pot.jpg",
};

// Build a local fallback texture immediately, then upgrade to the real reference photo
// when the remote image loads. A broken/offline image must never crash the WebGL scene.
function makeFallbackTexture(isTextile = false) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = isTextile ? "#7b2739" : "#efe2c8";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (isTextile) {
    for (let x = 0; x < 512; x += 24) {
      ctx.strokeStyle = x % 48 ? "#d6b66b" : "#f0dfb0";
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 768); ctx.stroke();
    }
    for (let y = 0; y < 768; y += 28) {
      ctx.strokeStyle = "rgba(244,224,176,.65)"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
    }
    ctx.strokeStyle = "#e6c66f"; ctx.lineWidth = 18; ctx.strokeRect(18, 18, 476, 732);
  } else {
    ctx.strokeStyle = "#9a7136"; ctx.lineWidth = 14; ctx.strokeRect(22, 22, 468, 724);
    ctx.strokeStyle = "#b13e43"; ctx.lineWidth = 5; ctx.strokeRect(42, 42, 428, 684);
    ctx.fillStyle = "#a13c43"; ctx.beginPath(); ctx.arc(256, 300, 105, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#d4ac55"; ctx.beginPath(); ctx.arc(256, 300, 70, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#255c50"; ctx.beginPath(); ctx.ellipse(210, 430, 34, 76, -.7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(302, 430, 34, 76, .7, 0, Math.PI * 2); ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function useSafeHeritageTexture(url, isTextile = false) {
  const fallback = useMemo(() => makeFallbackTexture(isTextile), [isTextile]);
  const [texture, setTexture] = useState(fallback);
  useEffect(() => {
    let active = true;
    setTexture(fallback);
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(url, loaded => {
      if (!active) { loaded.dispose(); return; }
      loaded.colorSpace = THREE.SRGBColorSpace;
      loaded.anisotropy = 8;
      setTexture(loaded);
    }, undefined, () => {
      // Keep the crafted local texture if the remote host is offline or blocks the image.
      if (active) setTexture(fallback);
    });
    return () => { active = false; };
  }, [url, fallback]);
  return texture;
}

function HeritageImage({ url, width, height, material, palette }) {
  const texture = useSafeHeritageTexture(url, false);
  const surface = material === "Metal relief";
  return <mesh position={[0, 0, 0.045]}>
    <planeGeometry args={[width, height]} />
    <meshStandardMaterial map={texture} roughness={material === "Textile" ? 0.98 : surface ? 0.38 : 0.82} metalness={surface ? 0.28 : 0} color={paletteTint[palette] || "#ffffff"} />
  </mesh>;
}

function PashminaDrape({ width, height, material, palette }) {
  const texture = useSafeHeritageTexture(heritageArtwork["Kashmiri pashmina"], true);
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(width, height, 42, 56);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const u = x / width + 0.5;
      const v = y / height + 0.5;
      const edge = Math.pow(Math.abs(u - 0.5) * 2, 1.6);
      const folds = Math.sin(u * Math.PI * 12 + v * 2.3) * 0.035 + Math.sin(u * Math.PI * 5) * 0.045;
      pos.setZ(i, folds * (0.3 + edge) + Math.sin(v * Math.PI) * 0.025);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, [width, height]);
  return <group rotation={[-0.08, 0.08, -0.05]} position={[0, 0, 0.02]}>
    {/* Soft, folded fabric rather than a framed picture. */}
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial map={texture} color={paletteTint[palette] || "#ffffff"} side={THREE.DoubleSide} roughness={material === "Textile" ? 1 : 0.86} metalness={0} />
    </mesh>
    <mesh geometry={geometry} position={[0, 0, -0.012]} scale={[0.985, 0.985, 1]}>
      <meshStandardMaterial color="#8f6c45" side={THREE.DoubleSide} roughness={1} wireframe={false} transparent opacity={0.12} />
    </mesh>
  </group>;
}

function PotteryVessel({ palette, material }) {
  const clay = palette === "Midnight" ? "#42424b" : palette === "Ivory & gold" ? "#c9a77b" : palette === "Jewel tones" ? "#a94f35" : "#ad6747";
  const geometry = useMemo(() => new THREE.LatheGeometry([
    new THREE.Vector2(0.28, -1.22), new THREE.Vector2(0.42, -1.15),
    new THREE.Vector2(0.66, -0.88), new THREE.Vector2(0.82, -0.45),
    new THREE.Vector2(0.84, -0.12), new THREE.Vector2(0.72, 0.25),
    new THREE.Vector2(0.48, 0.52), new THREE.Vector2(0.36, 0.78),
    new THREE.Vector2(0.38, 1.08), new THREE.Vector2(0.48, 1.12),
    new THREE.Vector2(0.48, 1.2), new THREE.Vector2(0.32, 1.2),
    new THREE.Vector2(0.3, 1.08), new THREE.Vector2(0.3, 0.83),
    new THREE.Vector2(0.42, 0.5), new THREE.Vector2(0.6, 0.2),
    new THREE.Vector2(0.68, -0.12), new THREE.Vector2(0.66, -0.42),
    new THREE.Vector2(0.48, -0.8), new THREE.Vector2(0.26, -1.0),
  ], 48), []);
  const isMetal = material === "Metal relief";
  return <group position={[0, -0.05, 0.05]} rotation={[0.04, -0.18, -0.04]}>
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color={clay} roughness={isMetal ? 0.3 : material === "Textile" ? 0.95 : 0.78} metalness={isMetal ? 0.4 : 0} side={THREE.DoubleSide} />
    </mesh>
    {[0.34, 0.45, 0.56, 0.68].map((radius, i) => <mesh key={i} position={[0, -0.15 + i * 0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.018, 8, 64]} />
      <meshStandardMaterial color={i % 2 ? "#e1c17d" : "#6c3528"} roughness={0.65} metalness={i % 2 ? 0.18 : 0} />
    </mesh>)}
    <mesh position={[0, 1.205, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.4, 0.035, 10, 48]} />
      <meshStandardMaterial color={clay} roughness={0.72} />
    </mesh>
  </group>;
}

function Artwork({ config }) {
  const colors = palettes[config.palette] || palettes["Jewel tones"];
  const frameColor = frameColors[config.frame] || frameColors["Antique gold"];
  const width = 2.35 * (config.width / 24);
  const height = 3.15 * (config.height / 36);
  const rail = 0.12;
  const isPashmina = config.style === "Kashmiri pashmina" || (config.category === "Textile art" && !heritageArtwork[config.style]);
  const isPottery = config.style === "Indian pottery";
  const realArtworkUrl = heritageArtwork[config.style];
  const backingColor = config.material === "Wood panel" ? "#76513a" : config.material === "Metal relief" ? "#7d6b51" : "#f3e7d1";

  if (isPottery) return <PotteryVessel palette={config.palette} material={config.material} />;

  if (isPashmina) {
    return <group scale={[1, 1, 1]}>
      <PashminaDrape width={width * 1.14} height={height * 0.94} material={config.material} palette={config.palette} />
      {/* A subtle woven edge picks up the selected palette and reads as a finished textile. */}
      <mesh position={[0, -height * 0.48, 0.04]}>
        <boxGeometry args={[width * 1.12, 0.055, 0.045]} />
        <meshStandardMaterial color={colors[1]} roughness={0.94} />
      </mesh>
      <mesh position={[0, height * 0.48, 0.04]}>
        <boxGeometry args={[width * 1.12, 0.055, 0.045]} />
        <meshStandardMaterial color={colors[1]} roughness={0.94} />
      </mesh>
    </group>;
  }

  return <group>
    <mesh position={[0, 0, -0.09]} castShadow receiveShadow>
      <boxGeometry args={[width + 0.22, height + 0.22, 0.12]} />
      <meshStandardMaterial color={frameColor} metalness={config.frame === "Antique gold" ? 0.68 : 0.22} roughness={0.36} />
    </mesh>
    {[
      [0, height / 2 + rail / 2, 0.01, width + 0.12, rail],
      [0, -height / 2 - rail / 2, 0.01, width + 0.12, rail],
      [-width / 2 - rail / 2, 0, 0.01, rail, height + 0.12],
      [width / 2 + rail / 2, 0, 0.01, rail, height + 0.12],
    ].map(([x,y,z,wx,hy], i) => <mesh key={i} position={[x,y,z]} castShadow>
      <boxGeometry args={[wx,hy,0.15]} />
      <meshStandardMaterial color={frameColor} metalness={config.frame === "Antique gold" ? 0.48 : 0.12} roughness={0.3} />
    </mesh>)}
    <mesh position={[0, 0, -0.015]}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial color={backingColor} roughness={0.92} />
    </mesh>
    {realArtworkUrl ? <HeritageImage url={realArtworkUrl} width={width * 0.94} height={height * 0.94} material={config.material} palette={config.palette} /> : <group position={[0, 0, 0.018]}>
      {config.style === "Botanical" ? <>
        <mesh position={[0, -0.25, 0.02]} rotation={[0,0,-0.12]}><cylinderGeometry args={[0.018,0.025,1.6,8]} /><meshStandardMaterial color={colors[2]} /></mesh>
        {Array.from({length: 8}, (_,i) => <mesh key={i} position={[(i%2 ? 1 : -1)*(0.12 + (i%3)*0.12), -0.5 + i*0.15, 0.035]} rotation={[0,0,(i%2 ? -1:1)*0.65]}><ellipseGeometry args={[0.16,0.07,20]} /><meshStandardMaterial color={i%3===0 ? colors[1] : colors[2]} roughness={0.85} /></mesh>)}
        <mesh position={[0.25,0.5,0.03]}><sphereGeometry args={[0.22,24,24]} /><meshStandardMaterial color={colors[0]} /></mesh>
      </> : config.style === "Abstract" ? <>
        <mesh position={[-0.18,0.32,0.03]} rotation={[0,0,0.32]}><circleGeometry args={[0.7,48]} /><meshStandardMaterial color={colors[0]} roughness={0.9} /></mesh>
        <mesh position={[0.28,-0.42,0.045]} rotation={[0,0,-0.25]}><boxGeometry args={[0.65,1.35,0.025]} /><meshStandardMaterial color={colors[2]} roughness={0.8} /></mesh>
        <mesh position={[0.18,0.42,0.07]}><torusGeometry args={[0.42,0.055,10,48]} /><meshStandardMaterial color={colors[1]} metalness={0.35} /></mesh>
      </> : config.style === "Portrait" ? <>
        <mesh position={[0,0.28,0.035]}><circleGeometry args={[0.42,40]} /><meshStandardMaterial color={colors[1]} roughness={0.9} /></mesh>
        <mesh position={[0,-0.62,0.025]}><coneGeometry args={[0.72,1.12,4]} /><meshStandardMaterial color={colors[0]} roughness={0.95} /></mesh>
        <mesh position={[0,0.31,0.075]}><circleGeometry args={[0.27,32]} /><meshStandardMaterial color="#b97956" roughness={0.95} /></mesh>
      </> : config.style === "Folk art" ? <>
        <mesh position={[0,0,0.03]}><circleGeometry args={[0.72,48]} /><meshStandardMaterial color={colors[0]} /></mesh>
        {Array.from({length: 12},(_,i)=><mesh key={i} position={[Math.cos(i*Math.PI/6)*0.49,Math.sin(i*Math.PI/6)*0.49,0.055]} rotation={[0,0,i*Math.PI/6]}><circleGeometry args={[0.13,24]} /><meshStandardMaterial color={i%2?colors[1]:colors[3]} /></mesh>)}
        <mesh position={[0,0,0.08]}><circleGeometry args={[0.18,32]} /><meshStandardMaterial color={colors[3]} /></mesh>
      </> : <>
        <mesh position={[0,0.12,0.03]}><circleGeometry args={[0.76,64]} /><meshStandardMaterial color={colors[0]} roughness={0.92} /></mesh>
        <mesh position={[0,-0.24,0.055]}><coneGeometry args={[0.48,0.9,3]} /><meshStandardMaterial color={colors[2]} roughness={0.85} /></mesh>
        <mesh position={[0,0.3,0.08]}><torusGeometry args={[0.43,0.035,8,48]} /><meshStandardMaterial color={colors[1]} metalness={0.35} /></mesh>
        <mesh position={[0,0.12,0.09]}><circleGeometry args={[0.15,32]} /><meshStandardMaterial color={colors[3]} /></mesh>
      </>}
    </group>}
    <mesh position={[0,0,0.11]}>
      <ringGeometry args={[Math.min(width,height)*0.39, Math.min(width,height)*0.395, 64]} />
      <meshStandardMaterial color={colors[1]} metalness={0.35} />
    </mesh>
  </group>;
}

function SectionTitle({ number, title, description }) {
  return <div className="section-title">
    <span className="section-number">{number}</span>
    <div><h2>{title}</h2>{description && <p>{description}</p>}</div>
  </div>;
}

export default function App({ onBackToHome }) {
  const [config, setConfig] = useState(initial);
  const [references, setReferences] = useState([]);
  const [status, setStatus] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInput = useRef(null);
  const colors = palettes[config.palette] || palettes["Jewel tones"];

  const update = (key, value) => setConfig((current) => ({ ...current, [key]: value }));
  const payload = useMemo(() => ({
    ...config,
    dimensions: { widthInches: Number(config.width), heightInches: Number(config.height) },
    referenceFiles: references.map(({ name, type, dataUrl }) => ({ name, type, dataUrl })),
    source: "virsa-custom-art-studio",
  }), [config, references]);

  const onFiles = async (event) => {
    const selected = Array.from(event.target.files || []);
    const imageFiles = selected.filter((f) => f.type.startsWith("image/")).slice(0, 5 - references.length);
    const converted = await Promise.all(imageFiles.map((file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ name: file.name, type: file.type, dataUrl: reader.result });
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    })));
    setReferences((prev) => [...prev, ...converted.filter(Boolean)].slice(0,5));
    event.target.value = "";
  };

  const submitBrief = async () => {
    setSubmitting(true);
    setStatus("");
    try {
      // API hook: set VITE_ART_BRIEF_API_URL to your endpoint.
      const endpoint = import.meta.env.VITE_ART_BRIEF_API_URL;
      if (!endpoint) {
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `virsa-art-brief-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setStatus("Your brief has been downloaded as JSON. It has not been sent to an artist or saved to a server yet.");
        setShowReview(false);
        return;
      }
      const token = localStorage.getItem("virsa_access_token");
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Request failed (${response.status})`);
      }
      setStatus("Your art brief was received by the configured API.");
      setShowReview(false);
    } catch (error) {
      setStatus(`We couldn't submit your brief: ${error.message}. Your details are still here—try again or download the JSON brief.`);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setConfig(initial);
    setReferences([]);
    setStatus("");
    setShowReview(false);
  };

  const returnHome = (event) => {
    event.preventDefault();
    if (onBackToHome) {
      onBackToHome();
      return;
    }
    window.location.assign("/");
  };

  return (
    <div className="custom-art-studio">
      <div className="app-shell">
      <header className="topbar">
        <a href="/" onClick={returnHome} className="brand" aria-label="VIRSA home">VIRSA<span className="brand-dot">.</span></a>
        <span className="brand-tagline">WHERE HERITAGE FINDS A HOME</span>
        <nav><a href="#studio">The Studio</a><a href="#process">Our Process</a><a href="#brief" className="nav-cta">Create your brief <ArrowDownRight size={15}/></a></nav>
      </header>

      <main>
        <section className="hero" id="studio">
          <div className="hero-copy">
            <div className="eyebrow"><span /> THE VIRSA CUSTOM ART STUDIO</div>
            <h1>Your imagination.<br/><em>Our artistry.</em></h1>
            <p className="hero-lede">A piece that begins with you. Shape your idea, explore a concept in 3D, and give our artists a brief that feels unmistakably yours.</p>
            <a href="#customize" className="primary-button">Begin your creation <ArrowRight size={16}/></a>
            <div className="hero-note"><Sparkles size={15}/> Crafted with intention. Made to belong.</div>
          </div>
          <div className="hero-art">
            <div className="hero-orbit orbit-one"></div><div className="hero-orbit orbit-two"></div>
            <div className="hero-art-label"><span>01 / YOUR VISION</span><span>MADE TO MEAN MORE</span></div>
            <div className="hero-sample">
              <div className="sample-frame">
                <div className="sample-art"><span className="sample-sun"></span><span className="sample-arch"></span><span className="sample-person"></span><span className="sample-ground"></span></div>
              </div>
            </div>
            <div className="floating-caption"><span className="caption-mark">✳</span><div><strong>One of a kind</strong><small>Designed around your story</small></div></div>
          </div>
        </section>

        <section className="studio-layout" id="customize">
          <div className="controls-column">
            <div className="studio-heading"><span className="eyebrow">THE CREATION DESK</span><h2>Make it <em>yours.</em></h2><p>Start with a feeling. Refine the details as you go.</p></div>
            <SectionTitle number="01" title="The art form" description="What would you like our artists to create?"/>
            <div className="field">
              <label htmlFor="category">Artwork category</label>
              <div className="select-wrap"><select id="category" value={config.category} onChange={e=>setConfig(current=>({...current,category:e.target.value, ...(e.target.value !== "Textile art" && current.style === "Kashmiri pashmina" ? {style:"Royal miniature",material: current.material === "Textile" ? "Hand-painted canvas" : current.material} : {})}))}>{categories.map(v=><option key={v}>{v}</option>)}</select><ChevronDown size={16}/></div>
            </div>
            <div className="heritage-gallery-block">
              <div className="heritage-gallery-heading"><span className="eyebrow">A LIVING HERITAGE</span><h3>Real art. <em>Real stories.</em></h3><p>Explore authentic works and craft traditions from across the Indian subcontinent. Choose one as inspiration for your commission.</p></div>
              <div className="heritage-gallery">
                <button type="button" className={`heritage-card ${config.style === "Kashmiri pashmina" ? "selected" : ""}`} aria-pressed={config.style === "Kashmiri pashmina"} onClick={()=>{update("style","Kashmiri pashmina");update("category","Textile art");update("material","Textile")}}>
                  <img src="https://commons.wikimedia.org/wiki/Special:FilePath/Handwoven-kashmir-pashmina.jpg" alt="Handwoven Kashmiri pashmina textile" loading="lazy"/><span className="heritage-card-copy"><small>KASHMIR · HANDWOVEN TEXTILE</small><strong>Kashmiri Pashmina</strong><em>Fine cashmere and heirloom weaving</em></span>
                </button>
                <button type="button" className={`heritage-card ${config.style === "Pahari painting" ? "selected" : ""}`} aria-pressed={config.style === "Pahari painting"} onClick={()=>setConfig(current=>({...current,style:"Pahari painting",category:"Wall art",material:current.material === "Textile" ? "Hand-painted canvas" : current.material}))}>
                  <img src="https://commons.wikimedia.org/wiki/Special:FilePath/Krishna_and_Gopas_playing_with_cowherds_on_the_banks_of_Yamuna_%3B_c_1780CE%3B_Basholi_school%3B_Government_Museum_and_Art_Gallery%2C_Chandigarh_%281%29.jpg" alt="Traditional Pahari miniature painting" loading="lazy"/><span className="heritage-card-copy"><small>PAHARI SCHOOL · C. 1780</small><strong>Pahari Painting</strong><em>Narrative scenes and mineral-rich colours</em></span>
                </button>
                <button type="button" className={`heritage-card ${config.style === "Indian pottery" ? "selected" : ""}`} aria-pressed={config.style === "Indian pottery"} onClick={()=>setConfig(current=>({...current,style:"Indian pottery",category:"Sculpture",material:current.material === "Textile" ? "Hand-painted canvas" : current.material}))}>
                  <img src="https://commons.wikimedia.org/wiki/Special:FilePath/Earthen_pot.jpg" alt="Traditional earthenware pot made in northern India" loading="lazy"/><span className="heritage-card-copy"><small>NORTHERN INDIA · TERRACOTTA</small><strong>Indian Pottery</strong><em>Hand-shaped clay with warm earthy finishes</em></span>
                </button>
              </div>
              <p className="heritage-credit">Artwork and craft references: Wikimedia Commons. Images are shown as inspiration; rights and attribution belong to their respective creators.</p>
            </div>
            <div className="field">
              <label htmlFor="material">Material / medium</label>
              <div className="select-wrap"><select id="material" value={config.material} onChange={e=>update("material",e.target.value)}>{materials.map(v=><option key={v}>{v}</option>)}</select><ChevronDown size={16}/></div>
            </div>

            <SectionTitle number="02" title="Finishing touches" description="Set the tone, texture, and scale."/>
            <div className="field">
              <label>Colour story</label>
              <div className="palette-list">{Object.entries(palettes).map(([name, swatches])=><button type="button" className={`palette-option ${config.palette===name?"selected":""}`} key={name} onClick={()=>update("palette",name)} aria-pressed={config.palette===name}><span className="swatches">{swatches.map(c=><i key={c} style={{background:c}}/>)}</span><span>{name}</span>{config.palette===name&&<Check size={14}/>}</button>)}</div>
            </div>
            <div className="field">
              <label>Frame finish</label>
              <div className="finish-list">{Object.entries(frameColors).map(([name,color])=><button type="button" className={`finish-option ${config.frame===name?"selected":""}`} key={name} onClick={()=>update("frame",name)} aria-pressed={config.frame===name}><i style={{background:color}}/><span>{name}</span></button>)}</div>
            </div>
            <div className="field">
              <div className="label-with-value"><label htmlFor="width">Dimensions (inches)</label><strong>{config.width}″ × {config.height}″</strong></div>
              <div className="dimension-inputs">
                <div><span>WIDTH</span><input id="width" type="range" min="12" max="48" step="2" value={config.width} onChange={e=>update("width",Number(e.target.value))}/></div>
                <div><span>HEIGHT</span><input aria-label="Height in inches" type="range" min="12" max="60" step="2" value={config.height} onChange={e=>update("height",Number(e.target.value))}/></div>
              </div>
            </div>

            <SectionTitle number="03" title="Your story" description="Tell us what makes this piece personal."/>
            <div className="field"><label htmlFor="description">The idea behind your artwork</label><textarea id="description" rows="4" maxLength="1200" placeholder="A memory, a place, a person, a feeling… share anything you'd like the artist to know." value={config.description} onChange={e=>update("description",e.target.value)}/><small className="character-count">{config.description.length}/1200</small></div>
            <div className="field">
              <label>Reference images <span className="optional">OPTIONAL · UP TO 5</span></label>
              <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={onFiles}/>
              <button type="button" className="upload-box" onClick={()=>fileInput.current?.click()} disabled={references.length>=5}><ImagePlus size={20}/><span><strong>Bring your inspiration</strong><small>Upload sketches, photos, colours or references</small></span><Upload size={17} className="upload-icon"/></button>
              {references.length>0&&<div className="file-list">{references.map((file,i)=><div key={`${file.name}-${i}`}><span>{file.name}</span><button type="button" onClick={()=>setReferences(r=>r.filter((_,idx)=>idx!==i))}>Remove</button></div>)}</div>}
            </div>
            <div className="field two-fields">
              <div><label htmlFor="budget">Budget range</label><div className="select-wrap"><select id="budget" value={config.budget} onChange={e=>update("budget",e.target.value)}>{["Under ₹10,000","₹10,000 – ₹25,000","₹25,000 – ₹50,000","₹50,000+","Let's discuss"].map(v=><option key={v}>{v}</option>)}</select><ChevronDown size={16}/></div></div>
              <div><label htmlFor="deadline">Timeline</label><div className="select-wrap"><select id="deadline" value={config.deadline} onChange={e=>update("deadline",e.target.value)}>{["Flexible","Within 2–4 weeks","Within 1–2 months","Specific date to discuss"].map(v=><option key={v}>{v}</option>)}</select><ChevronDown size={16}/></div></div>
            </div>
            <button className="primary-button submit-brief" type="button" onClick={()=>{setStatus("");setShowReview(true)}}>Review your art brief <ArrowRight size={16}/></button>
            <p className="privacy-note"><CircleHelp size={14}/> This is a concept request, not a final quote or purchase.</p>
          </div>

          <aside className="preview-column">
            <div className="preview-sticky">
              <div className="preview-topline"><div><span className="eyebrow">LIVE CONCEPT VIEW</span><h3>Your piece, taking shape.</h3></div><span className="live-indicator"><i/> INTERACTIVE 3D</span></div>
              <div className="viewer">
                <div className="viewer-grid"></div>
                <div className="viewer-badge"><Frame size={13}/> CONCEPT · NOT FINAL ART</div>
                <Canvas shadows camera={{position:[4.4,3.1,6.8],fov:38}} dpr={[1,1.7]}>
                  <color attach="background" args={["#eee6d8"]}/>
                  <ambientLight intensity={1.2}/>
                  <directionalLight position={[3,5,5]} intensity={2.3} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024}/>
                  <pointLight position={[-3,1,2]} intensity={0.65} color="#e7c88a"/>
                  <Artwork config={config}/>
                  <ContactShadows position={[0,-1.82,0]} opacity={0.35} scale={7} blur={2.8} far={3.8}/>
                  <Environment preset="studio"/>
                  <OrbitControls makeDefault enablePan={false} minDistance={4.2} maxDistance={11} minPolarAngle={0.45} maxPolarAngle={2.45}/>
                </Canvas>
                <div className="viewer-hint"><RotateCcw size={13}/> Drag to rotate · Scroll to zoom</div>
              </div>
              <div className="preview-specs"><div><span>ART DIRECTION</span><strong>{config.style}</strong></div><div><span>MEDIUM</span><strong>{config.material}</strong></div><div><span>SIZE</span><strong>{config.width}″ × {config.height}″</strong></div></div>
              <div className="preview-palette"><span>YOUR PALETTE</span><div>{colors.map(c=><i key={c} style={{background:c}}/>)}</div><strong>{config.palette}</strong></div>
              <div className="preview-disclaimer"><Sparkles size={15}/><p>The selected heritage reference is mapped onto the live 3D surface. Material, palette, frame finish and dimensions update this concept in real time; the final commission is refined with your artist.</p></div>
              <button type="button" className="reset-button" onClick={reset}><RotateCcw size={14}/> Reset studio</button>
            </div>
          </aside>
        </section>

        <section className="process-strip" id="process">
          <div><span>01</span><h3>Share your vision</h3><p>Tell us the story, style, and details that matter to you.</p></div>
          <div><span>02</span><h3>Artist review</h3><p>Your brief guides a conversation about feasibility and next steps.</p></div>
          <div><span>03</span><h3>Made for you</h3><p>Agree on the final design, quote, and timeline with the artist.</p></div>
        </section>
      </main>
      <footer><a href="/" onClick={returnHome} className="brand">VIRSA<span className="brand-dot">.</span></a><span>Where heritage finds a home.</span><span>MADE WITH MEANING · MADE FOR YOU</span></footer>

      {showReview&&<div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setShowReview(false)}}><section className="review-modal" role="dialog" aria-modal="true" aria-labelledby="review-title"><button type="button" className="modal-close" onClick={()=>setShowReview(false)} aria-label="Close">×</button><span className="eyebrow">BEFORE WE BEGIN</span><h2 id="review-title">Your art <em>brief.</em></h2><p className="review-intro">Take one last look. This is what will be shared with your integration endpoint—or downloaded for you to send manually.</p><div className="review-summary">{[["Category",config.category],["Style",config.style],["Material",config.material],["Palette",config.palette],["Frame",config.frame],["Dimensions",`${config.width} × ${config.height} inches`],["Budget",config.budget],["Timeline",config.deadline],["References",`${references.length} image(s)`]].map(([k,v])=><div key={k}><span>{k}</span><strong>{v}</strong></div>)}</div>{config.description&&<div className="review-description"><span>YOUR STORY</span><p>{config.description}</p></div>}<div className="modal-actions"><button className="secondary-button" onClick={()=>setShowReview(false)} type="button">Keep editing</button><button className="primary-button" disabled={submitting} onClick={submitBrief} type="button">{submitting?"Preparing…":import.meta.env.VITE_ART_BRIEF_API_URL?"Send art brief":"Download JSON brief"} {import.meta.env.VITE_ART_BRIEF_API_URL?<ArrowRight size={15}/>:<Download size={15}/>}</button></div><small className="modal-footnote">{import.meta.env.VITE_ART_BRIEF_API_URL?"The configured endpoint will receive your brief.":"No API is configured yet. This downloads a JSON file; nothing is sent to a server."}</small>{status&&<p className="status-message" role="status">{status}</p>}</section></div>}
      {status&&!showReview&&<div className="toast" role="status">{status}<button type="button" onClick={()=>setStatus("")}>Dismiss</button></div>}
      </div>
    </div>
  );
}
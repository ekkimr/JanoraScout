import { useState } from "react";

const SECTIONS = ["FEATURES", "METRICS", "PREREQUISITES", "HOW AI WORKS", "ROADMAP"];

const features = [
  {
    id: "F1",
    priority: "CORE",
    name: "Video Upload & Session Management",
    users: ["Coach", "Admin"],
    description: "Upload training session videos, tag players, date, and session type. The system stores and organizes videos by player and date automatically.",
    inputs: ["MP4/MOV video file", "Player roster", "Session date & type"],
    outputs: ["Stored session record", "Processing status", "Session timeline"],
    aiRole: false,
  },
  {
    id: "F2",
    priority: "CORE",
    name: "AI Player Detection & Tracking",
    users: ["System"],
    description: "AI automatically detects every player and the ball in each frame, assigns a persistent ID, and tracks movement throughout the video.",
    inputs: ["Raw video frames"],
    outputs: ["Player bounding boxes", "Ball coordinates", "Player trajectories"],
    aiRole: true,
    aiModel: "YOLOv8 + ByteTrack",
  },
  {
    id: "F3",
    priority: "CORE",
    name: "Passing Analysis",
    users: ["System", "Coach"],
    description: "Counts passes per player, measures accuracy (completed vs failed), and logs pass direction and distance.",
    inputs: ["Player + ball trajectories"],
    outputs: ["Pass count", "Pass accuracy %", "Pass map (heatmap)"],
    aiRole: true,
    aiModel: "Event Classification Model",
  },
  {
    id: "F4",
    priority: "CORE",
    name: "Shooting Analysis",
    users: ["System", "Coach"],
    description: "Detects shooting events — high-velocity ball toward goal. Logs shots on target vs off target, and shot position.",
    inputs: ["Ball velocity vector", "Goal coordinates"],
    outputs: ["Shot count", "On-target rate", "Shot map"],
    aiRole: true,
    aiModel: "Ball Velocity + Zone Classifier",
  },
  {
    id: "F5",
    priority: "CORE",
    name: "Sprint Detection",
    users: ["System", "Coach"],
    description: "Tracks player speed frame-by-frame. Logs sprint events when speed exceeds threshold, with duration and total distance covered.",
    inputs: ["Player position over time", "Camera calibration (px→meters)"],
    outputs: ["Sprint count", "Max speed (m/s)", "Total distance (m)"],
    aiRole: true,
    aiModel: "Speed Threshold + Tracking",
  },
  {
    id: "F6",
    priority: "CORE",
    name: "Dribbling Detection",
    users: ["System", "Coach"],
    description: "Detects when a player carries the ball past an opponent. Logs successful vs failed dribble attempts per player.",
    inputs: ["Ball-player proximity", "Opponent positions"],
    outputs: ["Dribble attempts", "Success rate", "Dribble zones"],
    aiRole: true,
    aiModel: "Proximity + Motion Classifier",
  },
  {
    id: "F7",
    priority: "CORE",
    name: "Ball Control Detection",
    users: ["System", "Coach"],
    description: "Measures first-touch quality — whether the ball stays within control range after being received. Success/failure per receive event.",
    inputs: ["Ball trajectory on receive", "Player foot position"],
    outputs: ["Control success rate", "Control events count"],
    aiRole: true,
    aiModel: "Ball Proximity + Pose Model",
  },
  {
    id: "F8",
    priority: "CORE",
    name: "Player Performance Dashboard",
    users: ["Coach", "Player"],
    description: "Per-player view showing all 5 metrics across sessions. Trend charts, session comparison, and performance score over time.",
    inputs: ["All processed session data"],
    outputs: ["Charts", "Trend lines", "Performance score"],
    aiRole: false,
  },
  {
    id: "F9",
    priority: "ENHANCED",
    name: "Auto-Clip Generator",
    users: ["Coach", "Player"],
    description: "Automatically cuts and labels video clips for each detected event. Coach can review 'all shots by Player 7' as a highlight reel.",
    inputs: ["Event timestamps", "Original video"],
    outputs: ["Tagged video clips", "Highlight reels"],
    aiRole: false,
  },
  {
    id: "F10",
    priority: "ENHANCED",
    name: "Session PDF Report",
    users: ["Coach", "Parent"],
    description: "Auto-generated PDF report per player per session, showing all metrics with charts and coaching notes.",
    inputs: ["Session metrics", "Coach notes"],
    outputs: ["Downloadable PDF report"],
    aiRole: false,
  },
  // ── GOALKEEPER METRICS ──
  {
    id: "GK1",
    priority: "CORE",
    name: "Save Detection",
    users: ["System", "Coach"],
    description: "Detects when the goalkeeper stops a shot on target. Logs save count, save zone (top-left, low-right etc.), and diving saves vs standing saves.",
    inputs: ["Shot event", "GK position", "Ball trajectory"],
    outputs: ["Save count", "Save zone map", "Save success rate"],
    aiRole: true,
    aiModel: "Ball Trajectory + GK Proximity",
    position: "GOALKEEPER",
  },
  {
    id: "GK2",
    priority: "CORE",
    name: "Distribution Analysis",
    users: ["System", "Coach"],
    description: "Tracks goalkeeper throws, kicks, and goal kicks. Measures distance, accuracy, and target zone. Key metric for modern goalkeepers.",
    inputs: ["Ball release from GK", "Target player position"],
    outputs: ["Distribution count", "Avg distance (m)", "Accuracy %"],
    aiRole: true,
    aiModel: "Ball Velocity + Zone Classifier",
    position: "GOALKEEPER",
  },
  {
    id: "GK3",
    priority: "ENHANCED",
    name: "Positioning & Angle Coverage",
    users: ["System", "Coach"],
    description: "Measures how well the GK positions relative to the ball and goal. Flags poor positioning before shots — key for coaching.",
    inputs: ["GK position", "Ball position", "Goal coordinates"],
    outputs: ["Coverage angle %", "Positioning score", "Risk zones flagged"],
    aiRole: true,
    aiModel: "Geometric Zone Model",
    position: "GOALKEEPER",
  },
  {
    id: "GK4",
    priority: "ENHANCED",
    name: "Claim & Punch Detection",
    users: ["System", "Coach"],
    description: "Detects aerial claims (GK catches cross) and punches. Logs success rate and area of pitch where aerial actions occur.",
    inputs: ["GK aerial movement", "Ball height estimation", "Cross events"],
    outputs: ["Claims won", "Punches count", "Aerial success rate"],
    aiRole: true,
    aiModel: "Pose + Ball Proximity",
    position: "GOALKEEPER",
  },
  {
    id: "GK5",
    priority: "FUTURE",
    name: "Reflex & Reaction Time",
    users: ["Coach"],
    description: "Measures time between shot detection and GK first movement. Advanced metric for evaluating reflex quality.",
    inputs: ["Shot timestamp", "GK body keypoints over time"],
    outputs: ["Reaction time (ms)", "Reflex score"],
    aiRole: true,
    aiModel: "Pose Estimation + Frame Timing",
    position: "GOALKEEPER",
  },

  // ── ADVANCED OUTFIELD METRICS ──
  {
    id: "A1",
    priority: "ENHANCED",
    name: "Tackles & Interceptions",
    users: ["System", "Coach"],
    description: "Detects defensive actions: tackles (player wins ball in ground duel) and interceptions (cuts off a pass). Key for evaluating defensive development.",
    inputs: ["Player proximity", "Ball possession change", "Opponent positions"],
    outputs: ["Tackle count", "Interception count", "Defensive actions map"],
    aiRole: true,
    aiModel: "Proximity + Possession Change Classifier",
  },
  {
    id: "A2",
    priority: "ENHANCED",
    name: "Distance Covered & Heatmap",
    users: ["System", "Coach"],
    description: "Total distance covered per session derived from tracking data. Includes high-speed running zones and positional heatmap showing where a player spends most time.",
    inputs: ["Player position trajectory (already tracked)"],
    outputs: ["Total distance (m)", "High-speed distance", "Pitch heatmap"],
    aiRole: false,
    note: "FREE — derived from existing tracking data",
  },
  {
    id: "A3",
    priority: "ENHANCED",
    name: "Aerial Duels",
    users: ["System", "Coach"],
    description: "Detects header contests — when two players jump for the ball. Logs won/lost per player. Important physical development marker for youth players.",
    inputs: ["Player height spike (jump detection)", "Ball height", "Proximity of two players"],
    outputs: ["Aerial duels count", "Win rate", "Zone of aerial contests"],
    aiRole: true,
    aiModel: "Pose (jump detection) + Ball Height",
  },
  {
    id: "A4",
    priority: "ENHANCED",
    name: "Key Passes & Progressive Passes",
    users: ["System", "Coach"],
    description: "Key passes: passes directly creating a shot opportunity. Progressive passes: forward passes advancing ball 10m+ into attacking zones. Measures creativity and vision.",
    inputs: ["Pass events", "Ball destination zone", "Shot events following pass"],
    outputs: ["Key pass count", "Progressive pass count", "Pass value map"],
    aiRole: true,
    aiModel: "Pass Event + Zone Classifier",
  },
  {
    id: "A5",
    priority: "ENHANCED",
    name: "Pressing Actions (PPDA)",
    users: ["System", "Coach"],
    description: "Counts how often a player actively presses the opponent in possession. PPDA (Passes Allowed Per Defensive Action) measures team pressing efficiency — a core modern tactical metric.",
    inputs: ["Player movement toward opponent with ball", "Ball possession data"],
    outputs: ["Press count", "PPDA score", "Press success rate"],
    aiRole: true,
    aiModel: "Movement Intent Classifier",
  },
  {
    id: "A6",
    priority: "FUTURE",
    name: "Expected Goals (xG) per Shot",
    users: ["System", "Coach"],
    description: "Calculates shot quality score (0–1) based on distance, angle, and defensive pressure at moment of shot. Distinguishes quality finishers from lucky ones.",
    inputs: ["Shot position", "Goal angle", "Defender proximity", "Shot type"],
    outputs: ["xG value per shot", "Total xG session", "Shot quality map"],
    aiRole: true,
    aiModel: "ML Regression Model (trained on shot outcomes)",
  },
  {
    id: "A7",
    priority: "FUTURE",
    name: "Possession Loss Location",
    users: ["System", "Coach"],
    description: "Logs exactly where and how each player loses the ball — bad touch, tackled, bad pass. Critical for decision-making analysis under pressure.",
    inputs: ["Ball possession change events", "Player position", "Context (press/no press)"],
    outputs: ["Turnover map", "Turnover count", "High-risk zone flags"],
    aiRole: true,
    aiModel: "Possession Change + Zone Classifier",
  },

  {
    id: "F11",
    priority: "FUTURE",
    name: "Pose & Technique Analysis",
    users: ["Coach"],
    description: "Body keypoint detection to analyze shooting form, sprint mechanics, and body posture. Gives technique-level feedback beyond counting events.",
    inputs: ["Player video frames"],
    outputs: ["Keypoint data", "Technique score", "Form feedback"],
    aiRole: true,
    aiModel: "MediaPipe Pose",
  },
  {
    id: "F12",
    priority: "FUTURE",
    name: "AI Coaching Suggestions",
    users: ["Coach"],
    description: "LLM-generated coaching insights based on player trends. e.g. 'Player 3 passing accuracy dropped 15% — suggest short-pass drills.'",
    inputs: ["Historical metric trends"],
    outputs: ["Text coaching suggestions"],
    aiRole: true,
    aiModel: "LLM (Claude / GPT)",
  },
];

const prerequisites = [
  {
    category: "HARDWARE",
    color: "#ff6b6b",
    items: [
      { name: "Camera(s)", detail: "Minimum 1080p, 30FPS. Wide-angle lens for full pitch coverage. Fixed tripod mount for stability. Second camera optional for tactical angle." },
      { name: "Recording Device", detail: "Camera with local SD card or direct NAS streaming. Consistent frame rate critical for accurate speed calculation." },
      { name: "Processing Server", detail: "GPU-enabled machine for AI inference. Minimum: NVIDIA RTX 3080 or equivalent. Cloud GPU (AWS/GCP) is alternative." },
      { name: "Storage", detail: "1 hour of 1080p ≈ 4–8GB. Plan for 2TB+ NAS or cloud bucket for 1 season of sessions." },
    ],
  },
  {
    category: "DATA",
    color: "#ffd93d",
    items: [
      { name: "Player Roster", detail: "Database of all students: name, ID, jersey number/color, team. Required for linking detections to real players." },
      { name: "Pitch Calibration", detail: "One-time setup: map camera pixels to real-world pitch coordinates using calibration markers. Enables accurate distance/speed." },
      { name: "Training Labels (optional)", detail: "If customizing the AI model: ~500–1000 labeled video clips of passes, shots, etc. Can start with pre-trained models first." },
      { name: "Baseline Sessions", detail: "First 2–4 sessions are calibration data. AI improves as it learns your specific pitch, lighting, and jersey colors." },
    ],
  },
  {
    category: "SOFTWARE & SKILLS",
    color: "#00ff87",
    items: [
      { name: "Python (Data Scientist)", detail: "Core language for AI pipeline. Libraries: OpenCV, Ultralytics (YOLOv8), supervision, NumPy, pandas." },
      { name: "ML Framework", detail: "PyTorch for model fine-tuning. Pre-trained YOLOv8 weights available out-of-the-box — minimal training needed to start." },
      { name: "Backend Developer", detail: "FastAPI or Django for the API layer. Manages video uploads, triggers AI pipeline, serves results to dashboard." },
      { name: "Frontend Developer", detail: "React + charting library (Recharts/Chart.js) for the dashboard. Video player with clip review capability." },
      { name: "Database", detail: "PostgreSQL for structured data. Basic SQL knowledge needed. TimescaleDB extension for time-series tracking data." },
    ],
  },
  {
    category: "ENVIRONMENT",
    color: "#c77dff",
    items: [
      { name: "Consistent Lighting", detail: "Outdoor: minimize sessions in harsh midday shadow or rain. Indoor: uniform artificial lighting. Lighting consistency = better detection accuracy." },
      { name: "Jersey Differentiation", detail: "Players wear numbered/colored jerseys. Consistent colors per session help the tracking model maintain player IDs." },
      { name: "Camera Position Rules", detail: "Camera must not be moved mid-session. Calibration is per camera angle — moving it breaks metric calculations." },
    ],
  },
];

const aiSteps = [
  {
    step: "01",
    name: "Frame Extraction",
    color: "#60efff",
    icon: "🎬",
    what: "The video is split into individual image frames at 25–30 frames per second.",
    why: "AI models work on still images. Each frame becomes an input for detection.",
    tool: "FFmpeg + OpenCV",
    analogy: "Like flipping through a flipbook — each page is analyzed separately.",
  },
  {
    step: "02",
    name: "Object Detection",
    color: "#00ff87",
    icon: "🔍",
    what: "YOLOv8 scans each frame and draws bounding boxes around every player and the ball.",
    why: "Before tracking or measuring anything, the AI must know where each object is.",
    tool: "YOLOv8 (pre-trained on COCO + sports fine-tune)",
    analogy: "Like a very fast spotter who circles every player and the ball in each photograph.",
  },
  {
    step: "03",
    name: "Player Tracking",
    color: "#ffd93d",
    icon: "🏃",
    what: "ByteTrack links the same player across consecutive frames, assigning a consistent ID (e.g. 'Player_07') throughout the video.",
    why: "Detection alone forgets who is who between frames. Tracking maintains identity.",
    tool: "ByteTrack / DeepSORT",
    analogy: "Like tagging each player with an invisible GPS tracker so we always know it's the same person.",
  },
  {
    step: "04",
    name: "Coordinate Mapping",
    color: "#ff9f43",
    icon: "📐",
    what: "Pixel coordinates from the camera are converted to real-world pitch coordinates (meters) using a calibration homography matrix.",
    why: "Without this, we can't measure real speed or distance — only pixel positions.",
    tool: "OpenCV homography",
    analogy: "Like converting a map's grid coordinates to real GPS locations.",
  },
  {
    step: "05",
    name: "Event Classification",
    color: "#ff6b6b",
    icon: "⚡",
    what: "A classifier watches the relationships between player positions, ball trajectory, and speed to detect specific events: pass, shot, sprint, dribble, control.",
    why: "This is the core intelligence — translating raw positions into meaningful football actions.",
    tool: "Custom rule engine + lightweight ML classifier",
    analogy: "Like a football analyst who watches the same video and marks a tally every time something specific happens.",
    rules: [
      "PASS: Ball travels from Player A → Player B with separation > X meters",
      "SHOT: Ball velocity > threshold, directed at goal zone",
      "SPRINT: Player speed > 7 m/s for > 1 second",
      "DRIBBLE: Player + ball move together past opponent bounding box",
      "CONTROL: Ball stays within 1m of player for 3+ frames after receive",
    ],
  },
  {
    step: "06",
    name: "Data Aggregation",
    color: "#c77dff",
    icon: "📊",
    what: "All detected events are timestamped, linked to a player ID, and written to the database. Stats are calculated: totals, rates, averages.",
    why: "Raw events need to be summarized into meaningful metrics coaches can act on.",
    tool: "Python + PostgreSQL",
    analogy: "Like a statistician tallying up every event from a match and producing the final stats sheet.",
  },
  {
    step: "07",
    name: "Dashboard Rendering",
    color: "#00d2ff",
    icon: "📱",
    what: "The web dashboard reads player stats from the database and renders charts, heatmaps, and video clips per player per session.",
    why: "Data only has value when coaches and players can see and understand it.",
    tool: "React + Recharts + Video Player",
    analogy: "Like publishing the stats sheet as an interactive report anyone can read on their phone.",
  },
];

const roadmap = [
  {
    phase: "PHASE 1",
    duration: "4–6 weeks",
    title: "Foundation",
    color: "#00ff87",
    deliverables: [
      "Camera setup & pitch calibration",
      "YOLOv8 detection working on sample footage",
      "Player tracking with ByteTrack",
      "Sprint + passing detection (rules-based)",
      "Basic database schema",
    ],
    milestone: "AI correctly detects & tracks players in a test session",
  },
  {
    phase: "PHASE 2",
    duration: "4–6 weeks",
    title: "Core Metrics",
    color: "#60efff",
    deliverables: [
      "Shooting, dribbling, ball control detectors",
      "Event logging to database",
      "Simple coach dashboard (web)",
      "Per-player session summary view",
      "Manual correction tool for coach",
    ],
    milestone: "All 5 metrics live for a real training session",
  },
  {
    phase: "PHASE 3",
    duration: "3–4 weeks",
    title: "Polish & Reports",
    color: "#ffd93d",
    deliverables: [
      "Auto-clip generator for events",
      "PDF report generation",
      "Player progress trend charts",
      "Multi-session comparison view",
      "User accounts (coach / player login)",
    ],
    milestone: "Coaches can share PDF reports with players & parents",
  },
  {
    phase: "PHASE 4",
    duration: "Ongoing",
    title: "Intelligence Layer",
    color: "#c77dff",
    deliverables: [
      "Pose estimation for technique analysis",
      "AI coaching suggestions (LLM-powered)",
      "Model fine-tuning on academy's own footage",
      "Mobile app for players",
      "Team-level analytics",
    ],
    milestone: "Product becomes a competitive advantage for the academy",
  },
];

const priorityColor = { CORE: "#00ff87", ENHANCED: "#ffd93d", FUTURE: "#c77dff" };

export default function App() {
  const [section, setSection] = useState("FEATURES");
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);
  const [filter, setFilter] = useState("ALL");

  return (
    <div style={{
      minHeight: "100vh",
      background: "#07090d",
      fontFamily: "'DM Mono', monospace",
      color: "#d0d4dc",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #222; }
        .nav-btn { transition: all 0.2s; cursor: pointer; }
        .nav-btn:hover { opacity: 1 !important; }
        .card { transition: border-color 0.2s, transform 0.15s; cursor: pointer; }
        .card:hover { border-color: #2a3040 !important; transform: translateY(-1px); }
        .step-card { transition: all 0.2s; cursor: pointer; }
        .step-card:hover { opacity: 1 !important; }
        .filter-btn { transition: all 0.15s; cursor: pointer; }
      `}</style>

      {/* Top Header */}
      <div style={{ background: "#0b0e14", borderBottom: "1px solid #13181f", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: 1 }}>
            ⚽ SCOUT<span style={{ color: "#00ff87" }}>AI</span>
          </div>
          <div style={{ fontSize: 9, color: "#444", letterSpacing: 3, marginTop: 2 }}>FOOTBALL ACADEMY — PRODUCT BLUEPRINT</div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {SECTIONS.map((s) => (
            <button
              key={s}
              className="nav-btn"
              onClick={() => setSection(s)}
              style={{
                background: section === s ? "#00ff87" : "transparent",
                color: section === s ? "#07090d" : "#444",
                border: `1px solid ${section === s ? "#00ff87" : "#1a1f28"}`,
                padding: "6px 14px",
                fontSize: 9,
                letterSpacing: 2,
                cursor: "pointer",
                borderRadius: 3,
                fontFamily: "inherit",
                fontWeight: section === s ? 500 : 300,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "32px", maxWidth: 1100, margin: "0 auto" }}>

        {/* ── FEATURES ── */}
        {section === "FEATURES" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#fff" }}>Main Features</div>
              <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>Click any feature to see inputs, outputs, and AI role</div>
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                {["ALL", "CORE", "ENHANCED", "FUTURE", "GOALKEEPER"].map((f) => (
                  <button key={f} className="filter-btn" onClick={() => setFilter(f)} style={{
                    background: filter === f ? (f === "GOALKEEPER" ? "#ff9f43" : priorityColor[f] || "#fff") : "transparent",
                    color: filter === f ? "#07090d" : "#555",
                    border: `1px solid ${filter === f ? (f === "GOALKEEPER" ? "#ff9f43" : priorityColor[f] || "#fff") : "#1a1f28"}`,
                    padding: "4px 12px", fontSize: 9, letterSpacing: 2, borderRadius: 2, fontFamily: "inherit",
                  }}>{f}</button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {features.filter(f => filter === "ALL" || f.priority === filter || (filter === "GOALKEEPER" && f.position === "GOALKEEPER")).map((f) => (
                <div key={f.id} className="card" onClick={() => setSelectedFeature(selectedFeature?.id === f.id ? null : f)}
                  style={{
                    background: selectedFeature?.id === f.id ? "#0f1520" : "#0b0e14",
                    border: `1px solid ${selectedFeature?.id === f.id ? priorityColor[f.priority] : "#13181f"}`,
                    borderLeft: `3px solid ${priorityColor[f.priority]}`,
                    borderRadius: 4, padding: "16px 18px",
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ fontSize: 9, color: "#444", letterSpacing: 2 }}>{f.id}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {f.position === "GOALKEEPER" && <span style={{ fontSize: 8, padding: "2px 7px", background: "#1f1200", color: "#ff9f43", border: "1px solid #3a2000", borderRadius: 2, letterSpacing: 1 }}>GK</span>}
                      {f.aiRole && <span style={{ fontSize: 8, padding: "2px 7px", background: "#0d1f0f", color: "#00ff87", border: "1px solid #0d3015", borderRadius: 2, letterSpacing: 1 }}>AI</span>}
                      <span style={{ fontSize: 8, padding: "2px 7px", background: "transparent", color: priorityColor[f.priority], border: `1px solid ${priorityColor[f.priority]}22`, borderRadius: 2, letterSpacing: 1 }}>{f.priority}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "#e0e4ed", fontWeight: 500, marginBottom: 6 }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: "#555", lineHeight: 1.6 }}>{f.description}</div>

                  {selectedFeature?.id === f.id && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #13181f" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 6 }}>INPUTS</div>
                          {f.inputs.map((i, idx) => <div key={idx} style={{ fontSize: 10, color: "#60efff", marginBottom: 3 }}>→ {i}</div>)}
                        </div>
                        <div>
                          <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 6 }}>OUTPUTS</div>
                          {f.outputs.map((o, idx) => <div key={idx} style={{ fontSize: 10, color: "#00ff87", marginBottom: 3 }}>← {o}</div>)}
                        </div>
                      </div>
                      {f.aiRole && (
                        <div style={{ padding: "8px 12px", background: "#0d1f0f", border: "1px solid #0d3015", borderRadius: 3 }}>
                          <span style={{ fontSize: 9, color: "#555", letterSpacing: 2 }}>AI MODEL  </span>
                          <span style={{ fontSize: 11, color: "#00ff87" }}>{f.aiModel}</span>
                        </div>
                      )}
                      <div style={{ marginTop: 8, fontSize: 9, color: "#444", letterSpacing: 1 }}>
                        USERS: {f.users.join("  ·  ")}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PREREQUISITES ── */}
        {/* ── METRICS ── */}
        {section === "METRICS" && (() => {
          const metricGroups = [
            {
              label: "CORE OUTFIELD (Original 5)",
              color: "#00ff87",
              icon: "⚽",
              items: [
                { name: "Passing", capture: "✅ Video", difficulty: "Easy", detail: "Count, accuracy %, direction, distance. Ball A→B between players." },
                { name: "Shooting", capture: "✅ Video", difficulty: "Easy", detail: "Count, on-target rate, shot map. High-velocity ball toward goal." },
                { name: "Sprint", capture: "✅ Video", difficulty: "Easy", detail: "Count, max speed (m/s), distance. Derived from tracking." },
                { name: "Dribbling", capture: "✅ Video", difficulty: "Medium", detail: "Attempts, success rate, zone. Ball+player past opponent." },
                { name: "Ball Control", capture: "✅ Video", difficulty: "Medium", detail: "First-touch success rate. Ball stays within 1m after receive." },
              ],
            },
            {
              label: "ADVANCED OUTFIELD",
              color: "#60efff",
              icon: "📊",
              items: [
                { name: "Tackles", capture: "✅ Video", difficulty: "Medium", detail: "Player wins ball in ground duel. Defensive development marker." },
                { name: "Interceptions", capture: "✅ Video", difficulty: "Medium", detail: "Cuts off a pass before it reaches opponent. Anticipation metric." },
                { name: "Distance Covered", capture: "✅ Video", difficulty: "Free", detail: "Total meters per session. Derived from existing tracking — no extra work." },
                { name: "Heatmap", capture: "✅ Video", difficulty: "Free", detail: "Pitch zones where player spends most time. Derived from tracking." },
                { name: "Aerial Duels", capture: "✅ Video", difficulty: "Medium", detail: "Header contests won/lost. Needs jump detection via pose model." },
                { name: "Key Passes", capture: "✅ Video", difficulty: "Medium", detail: "Pass directly creating shot opportunity. Creative player metric." },
                { name: "Progressive Passes", capture: "✅ Video", difficulty: "Medium", detail: "Forward passes advancing ball 10m+ into attack zones." },
                { name: "Pressing (PPDA)", capture: "✅ Video", difficulty: "Hard", detail: "Pressing efficiency: passes allowed per defensive action." },
                { name: "xG per Shot", capture: "✅ Video", difficulty: "Hard", detail: "Shot quality score based on position, angle, pressure. Needs ML model." },
                { name: "Possession Loss Location", capture: "✅ Video", difficulty: "Hard", detail: "Where/how player loses the ball. Decision-making under pressure." },
              ],
            },
            {
              label: "GOALKEEPER METRICS",
              color: "#ff9f43",
              icon: "🧤",
              items: [
                { name: "Saves", capture: "✅ Video", difficulty: "Easy", detail: "Count, save zone map (top/low/left/right), diving vs standing." },
                { name: "Distribution", capture: "✅ Video", difficulty: "Easy", detail: "Throws, kicks, goal kicks — distance, accuracy, target zone." },
                { name: "Positioning / Angle", capture: "✅ Video", difficulty: "Medium", detail: "GK angle coverage relative to ball + goal. Flags poor positioning." },
                { name: "Aerial Claims & Punches", capture: "✅ Video", difficulty: "Medium", detail: "Crosses claimed or punched. Aerial dominance metric." },
                { name: "Reflex / Reaction Time", capture: "✅ Video", difficulty: "Hard", detail: "Time from shot to GK first movement. Needs pose + frame timing." },
                { name: "xGP (Goals Prevented)", capture: "✅ Video", difficulty: "Hard", detail: "Saves vs expected — did GK outperform or underperform shot quality?" },
              ],
            },
            {
              label: "REQUIRES WEARABLES (Not Video-Capturable)",
              color: "#ff6b6b",
              icon: "❌",
              items: [
                { name: "Heart Rate", capture: "❌ Wearable", difficulty: "N/A", detail: "Internal load monitoring. Requires HR strap or GPS vest." },
                { name: "Metabolic Power", capture: "❌ Wearable", difficulty: "N/A", detail: "Energy expenditure. Requires GPS + accelerometer sensors." },
                { name: "Muscle Fatigue", capture: "❌ Wearable", difficulty: "N/A", detail: "Biometric indicator. Requires specialized wearables (e.g. Catapult)." },
              ],
            },
          ];

          const diffColor = { Easy: "#00ff87", Medium: "#ffd93d", Hard: "#ff9f43", Free: "#60efff", "N/A": "#ff6b6b" };

          return (
            <div>
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#fff" }}>Full Metrics Library</div>
                <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>All capturable metrics — outfield, goalkeeper, and beyond</div>
                <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
                  {[["✅ Video Only", "#00ff87"], ["❌ Wearable Needed", "#ff6b6b"], ["Free from tracking", "#60efff"]].map(([label, color]) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "#555" }}>
                      <div style={{ width: 8, height: 8, background: color, borderRadius: "50%" }} />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
              {metricGroups.map((group) => (
                <div key={group.label} style={{ marginBottom: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{ height: 1, width: 20, background: group.color }} />
                    <div style={{ fontSize: 10, color: group.color, letterSpacing: 3 }}>{group.icon} {group.label}</div>
                    <div style={{ height: 1, flex: 1, background: `${group.color}22` }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    {group.items.map((item) => (
                      <div key={item.name} style={{ padding: "12px 14px", background: "#0b0e14", border: "1px solid #13181f", borderLeft: `3px solid ${group.color}`, borderRadius: 4 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <div style={{ fontSize: 12, color: "#e0e4ed", fontWeight: 500 }}>{item.name}</div>
                          <div style={{ fontSize: 8, padding: "2px 6px", border: `1px solid ${diffColor[item.difficulty]}44`, color: diffColor[item.difficulty], borderRadius: 2, letterSpacing: 1 }}>{item.difficulty}</div>
                        </div>
                        <div style={{ fontSize: 9, color: "#444", marginBottom: 4, letterSpacing: 1 }}>{item.capture}</div>
                        <div style={{ fontSize: 10, color: "#555", lineHeight: 1.6 }}>{item.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        {section === "PREREQUISITES" && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#fff" }}>Prerequisites</div>
              <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>What you need before building begins</div>
            </div>
            {prerequisites.map((cat) => (
              <div key={cat.category} style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 10, color: cat.color, letterSpacing: 3, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ height: 1, width: 24, background: cat.color }} />
                  {cat.category}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {cat.items.map((item, i) => (
                    <div key={i} style={{ padding: "14px 16px", background: "#0b0e14", border: "1px solid #13181f", borderLeft: `3px solid ${cat.color}`, borderRadius: 4 }}>
                      <div style={{ fontSize: 12, color: "#e0e4ed", fontWeight: 500, marginBottom: 6 }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: "#555", lineHeight: 1.7 }}>{item.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── HOW AI WORKS ── */}
        {section === "HOW AI WORKS" && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#fff" }}>How The AI Works</div>
              <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>Step-by-step: from raw video to player stats</div>
            </div>

            {/* Flow bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 28, overflowX: "auto", paddingBottom: 8 }}>
              {aiSteps.map((s, i) => (
                <div key={s.step} style={{ display: "flex", alignItems: "center" }}>
                  <div className="step-card" onClick={() => setSelectedStep(selectedStep?.step === s.step ? null : s)}
                    style={{
                      padding: "8px 14px", background: selectedStep?.step === s.step ? s.color : "#0b0e14",
                      border: `1px solid ${selectedStep?.step === s.step ? s.color : "#13181f"}`,
                      borderRadius: 3, cursor: "pointer", whiteSpace: "nowrap",
                      opacity: selectedStep && selectedStep.step !== s.step ? 0.4 : 1,
                    }}>
                    <div style={{ fontSize: 8, color: selectedStep?.step === s.step ? "#07090d" : "#444", letterSpacing: 2, marginBottom: 2 }}>{s.step}</div>
                    <div style={{ fontSize: 10, color: selectedStep?.step === s.step ? "#07090d" : s.color, fontWeight: 500 }}>{s.icon} {s.name}</div>
                  </div>
                  {i < aiSteps.length - 1 && <div style={{ fontSize: 12, color: "#1a1f28", padding: "0 4px" }}>▶</div>}
                </div>
              ))}
            </div>

            {/* Detail panel */}
            {selectedStep ? (
              <div style={{ padding: 24, background: "#0b0e14", border: `1px solid ${selectedStep.color}33`, borderLeft: `4px solid ${selectedStep.color}`, borderRadius: 4 }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: selectedStep.color, marginBottom: 4 }}>
                  {selectedStep.icon} {selectedStep.name}
                </div>
                <div style={{ fontSize: 12, color: "#666", fontStyle: "italic", marginBottom: 20 }}>"{selectedStep.analogy}"</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 9, color: "#444", letterSpacing: 2, marginBottom: 8 }}>WHAT HAPPENS</div>
                    <div style={{ fontSize: 12, color: "#bbb", lineHeight: 1.7 }}>{selectedStep.what}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: "#444", letterSpacing: 2, marginBottom: 8 }}>WHY IT MATTERS</div>
                    <div style={{ fontSize: 12, color: "#bbb", lineHeight: 1.7 }}>{selectedStep.why}</div>
                  </div>
                </div>
                <div style={{ padding: "10px 14px", background: "#07090d", border: "1px solid #13181f", borderRadius: 3, display: "inline-block" }}>
                  <span style={{ fontSize: 9, color: "#444", letterSpacing: 2 }}>TOOL / MODEL  </span>
                  <span style={{ fontSize: 11, color: selectedStep.color }}>{selectedStep.tool}</span>
                </div>
                {selectedStep.rules && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 9, color: "#444", letterSpacing: 2, marginBottom: 10 }}>DETECTION RULES</div>
                    {selectedStep.rules.map((r, i) => (
                      <div key={i} style={{ fontSize: 11, color: "#666", padding: "6px 12px", background: "#07090d", border: "1px solid #13181f", borderRadius: 3, marginBottom: 4 }}>
                        <span style={{ color: selectedStep.color }}>▸ </span>{r}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: 24, background: "#0b0e14", border: "1px dashed #13181f", borderRadius: 4, textAlign: "center", color: "#2a3040" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🤖</div>
                <div style={{ fontSize: 11, letterSpacing: 2 }}>SELECT A STEP ABOVE TO SEE HOW IT WORKS</div>
              </div>
            )}

            {/* Summary table */}
            <div style={{ marginTop: 28 }}>
              <div style={{ fontSize: 9, color: "#444", letterSpacing: 3, marginBottom: 12 }}>ALL STEPS AT A GLANCE</div>
              <div style={{ border: "1px solid #13181f", borderRadius: 4, overflow: "hidden" }}>
                {aiSteps.map((s, i) => (
                  <div key={s.step} style={{ display: "grid", gridTemplateColumns: "60px 180px 1fr 150px", gap: 0, borderBottom: i < aiSteps.length - 1 ? "1px solid #0f1218" : "none" }}>
                    <div style={{ padding: "10px 14px", borderRight: "1px solid #0f1218", fontSize: 10, color: s.color }}>{s.step}</div>
                    <div style={{ padding: "10px 14px", borderRight: "1px solid #0f1218", fontSize: 11, color: "#bbb" }}>{s.icon} {s.name}</div>
                    <div style={{ padding: "10px 14px", borderRight: "1px solid #0f1218", fontSize: 10, color: "#555" }}>{s.what.substring(0, 80)}...</div>
                    <div style={{ padding: "10px 14px", fontSize: 10, color: "#444" }}>{s.tool}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ROADMAP ── */}
        {section === "ROADMAP" && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#fff" }}>Build Roadmap</div>
              <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>4 phases from prototype to intelligent product</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {roadmap.map((phase, i) => (
                <div key={i} style={{ padding: 20, background: "#0b0e14", border: `1px solid #13181f`, borderTop: `3px solid ${phase.color}`, borderRadius: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 9, color: phase.color, letterSpacing: 3, marginBottom: 4 }}>{phase.phase}</div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: "#fff" }}>{phase.title}</div>
                    </div>
                    <div style={{ fontSize: 9, color: "#444", padding: "4px 10px", border: "1px solid #13181f", borderRadius: 2 }}>{phase.duration}</div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    {phase.deliverables.map((d, j) => (
                      <div key={j} style={{ fontSize: 11, color: "#666", padding: "5px 0", borderBottom: "1px solid #0f1218", display: "flex", gap: 8 }}>
                        <span style={{ color: phase.color }}>✓</span> {d}
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: "10px 12px", background: `${phase.color}0d`, border: `1px solid ${phase.color}22`, borderRadius: 3 }}>
                    <div style={{ fontSize: 9, color: "#444", letterSpacing: 2, marginBottom: 4 }}>MILESTONE</div>
                    <div style={{ fontSize: 11, color: phase.color }}>{phase.milestone}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total timeline */}
            <div style={{ marginTop: 24, padding: 20, background: "#0b0e14", border: "1px solid #13181f", borderRadius: 4 }}>
              <div style={{ fontSize: 9, color: "#444", letterSpacing: 3, marginBottom: 16 }}>TOTAL TIMELINE ESTIMATE</div>
              <div style={{ display: "flex", gap: 0 }}>
                {roadmap.map((p, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ height: 8, background: p.color, marginRight: i < 3 ? 2 : 0, borderRadius: i === 0 ? "4px 0 0 4px" : i === 3 ? "0 4px 4px 0" : 0 }} />
                    <div style={{ fontSize: 9, color: p.color, marginTop: 6 }}>{p.phase}</div>
                    <div style={{ fontSize: 9, color: "#444" }}>{p.duration}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, fontSize: 11, color: "#555" }}>
                Phases 1–3: ~3–4 months to a fully working product.  Phase 4 is ongoing improvement.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

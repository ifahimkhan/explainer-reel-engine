import React from "react";
import { Glitch } from "./components/Glitch";
import { SceneMotion, transitionOf } from "./components/SceneMotion";
import { Explainer, ExplainerConfig } from "./Explainer";
import { Camera } from "./components/Camera";
import { renderVisual, visualLabel } from "./scenes/generic/renderVisual";
import apkToComposeTimeline from "./data/apk-to-compose.json";
import openHiggsfieldTimeline from "./data/open-higgsfield.json";
import claudeContentStackTimeline from "./data/claude-content-stack.json";
import claudeCoauthorFixTimeline from "./data/claude-coauthor-fix.json";
import promptArchitectSkillTimeline from "./data/prompt-architect-skill.json";
import oracleFreeAiServerTimeline from "./data/oracle-free-ai-server.json";
import androidRotationRiskTimeline from "./data/android-rotation-risk.json";
import emulatorVsSimulatorTimeline from "./data/emulator-vs-simulator.json";
import idempotencyMobileTimeline from "./data/idempotency-mobile.json";
import storeComplianceTestingTimeline from "./data/store-compliance-testing.json";
import proguardR8Timeline from "./data/proguard-r8.json";
import androidAnrTimeline from "./data/android-anr.json";
import nativeWebHybridTimeline from "./data/native-web-hybrid.json";
import networkHandoverTestingTimeline from "./data/network-handover-testing.json";
import tourExploratoryTestingTimeline from "./data/tour-exploratory-testing.json";
import clutterTourCabMapTimeline from "./data/clutter-tour-cab-map.json";
import fpsVsFramePacingTimeline from "./data/fps-vs-frame-pacing.json";
import interruptionTestingTimeline from "./data/interruption-testing.json";
import interruptionMatrixBankingTimeline from "./data/interruption-matrix-banking.json";
import onDeviceAiPart1Timeline from "./data/on-device-ai-part1.json";
import onDeviceAiPart2Timeline from "./data/on-device-ai-part2.json";
import onDeviceAiPart3Timeline from "./data/on-device-ai-part3.json";
import onDeviceAiPart4Timeline from "./data/on-device-ai-part4.json";
import onDeviceAiPart5Timeline from "./data/on-device-ai-part5.json";
import companyAiLayersTimeline from "./data/company-ai-layers.json";
import tagwayAiLayersTimeline from "./data/tagway-ai-layers.json";
import tagwayImageLoaderTimeline from "./data/tagway-image-loader.json";
import heapMonitorTimeline from "./data/heap-monitor.json";
import componentsDemoTimeline from "./data/components-demo.json";
import componentsDemo2Timeline from "./data/components-demo2.json";
import upiLayersTimeline from "./data/upi-layers.json";
import tradingAgentsTimeline from "./data/trading-agents.json";
import stockCheckReminderTimeline from "./data/stock-check-reminder.json";
import freeGithubSwapsTimeline from "./data/free-github-swaps.json";
import type { MusicConfig } from "./components/BackgroundMusic";
import type { Timeline } from "./timeline";

const BRAND = "Fahim Khan";
/** Generic scenes are laid out for the split band (250-1030); centre them above the full-screen captions. */
const CONTENT_SHIFT = 120;

interface ScriptReel {
  config: ExplainerConfig;
  component: React.FC;
}

/**
 * Full-screen reel whose every scene is drawn from its job-declared `visual`
 * (title / phones / steps / compare), so a script-only job needs no scene code.
 * Narration comes from build_voiceover.py (ElevenLabs clone or Kokoro).
 */
export const scriptReel = (id: string, timeline: Timeline, music?: MusicConfig): ScriptReel => {
  const config: ExplainerConfig = {
    id,
    brand: BRAND,
    voiceSrc: `${timeline.id}/voice.wav`,
    timeline,
    music,
    labels: Object.fromEntries(timeline.scenes.map((s) => [s.id, visualLabel(s)])),
    scenes: Object.fromEntries(
      timeline.scenes.map((s, i) => [
        s.id,
        (scene) => (
          <SceneMotion shift={CONTENT_SHIFT} whoosh={i > 0} transition={transitionOf(scene.id, scene.visual)}>
            <Glitch scene={scene}>
              <Camera scene={scene}>{renderVisual(scene)}</Camera>
            </Glitch>
          </SceneMotion>
        ),
      ]),
    ),
  };
  return { config, component: () => <Explainer config={config} /> };
};

/** Script-to-video reels (jobs with visuals, no recording). Add one entry per job. */
export const SCRIPT_REELS: readonly ScriptReel[] = [scriptReel("ApkToCompose", apkToComposeTimeline as Timeline),
  scriptReel("OpenHiggsfield", openHiggsfieldTimeline as Timeline),
  scriptReel("ClaudeContentStack", claudeContentStackTimeline as Timeline),
  scriptReel("ClaudeCoauthorFix", claudeCoauthorFixTimeline as Timeline),
  scriptReel("PromptArchitectSkill", promptArchitectSkillTimeline as Timeline),
  scriptReel("OracleFreeAiServer", oracleFreeAiServerTimeline as Timeline),
  scriptReel("AndroidRotationRisk", androidRotationRiskTimeline as Timeline),
  scriptReel("EmulatorVsSimulator", emulatorVsSimulatorTimeline as Timeline),
  scriptReel("IdempotencyMobile", idempotencyMobileTimeline as Timeline),
  scriptReel("StoreComplianceTesting", storeComplianceTestingTimeline as Timeline),
  scriptReel("ProguardR8", proguardR8Timeline as Timeline),
  scriptReel("AndroidAnr", androidAnrTimeline as Timeline),
  scriptReel("NativeWebHybrid", nativeWebHybridTimeline as Timeline),
  scriptReel("NetworkHandoverTesting", networkHandoverTestingTimeline as Timeline),
  scriptReel("TourExploratoryTesting", tourExploratoryTestingTimeline as Timeline),
  scriptReel("ClutterTourCabMap", clutterTourCabMapTimeline as Timeline),
  scriptReel("FpsVsFramePacing", fpsVsFramePacingTimeline as Timeline),
  scriptReel("InterruptionTesting", interruptionTestingTimeline as Timeline),
  scriptReel("InterruptionMatrixBanking", interruptionMatrixBankingTimeline as Timeline),
  scriptReel("OnDeviceAiPart1", onDeviceAiPart1Timeline as Timeline, { src: "music/tech-pulse-48s.mp3" }),
  // Re-voiced with eleven_v3 (78.7 s): v3 gains, and the 74 s track slowed 6% so its ending lands at the end.
  scriptReel("OnDeviceAiPart2", onDeviceAiPart2Timeline as Timeline, {
    src: "music/tech-pulse-part2-74s.mp3", duck: 0.225, open: 0.49, playbackRate: 0.94,
  }),
  // Re-voiced with eleven_v3 (58 s, longer than its own 53 s track), so it reuses the 74 s track at v3 gains.
  scriptReel("OnDeviceAiPart3", onDeviceAiPart3Timeline as Timeline, { src: "music/tech-pulse-part2-74s.mp3", duck: 0.225, open: 0.49 }),
  // eleven_v3 voice is 3 dB louder than flash (-15.4 LUFS) and the track is -13.2 LUFS: keep part 1's voice/music gap.
  scriptReel("OnDeviceAiPart4", onDeviceAiPart4Timeline as Timeline, { src: "music/tech-pulse-part4-56s.mp3", duck: 0.178, open: 0.39 }),
  // eleven_v3 voice -15.7 LUFS, track -13.6 LUFS: same voice/music gap as part 4.
  scriptReel("OnDeviceAiPart5", onDeviceAiPart5Timeline as Timeline, { src: "music/tech-pulse-part5-57s.mp3", duck: 0.18, open: 0.39 }),
  scriptReel("CompanyAiLayers", companyAiLayersTimeline as Timeline),
  scriptReel("TagwayAiLayers", tagwayAiLayersTimeline as Timeline),
  scriptReel("TagwayImageLoader", tagwayImageLoaderTimeline as Timeline),
  // eleven_v3 voice (100 s): v3 gains; the 74 s track loops once.
  scriptReel("HeapMonitor", heapMonitorTimeline as Timeline, { src: "music/tech-pulse-part2-74s.mp3", duck: 0.225, open: 0.49 }),
  // Preview of punch / chart / camera / sequence visuals (Kokoro voice, no credits).
  scriptReel("ComponentsDemo", componentsDemoTimeline as Timeline),
  scriptReel("ComponentsDemo2", componentsDemo2Timeline as Timeline),
  scriptReel("UpiLayers", upiLayersTimeline as Timeline),
  scriptReel("TradingAgents", tradingAgentsTimeline as Timeline),
  scriptReel("StockCheckReminder", stockCheckReminderTimeline as unknown as Timeline, { src: "music/tech-pulse-part2-74s.mp3", duck: 0.155, open: 0.34 }),
  // OmniVoice (local) narration from a v3 reference clip; word timings are estimated.
  scriptReel("FreeGithubSwaps", freeGithubSwapsTimeline as Timeline),
];


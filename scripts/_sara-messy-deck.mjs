// One-off helper: builds Sara Chen's deliberately amateur deck for the
// PowerPoint Reformatter user-test. Not part of the app pipeline.
import PptxGenJS from "pptxgenjs";
import fs from "node:fs";
import path from "node:path";

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE"; // 13.33 x 7.5

// --- Slide 1: garish title ---
const s1 = pptx.addSlide();
s1.background = { color: "FF00FF" }; // magenta
s1.addText("RESEARCH FINDINGS!!!", {
  x: 0.5,
  y: 2.5,
  w: 12.3,
  h: 2,
  fontSize: 60,
  fontFace: "Comic Sans MS",
  color: "FFFF00",
  bold: true,
  align: "center",
});
s1.addText("Sara Chen, Marketing Dept", {
  x: 0.5,
  y: 5,
  w: 12.3,
  h: 0.6,
  fontSize: 18,
  fontFace: "Comic Sans MS",
  color: "00FFFF",
  align: "center",
});

// --- Slide 2: 200-word wall of text ---
const wallOfText =
  "Consumers increasingly evaluate brands not only on the functional " +
  "attributes of their offerings but also on a range of symbolic and " +
  "moral signals that the brand emits across its various touchpoints. " +
  "Recent work in the marketing literature has begun to integrate " +
  "perspectives from social psychology, behavioral economics, and " +
  "cultural sociology to understand how consumers form beliefs about " +
  "brand authenticity, sincerity, and competence in markets that are " +
  "saturated with claims of purpose-driven activity. We argue that " +
  "this growing body of work has not yet adequately distinguished " +
  "between perceived warmth and perceived competence in the context of " +
  "brand activism, particularly when activism touches on contested " +
  "political topics that polarize a brand's customer base. Drawing on " +
  "three large-scale field studies, an incentive-compatible online " +
  "experiment with two thousand four hundred participants recruited " +
  "from a national panel, and an analysis of social media engagement " +
  "data from twelve hundred branded posts spanning two years, we " +
  "develop and test a moderated mediation model in which perceived " +
  "warmth fully mediates the effect of activism on consumer brand " +
  "identification, while perceived competence operates as an " +
  "independent boundary condition that strengthens or weakens this " +
  "indirect effect depending on the political alignment between the " +
  "consumer and the brand's stated position on the issue.";
const s2 = pptx.addSlide();
s2.addText("Background and Theoretical Framing for the Project", {
  x: 0.5,
  y: 0.3,
  w: 12.3,
  h: 0.6,
  fontSize: 24,
  fontFace: "Times New Roman",
  bold: true,
});
s2.addText(wallOfText, {
  x: 0.5,
  y: 1.0,
  w: 12.3,
  h: 6.2,
  fontSize: 11,
  fontFace: "Times New Roman",
  color: "333333",
  align: "left",
});

// --- Slide 3: bullet hell, 12 nested bullets, three indent levels ---
const s3 = pptx.addSlide();
s3.addText("Methodology Overview / Approach Used in the Study", {
  x: 0.5,
  y: 0.3,
  w: 12.3,
  h: 0.6,
  fontSize: 24,
  fontFace: "Arial",
  bold: true,
});
s3.addText(
  [
    { text: "Pre-registered three-study research design", options: { bullet: true, indentLevel: 0 } },
    { text: "Study 1: large-scale survey", options: { bullet: true, indentLevel: 1 } },
    { text: "N = 1,847 US consumers from Prolific", options: { bullet: true, indentLevel: 2 } },
    { text: "fielded in two waves to allow for test-retest reliability checks", options: { bullet: true, indentLevel: 2 } },
    { text: "Study 2: online experiment with manipulation of brand activism stance", options: { bullet: true, indentLevel: 1 } },
    { text: "2 (warmth: high vs low) x 2 (competence: high vs low) between-subjects", options: { bullet: true, indentLevel: 2 } },
    { text: "stimuli pretested with a separate sample of 200", options: { bullet: true, indentLevel: 2 } },
    { text: "Study 3: archival analysis of branded social media posts", options: { bullet: true, indentLevel: 1 } },
    { text: "1,200 posts coded by two RAs, ICC = 0.88", options: { bullet: true, indentLevel: 2 } },
    { text: "Robustness checks across all three studies", options: { bullet: true, indentLevel: 0 } },
    { text: "alternative DV operationalizations (purchase intent, NPS-style item)", options: { bullet: true, indentLevel: 1 } },
    { text: "alternative IV operationalizations and political-alignment moderators", options: { bullet: true, indentLevel: 1 } },
  ],
  {
    x: 0.5,
    y: 1.0,
    w: 12.3,
    h: 6.2,
    fontSize: 14,
    fontFace: "Arial",
    color: "222222",
  }
);

// --- Slide 4: cursive Key Insight with emoji ---
const s4 = pptx.addSlide();
s4.background = { color: "FFF8DC" };
s4.addText("Key Insight", {
  x: 0.5,
  y: 0.3,
  w: 12.3,
  h: 0.7,
  fontSize: 28,
  fontFace: "Monotype Corsiva",
  italic: true,
  color: "8A2BE2",
});
s4.addText(
  "💡 Warmth, not competence, drives identification with activist brands among aligned consumers, and competence amplifies the warmth effect rather than substituting for it.",
  {
    x: 0.7,
    y: 1.4,
    w: 12,
    h: 4,
    fontSize: 22,
    fontFace: "Monotype Corsiva",
    italic: true,
    color: "4B0082",
    align: "left",
  }
);

// --- Slide 5: hype slide with no actual numbers ---
const s5 = pptx.addSlide();
s5.background = { color: "FFFACD" };
s5.addText("RESULTS!!!", {
  x: 0.5,
  y: 0.3,
  w: 12.3,
  h: 0.8,
  fontSize: 36,
  fontFace: "Impact",
  color: "FF4500",
  align: "center",
});
s5.addText(
  [
    { text: "REVENUE GROWTH: UP!\n", options: { fontSize: 32, color: "008000", bold: true } },
    { text: "CUSTOMERS: HAPPIER!\n", options: { fontSize: 32, color: "008000", bold: true } },
    { text: "NPS: SOLID!\n", options: { fontSize: 32, color: "008000", bold: true } },
    { text: "ENGAGEMENT: THROUGH THE ROOF!\n", options: { fontSize: 32, color: "008000", bold: true } },
    { text: "BRAND LOVE: OFF THE CHARTS!", options: { fontSize: 32, color: "008000", bold: true } },
  ],
  {
    x: 0.5,
    y: 1.4,
    w: 12.3,
    h: 5.5,
    fontFace: "Impact",
    align: "center",
  }
);

// --- Slide 6: 4 image placeholders, no alt text, one-word caption ---
const s6 = pptx.addSlide();
s6.addText("AGGIES", {
  x: 0.5,
  y: 0.3,
  w: 12.3,
  h: 0.6,
  fontSize: 28,
  fontFace: "Arial Black",
  color: "500000",
  align: "center",
});
// Render four blank rectangles to act like missing image frames.
const boxes = [
  { x: 0.5, y: 1.3 },
  { x: 6.9, y: 1.3 },
  { x: 0.5, y: 4.3 },
  { x: 6.9, y: 4.3 },
];
boxes.forEach((b, i) => {
  s6.addShape(pptx.ShapeType.rect, {
    x: b.x,
    y: b.y,
    w: 5.9,
    h: 2.8,
    fill: { color: "DDDDDD" },
    line: { color: "999999", width: 1 },
  });
  s6.addText(`[image ${i + 1}]`, {
    x: b.x,
    y: b.y + 1.2,
    w: 5.9,
    h: 0.5,
    fontSize: 14,
    fontFace: "Arial",
    color: "888888",
    align: "center",
  });
});

// --- Slide 7: papyrus all-caps thank you ---
const s7 = pptx.addSlide();
s7.background = { color: "FFFFFF" };
s7.addText("THANK YOU", {
  x: 0.5,
  y: 2.5,
  w: 12.3,
  h: 2,
  fontSize: 72,
  fontFace: "Papyrus",
  color: "B22222",
  align: "center",
});
s7.addText("QUESTIONS???", {
  x: 0.5,
  y: 5,
  w: 12.3,
  h: 1,
  fontSize: 40,
  fontFace: "Papyrus",
  color: "B22222",
  align: "center",
});

const root =
  "C:/Users/shriharisridhar/OneDrive - Texas A&M University/ClaudeCodeProjects/Mays Method Lab";
const tmpOut = path.join(root, "tmp", "sara-messy-deck.pptx");
const dataOut = path.join(root, "data", "test-decks", "sara-messy-deck.pptx");

fs.mkdirSync(path.dirname(tmpOut), { recursive: true });
fs.mkdirSync(path.dirname(dataOut), { recursive: true });

await pptx.writeFile({ fileName: tmpOut });
fs.copyFileSync(tmpOut, dataOut);

console.log("wrote", tmpOut);
console.log("wrote", dataOut);

# EduFlow — IELTS & ESL Workflow Builder

A visual workflow builder and animated presentation tool purpose-built for **IELTS instructors** and **ESL teachers**.

Built with React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, and React Flow.

---

## What is EduFlow?

EduFlow lets you:

- **Build** visual step-by-step diagrams of any teaching or exam process using a drag-and-drop canvas
- **Present** them as animated, narrated walkthroughs — perfect for classroom projectors or online lessons
- **Share** workflows via a compressed URL you can send to students or colleagues
- **Export** any diagram as a PNG for handouts or slides

---

## Pre-loaded IELTS & ESL Workflows

| Workflow | Category | What it covers |
|---|---|---|
| IELTS Writing Task 2 — Essay Process | IELTS | Brainstorm → Outline → Draft → Check → Proofread → Submit |
| IELTS Speaking — Cue Card Strategy | IELTS | Prep minute, long-turn, Part 3 discussion |
| IELTS Listening — Before, During & After | IELTS | Preview, active listening, distractor detection, transfer |
| IELTS Reading — Skimming & Scanning | IELTS | Overview, question-first, skim, scan, T/F/NG logic |
| ESL Lesson Planning Pipeline | ESL | Needs analysis → SMART objectives → PPP → Reflection |
| ESL Error Correction Decision Tree | ESL | Classify → Fluency/Accuracy → Immediate/Delayed correction |

---

## Key Features

### Workflow Builder
- Drag-and-drop canvas with 5 node types: **Start**, **Step**, **Decision**, **End**, and the new **Note** (sticky-note) type
- Keyboard shortcuts **1–5** add nodes without dragging
- Rich node editor: label, description, long-form details, code snippet, image URL, custom color, playback duration
- **⏱ IELTS Quick-Insert** metric presets (40 min, 60 min, prep time, etc.) — one click, no typing
- Category selector per workflow: **IELTS** / **ESL** / **Custom**
- Comma-separated workflow tags, searchable from the library

### Library
- **Live search** filters by name, description, or tags
- **Category filter pills** (All · IELTS · ESL · Custom)
- Color-coded left-border accents per category (blue = IELTS, green = ESL)
- Tag chips visible on each workflow card

### Showcase / Presentation Mode
- Animated step-by-step playback with auto-advance
- **Band score badges** — metrics labelled "band", "score", or "target" render as coloured chips (B5 = red, B6 = amber, B7 = green, B8/9 = blue)
- Node detail panel with long-form text, images, and code
- Workflow tags shown on the cover slide

### Sharing & Export
- **Share link** — compresses the entire workflow into a URL hash (no server needed)
- **Export PNG** — captures the canvas as an image for handouts

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build for production

```bash
npm run build
npm run preview
```

---

## Stack

| Tool | Version | Purpose |
|---|---|---|
| React | 19 | UI |
| TypeScript | 6 | Type safety |
| Vite | 8 | Dev server & bundler |
| Tailwind CSS | 4 | Styling |
| Zustand | 5 | State management (with `persist`) |
| React Flow (XY Flow) | 12 | Canvas |
| html-to-image | 1 | PNG export |
| lz-string | 1.5 | Share link compression |

---

## Customising

### Adding a new workflow template

Edit `src/utils/sampleWorkflows.ts`. Add a new function returning a `Workflow` object and include it in the `createSampleWorkflows()` array. Templates only appear on first load (they're seeded into localStorage).

### Adding a new node type

1. Add the type literal to `WorkflowNodeType` in `src/types/workflow.ts`
2. Add its meta (label, hex, accent) to `NODE_TYPE_META` in `src/components/canvas/shared.ts`
3. Add it to `DEFAULT_NODE_LABELS` in `src/store/workflowStore.ts`
4. Handle its rendering in `src/components/canvas/WorkflowNode.tsx`
5. Add it to the palette in `src/components/builder/NodePalette.tsx`

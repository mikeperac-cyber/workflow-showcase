# Project: EduFlow (Workflow Showcase) AI Multi-Agent Workflow Enhancements

## Architecture
EduFlow is a React 19 + TypeScript + Vite + Tailwind CSS 4 + `@xyflow/react` web application for designing, visually mapping, presenting, and optimizing educational and computational workflows.

### System Components & Data Flow:
1. **Domain Types (`src/types/workflow.ts`)**:
   - `WorkflowNodeType`: Union of node types (`start`, `task`, `decision`, `end`, `note`, `agent`, `llm-model`, `tool`, `prompt`).
   - `WorkflowNodeData`: Node payload containing labels, descriptions, long-form details, code snippets, metrics, duration, playback state, and AI-specific parameters.
   - `Workflow`: Workflow container with id, name, description, nodes, edges, category (`'ai' | 'ielts' | 'esl' | 'custom'`), and tags.
2. **Canvas Rendering (`src/components/canvas/`)**:
   - `WorkflowNode.tsx` & `shared.ts`: Custom node renderer leveraging `NODE_TYPE_META` for badge colors, icons, borders, and playback state glow.
3. **Builder Interface (`src/components/builder/`)**:
   - `NodePalette.tsx`: Canvas toolbar with drag/click item addition and keyboard shortcuts `1`–`9`.
   - `NodeEditorPanel.tsx`: Node inspector sidebar for editing labels, details, code snippets, node-specific AI fields, and quick-insert metric presets.
   - `BuilderView.tsx`: Canvas host with top toolbar (category selector, playback controls, export/import).
4. **Showcase Player (`src/components/showcase/`)**:
   - `ShowcaseView.tsx` & `NodeDetailPanel.tsx`: Interactive step-by-step playback with synchronized graph highlighting and deep-dive detail inspector (AI metrics, alignment scores, cost, latency, code snippets).
5. **Workflow Library (`src/components/library/LibraryView.tsx`)**:
   - Category filtering (`All`, `AI Workflows`, `IELTS`, `ESL`, `Custom`), tag search, workflow cards, and template loader.
6. **Preloaded Templates (`src/utils/sampleWorkflows.ts`)**:
   - Built-in library containing 6 IELTS/ESL workflows + 3 AI multi-agent workflows (RAG Pipeline, Multi-Agent Reflection Loop, Router-Classifier Pattern).
7. **Verification Harness (`src/utils/verifyAIWorkflows.ts`)**:
   - Standalone automated test runner validating workflow registries, node types, edge graph connectivity, and metadata.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source | Status |
|---|---------|-------------|-----------|--------|--------|
| 1 | Specialized AI Node Types | Add `agent`, `llm-model`, `tool`, `prompt` to `WorkflowNodeType` & `WorkflowNodeData` | M1 | ORIGINAL_REQUEST §R1 | DONE |
| 2 | Canvas Node Visual Customization | Distinct styles, badges, borders, and icons for AI nodes in `WorkflowNode.tsx` & `shared.ts` | M1 | ORIGINAL_REQUEST §R1 | DONE |
| 3 | Builder Palette & Key Shortcuts 6–9 | Palette entries for 4 AI node types with shortcuts `6`, `7`, `8`, `9` and updated `DEFAULT_NODE_LABELS` | M1 | ORIGINAL_REQUEST §R1 | DONE |
| 4 | NodeEditorPanel AI Fields | Specialized editor inputs for `agent` (system instructions), `llm-model` (model/temp/tokens), `tool` (signature/endpoint), and `prompt` (templates) | M1 | ORIGINAL_REQUEST §R1 | DONE |
| 5 | Share Link & Category Integration | Include new node types in `shareLink.ts` and add `'ai'` category pill / filter to `LibraryView` & `BuilderView` | M1 | Survey Findings | DONE |
| 6 | Preloaded RAG Pipeline Template | Ingestion → Chunking → Vector Embeddings → Vector DB Query → LLM Prompt Generation → Answer Generation | M2 | ORIGINAL_REQUEST §R2 | DONE |
| 7 | Preloaded Multi-Agent Reflection Loop | User Request → Primary Agent Draft → Critic Agent Review → Refined Answer Generator → End with cyclic feedback | M2 | ORIGINAL_REQUEST §R2 | DONE |
| 8 | Preloaded Router-Classifier Pattern | User Query → LLM Router → Path A (Support) / Path B (Technical) / Path C (General LLM) with tool gateway | M2 | ORIGINAL_REQUEST §R2 | DONE |
| 9 | Rich Template Metadata & Code Snippets | Full descriptions, metrics, runnable code snippets, and long-form details for all AI workflow nodes | M2 | ORIGINAL_REQUEST §R2 | DONE |
| 10 | AI Metric Quick Presets | Quick-insert presets in `NodeEditorPanel` (`temperature`, `max_tokens`, `latency`, `cost`, `token_count`, `accuracy`, `alignment`) | M3 | ORIGINAL_REQUEST §R3 | DONE |
| 11 | Showcase AI Scoring & Badges | Custom score visualizers in `NodeDetailPanel` (alignment/accuracy rates, cost indicators, latency badges, model specs) | M3 | ORIGINAL_REQUEST §R3 | DONE |
| 12 | Automated Test Script | `src/utils/verifyAIWorkflows.ts` asserting workflow count (9), node types, edge graph validity, and metadata | M4 | ORIGINAL_REQUEST §Verification | DONE |
| 13 | Build & TypeScript Cleanliness | Clean `npm run build` and `npx tsc --noEmit` with zero errors or warnings | M4 | ORIGINAL_REQUEST §Acceptance Criteria | DONE |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Specialized AI Node Types & Core Integration | Types, `shared.ts`, `WorkflowNode.tsx`, `NodePalette.tsx`, `DEFAULT_NODE_LABELS`, `NodeEditorPanel.tsx`, `shareLink.ts`, `LibraryView.tsx`, `BuilderView.tsx` | none | DONE |
| M2 | Preloaded AI Workflow Templates | Implement RAG Pipeline, Multi-Agent Reflection Loop, Router-Classifier Pattern in `src/utils/sampleWorkflows.ts` | M1 | DONE |
| M3 | AI Metrics, Quick Presets & Showcase Scoring | AI metric presets in `NodeEditorPanel.tsx`, AI scoring badges / cost / latency cards in `NodeDetailPanel.tsx` | M1 | DONE |
| M4 | Automated Verification Script & E2E Build Gate | `src/utils/verifyAIWorkflows.ts`, `package.json` test script, test execution, full `npm run build` verification | M1, M2, M3 | DONE |

---

## Code Layout
```
src/
├── types/
│   └── workflow.ts               # Core domain models (WorkflowNodeType, WorkflowNodeData, Workflow)
├── components/
│   ├── builder/
│   │   ├── BuilderView.tsx       # Builder screen & category selector
│   │   ├── NodePalette.tsx       # Palette items & keyboard shortcuts (1-9)
│   │   └── NodeEditorPanel.tsx   # Node properties, AI-specific fields & metric presets
│   ├── canvas/
│   │   ├── shared.ts             # NODE_TYPE_META, color helpers & coordinates
│   │   └── WorkflowNode.tsx      # Canvas node renderer with icons, badges & borders
│   ├── common/
│   │   └── Icon.tsx              # SVG icon system (Agent, Model, Tool, Prompt, Sparkles)
│   ├── library/
│   │   └── LibraryView.tsx       # Library grid, AI category tab, search & filters
│   └── showcase/
│       ├── ShowcaseView.tsx      # Showcase player canvas
│       └── NodeDetailPanel.tsx   # Step inspector with AI scores, latency, cost & code
├── store/
│   └── workflowStore.ts          # Zustand store, DEFAULT_NODE_LABELS, workflow CRUD
├── utils/
│   ├── sampleWorkflows.ts        # 6 IELTS/ESL + 3 AI workflow definitions
│   ├── shareLink.ts              # URL compression & node type validation
│   ├── verifyAIWorkflows.ts      # Programmatic verification test suite (23 tests)
│   ├── adversarialStressSuite.ts # Adversarial serialization & metric stress tests (18 tests)
│   └── adversarialPlaybackTest.ts# Graph traversal & cyclic playback tests (40 tests)
```

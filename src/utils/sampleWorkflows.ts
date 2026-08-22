import type { Edge } from '@xyflow/react'
import type { Workflow, WorkflowEdgeData, WorkflowNode, WorkflowNodeType } from '../types/workflow'
import { uid } from './id'

function node(
  id: string,
  nodeType: WorkflowNodeType,
  x: number,
  y: number,
  data: Partial<WorkflowNode['data']> & { label: string },
): WorkflowNode {
  return {
    id,
    type: 'workflow',
    position: { x, y },
    data: { nodeType, duration: 2500, ...data },
  }
}

function edge(
  id: string,
  source: string,
  target: string,
  label?: string,
  data?: WorkflowEdgeData,
  animated?: boolean,
): Edge {
  return { id, source, target, label, data, animated }
}

// ─── 1. IELTS Writing Task 2 ──────────────────────────────────────────────────

function ieltWritingTask2(): Workflow {
  const now = Date.now()
  return {
    id: uid(),
    name: 'IELTS Writing Task 2 — Essay Process',
    description: 'Step-by-step essay workflow from brainstorm to submission, with band-score targets at each stage.',
    category: 'ielts',
    tags: ['ielts', 'writing', 'task 2', 'essay'],
    createdAt: now,
    updatedAt: now,
    nodes: [
      node('wt2-start', 'start', 0, 120, {
        label: 'Receive Prompt',
        description: 'Read & annotate the question',
        details: 'Underline the topic, the instruction verb (discuss, evaluate, argue), and any restrictions. Identify whether the question asks for both sides, a position, or solutions to a problem.',
        metrics: [{ label: 'Time', value: '1 min' }],
        color: '#10b981',
      }),
      node('wt2-analyse', 'task', 220, 120, {
        label: 'Analyse the Question',
        description: 'Task Achievement check',
        details: 'Map the question type:\n• Opinion/Agree-Disagree\n• Discussion (two views)\n• Advantages & Disadvantages\n• Problem & Solution\n• Mixed\n\nBand 7+ requires full task response — never omit a required element.',
        metrics: [
          { label: 'Time', value: '2 min' },
          { label: 'Band target', value: 'B7 TA' },
        ],
        color: '#3b82f6',
      }),
      node('wt2-plan', 'task', 440, 120, {
        label: 'Plan & Outline',
        description: 'Paragraph map before writing',
        details: 'Intro → Body 1 → Body 2 → (Body 3 optional) → Conclusion\n\nFor each body paragraph note:\n• Topic sentence idea\n• 1–2 supporting points\n• Example or evidence\n\nSkipping planning is the #1 cause of band 5 essays.',
        metrics: [
          { label: 'Time', value: '4 min' },
          { label: 'Min paragraphs', value: '4' },
        ],
        color: '#8b5cf6',
      }),
      node('wt2-intro', 'task', 660, 40, {
        label: 'Write Introduction',
        description: 'Paraphrase + thesis',
        details: 'Two sentences:\n1. Paraphrase the prompt (do NOT copy verbatim).\n2. Thesis — state your position or preview the discussion.\n\n🚫 Never use "In this essay I will…" — it is a Band 5 phrase.',
        metrics: [{ label: 'Word count', value: '40–60 w' }],
        color: '#06b6d4',
      }),
      node('wt2-body', 'task', 880, 40, {
        label: 'Write Body Paragraphs',
        description: 'PEEL structure per paragraph',
        details: 'Use PEEL for every body paragraph:\n• Point — clear topic sentence\n• Evidence — statistic, example, or personal observation\n• Explanation — link evidence to point\n• Link — connect to the next paragraph or thesis\n\nAim for ≥150 words per body paragraph for Band 7+.',
        metrics: [
          { label: 'Word count', value: '160–200 w' },
          { label: 'Band score', value: 'B7 CC' },
        ],
        color: '#f97316',
      }),
      node('wt2-conc', 'task', 1100, 40, {
        label: 'Write Conclusion',
        description: 'Summarise + final opinion',
        details: 'Restate thesis in new words. Briefly summarise the main arguments. End with a recommendation or prediction if appropriate.\n\n🚫 Never introduce new ideas in the conclusion.',
        metrics: [{ label: 'Word count', value: '40–60 w' }],
        color: '#06b6d4',
      }),
      node('wt2-check', 'decision', 660, 220, {
        label: 'Word Count ≥ 250?',
        description: 'Mandatory minimum',
        details: 'Task 2 requires at least 250 words. Penalties for under-length:\n• 249–230 words: −1 band TA\n• Below 200 words: −2 bands TA\n\nIf under, expand body paragraph evidence or explanation.',
      }),
      node('wt2-expand', 'task', 440, 320, {
        label: 'Expand',
        description: 'Add detail / examples',
        details: 'Re-read your weakest body paragraph. Add one more concrete example, a counterclaim, or a conceding sentence. Never pad with repetition — examiners penalise circular writing.',
        metrics: [{ label: 'Target add', value: '+30 w' }],
        color: '#f59e0b',
      }),
      node('wt2-proofread', 'task', 1100, 220, {
        label: 'Proofread',
        description: 'GRA & LR check',
        details: 'Check for:\n• Subject-verb agreement\n• Article usage (a / an / the)\n• Singular vs plural nouns\n• Connector variety (not just "however" and "furthermore")\n• Avoid informal contractions (don\'t → do not)\n\nBand 7 GRA requires a mix of complex and simple sentences.',
        metrics: [
          { label: 'Time', value: '3 min' },
          { label: 'Band target', value: 'B7 GRA' },
        ],
        color: '#8b5cf6',
      }),
      node('wt2-submit', 'end', 1320, 120, {
        label: 'Submit',
        description: 'Final answer',
        details: 'Hand in the answer booklet. The examiner will score across 4 criteria:\n• Task Achievement (TA)\n• Coherence & Cohesion (CC)\n• Lexical Resource (LR)\n• Grammatical Range & Accuracy (GRA)\n\nEach criterion is weighted equally.',
        metrics: [
          { label: 'Total time', value: '40 min' },
          { label: 'Band target', value: 'B7.0+' },
        ],
        color: '#10b981',
      }),
    ],
    edges: [
      edge('wt2-e1', 'wt2-start', 'wt2-analyse'),
      edge('wt2-e2', 'wt2-analyse', 'wt2-plan', undefined, { color: '#3b82f6' }),
      edge('wt2-e3', 'wt2-plan', 'wt2-intro', undefined, { color: '#8b5cf6' }),
      edge('wt2-e4', 'wt2-intro', 'wt2-body', undefined, { color: '#06b6d4' }, true),
      edge('wt2-e5', 'wt2-body', 'wt2-conc', undefined, { color: '#f97316' }),
      edge('wt2-e6', 'wt2-conc', 'wt2-check'),
      edge('wt2-e7', 'wt2-plan', 'wt2-check', undefined, { lineStyle: 'bezier', dashed: true }),
      edge('wt2-e8', 'wt2-check', 'wt2-proofread', '≥ 250', { color: '#10b981' }),
      edge('wt2-e9', 'wt2-check', 'wt2-expand', '< 250', { color: '#f43f5e', dashed: true, arrowEnd: 'open' }),
      edge('wt2-e10', 'wt2-expand', 'wt2-check', 'retry', { dashed: true }),
      edge('wt2-e11', 'wt2-proofread', 'wt2-submit', undefined, { color: '#10b981' }),
    ],
  }
}

// ─── 2. IELTS Speaking Part 2 ─────────────────────────────────────────────────

function ieltsSpeakingPart2(): Workflow {
  const now = Date.now()
  return {
    id: uid(),
    name: 'IELTS Speaking — Cue Card Strategy',
    description: 'How to maximise your Part 1, 2 & 3 scores: preparation minute, long-turn, and discussion.',
    category: 'ielts',
    tags: ['ielts', 'speaking', 'part 2', 'cue card'],
    createdAt: now,
    updatedAt: now,
    nodes: [
      node('sp-start', 'start', 0, 120, {
        label: 'Receive Cue Card',
        description: 'Read the prompt',
        details: 'Read the card carefully. Note:\n• The topic (a person, place, thing, event)\n• What you must cover (bullet points)\n• The final instruction ("and explain why…")',
        metrics: [{ label: 'Stage', value: 'Part 2' }],
        color: '#10b981',
      }),
      node('sp-prep', 'task', 220, 120, {
        label: 'Preparation Minute',
        description: '60 seconds to plan',
        details: 'Use the pencil and paper provided. Jot single keywords — not full sentences — for each bullet:\n• WHO: name, relation, context\n• WHAT: key detail / anecdote\n• WHEN/WHERE: specific time/place\n• WHY: personal significance\n\n⚡ Use the full 60 seconds. Candidates who start early often run out of ideas.',
        metrics: [
          { label: 'Time', value: '60 sec' },
          { label: 'Notes', value: 'keywords only' },
        ],
        color: '#f59e0b',
      }),
      node('sp-open', 'task', 440, 80, {
        label: 'Opening Hook',
        description: 'Strong first sentence',
        details: 'Begin with a vivid, memorable opener — not "I am going to talk about…"\n\nExamples:\n✅ "The moment I met her, I knew she would change my life."\n✅ "It was a sweltering August afternoon when I first visited that place."\n\nA strong opener signals Band 7+ fluency immediately.',
        metrics: [{ label: 'Band signal', value: 'B7 Fluency' }],
        color: '#06b6d4',
      }),
      node('sp-bullets', 'task', 660, 80, {
        label: 'Cover All Bullets',
        description: 'Address each sub-point',
        details: 'Methodically address each bullet point on the card. Use discourse markers to signal transitions:\n• "Turning to the second point…"\n• "As for why this was significant…"\n• "In terms of when this happened…"\n\nMissing a bullet risks a Task Completion deduction.',
        metrics: [
          { label: 'Min bullets', value: 'all 3–4' },
          { label: 'Band score', value: 'B6+ TC' },
        ],
        color: '#8b5cf6',
      }),
      node('sp-close', 'task', 880, 80, {
        label: 'Closing Reflection',
        description: 'Personal meaning / impact',
        details: 'End by reflecting on why this topic matters to you personally. This fulfils the "…and explain why" element and gives the examiner a natural cue to stop you.\n\nExample: "Looking back, I think what made this experience so meaningful was the sense of connection it gave me."',
        metrics: [{ label: 'Duration', value: '1–2 min' }],
        color: '#f97316',
      }),
      node('sp-check', 'decision', 660, 220, {
        label: '≥ 2 Minutes Spoken?',
        description: 'Long-turn duration check',
        details: 'The examiner will stop you at 2 minutes. If you finish early:\n• Add an anecdote or specific memory\n• Elaborate on your feelings or impact\n• Compare past vs present\n\nSpeaking for the full 2 minutes is expected at Band 6+.',
      }),
      node('sp-extend', 'task', 440, 320, {
        label: 'Extend & Elaborate',
        description: 'Add anecdote or comparison',
        details: 'Use "stretchers" to extend naturally:\n• "What was particularly interesting was…"\n• "I remember thinking at the time that…"\n• "If I compare this to…, I\'d say…"\n\nAvoid repeating the same point with different words.',
        color: '#f59e0b',
      }),
      node('sp-part3', 'task', 1100, 120, {
        label: 'Part 3 Discussion',
        description: 'Abstract follow-up questions',
        details: 'Part 3 tests your ability to speculate, hypothesise, and discuss abstract ideas.\n\nKey strategies:\n• Use hedging: "It could be argued that…", "In general, I think…"\n• Give reasons: never answer with just yes/no\n• Show range: compare past/present/future, or local/global\n\nBand 7 LR is largely tested in Part 3.',
        metrics: [
          { label: 'Duration', value: '4–5 min' },
          { label: 'Band score', value: 'B7 LR' },
        ],
        color: '#3b82f6',
      }),
      node('sp-end', 'end', 1320, 120, {
        label: 'Test Complete',
        description: 'Overall band calculated',
        details: 'Speaking is scored across 4 criteria:\n• Fluency & Coherence (FC)\n• Lexical Resource (LR)\n• Grammatical Range & Accuracy (GRA)\n• Pronunciation (P)\n\nResults reported within 13 days (paper-based) or 3–5 days (computer-based).',
        metrics: [{ label: 'Band target', value: 'B7.0+' }],
        color: '#10b981',
      }),
    ],
    edges: [
      edge('sp-e1', 'sp-start', 'sp-prep'),
      edge('sp-e2', 'sp-prep', 'sp-open', undefined, { color: '#f59e0b' }),
      edge('sp-e3', 'sp-open', 'sp-bullets', undefined, { color: '#06b6d4' }),
      edge('sp-e4', 'sp-bullets', 'sp-close', undefined, { color: '#8b5cf6' }),
      edge('sp-e5', 'sp-close', 'sp-check'),
      edge('sp-e6', 'sp-check', 'sp-part3', '≥ 2 min', { color: '#10b981' }),
      edge('sp-e7', 'sp-check', 'sp-extend', '< 2 min', { color: '#f43f5e', dashed: true, arrowEnd: 'open' }),
      edge('sp-e8', 'sp-extend', 'sp-check', 'retry', { dashed: true }),
      edge('sp-e9', 'sp-part3', 'sp-end', undefined, { color: '#3b82f6' }),
    ],
  }
}

// ─── 3. IELTS Listening Strategy ──────────────────────────────────────────────

function ieltsListening(): Workflow {
  const now = Date.now()
  return {
    id: uid(),
    name: 'IELTS Listening — Before, During & After',
    description: 'A systematic approach to all 4 sections: pre-listening activation, active answering, and transfer review.',
    category: 'ielts',
    tags: ['ielts', 'listening', 'strategy'],
    createdAt: now,
    updatedAt: now,
    nodes: [
      node('li-start', 'start', 0, 140, {
        label: 'Section Preview Time',
        description: 'Use the 30-second preview',
        details: 'Before each section plays, use the preview time to:\n• Read ahead through ALL the questions for that section\n• Underline key words (names, numbers, categories)\n• Predict the likely answer type (number / name / adjective)\n\n🔑 Candidates who pre-read score on average 2 bands higher.',
        metrics: [
          { label: 'Preview time', value: '30 sec/sec' },
          { label: 'Band boost', value: '+1–2 bands' },
        ],
        color: '#10b981',
      }),
      node('li-vocab', 'task', 220, 80, {
        label: 'Activate Topic Vocab',
        description: 'Mental schema priming',
        details: 'Quickly brainstorm synonyms and related words for the topic you predicted.\n\nExample — if the topic is "university enrollment":\n• register / enrol / sign up / application\n• deadline / cut-off date\n• course / programme / module / subject\n\nListeners miss answers because they hear a synonym they didn\'t anticipate.',
        color: '#3b82f6',
        metrics: [{ label: 'Time', value: '10 sec' }],
      }),
      node('li-listen', 'task', 440, 140, {
        label: 'Active Listening',
        description: 'Write while you listen',
        details: 'Do NOT try to write perfect answers — jot keywords. Key rules:\n• Listen for signpost phrases: "Now I\'d like to turn to…", "Moving on…"\n• Watch out for distractors (answers that are corrected or changed)\n• If you miss one answer, move on immediately — never dwell\n\nSpelling counts for form completion tasks.',
        metrics: [
          { label: 'Speed', value: '~150 wpm' },
          { label: 'Sections', value: '4' },
        ],
        color: '#8b5cf6',
      }),
      node('li-distractor', 'decision', 660, 140, {
        label: 'Answer Changed by Speaker?',
        description: 'Distractor detection',
        details: 'IELTS deliberately includes distractors — the speaker mentions an answer and then changes it:\n"We could meet at 3pm… actually no, let\'s make it 4pm."\n\nAlways wait until the speaker finishes a thought before writing the final answer.',
      }),
      node('li-correct', 'task', 880, 60, {
        label: 'Record Corrected Answer',
        description: 'Write the FINAL answer',
        details: 'Cross out the first answer and write the corrected one. Keep it legible — messy corrections lose marks during transfer.',
        color: '#10b981',
        metrics: [{ label: 'Rule', value: 'last answer wins' }],
      }),
      node('li-transfer', 'task', 1100, 140, {
        label: 'Transfer Answers',
        description: '10 minutes at the end',
        details: 'Use the 10-minute transfer time wisely:\n1. Transfer all answers accurately to the answer sheet\n2. Check spelling — especially names and numbers\n3. Make sure you haven\'t missed a question\n4. Use the remaining time to attempt any blank answers (no penalty for wrong guesses)\n\n🚫 Never leave a blank — always guess.',
        metrics: [
          { label: 'Time', value: '10 min' },
          { label: 'Blank answers', value: 'always guess' },
        ],
        color: '#06b6d4',
      }),
      node('li-review', 'task', 1320, 140, {
        label: 'Final Review',
        description: 'Check plurals & word limits',
        details: 'Common transfer errors:\n• Singular vs plural (e.g., "flower" vs "flowers")\n• Exceeding word limits ("NO MORE THAN TWO WORDS")\n• Transferring to the wrong question number\n• Spelling errors on proper nouns\n\nBand 9 listeners still check — the 10 minutes is there for a reason.',
        color: '#f97316',
      }),
      node('li-end', 'end', 1540, 140, {
        label: 'Submission',
        description: 'Answer sheet collected',
        details: 'Correct answers = 1 mark each (40 total).\nBand conversion (Academic/GT):\n• 39–40 correct → Band 9.0\n• 35–36 correct → Band 8.0\n• 30–31 correct → Band 7.0\n• 23–25 correct → Band 6.0',
        metrics: [
          { label: 'Total marks', value: '40' },
          { label: 'Band score', value: 'B7 = 30/40' },
        ],
        color: '#10b981',
      }),
    ],
    edges: [
      edge('li-e1', 'li-start', 'li-vocab', undefined, { color: '#10b981' }),
      edge('li-e2', 'li-vocab', 'li-listen', undefined, { color: '#3b82f6' }),
      edge('li-e3', 'li-listen', 'li-distractor'),
      edge('li-e4', 'li-distractor', 'li-correct', 'yes — changed', { color: '#f43f5e', dashed: true }),
      edge('li-e5', 'li-distractor', 'li-transfer', 'no change', { color: '#10b981' }),
      edge('li-e6', 'li-correct', 'li-transfer', undefined, { color: '#10b981' }),
      edge('li-e7', 'li-transfer', 'li-review', undefined, { color: '#06b6d4' }, true),
      edge('li-e8', 'li-review', 'li-end'),
    ],
  }
}

// ─── 4. IELTS Reading Strategy ────────────────────────────────────────────────

function ieltsReading(): Workflow {
  const now = Date.now()
  return {
    id: uid(),
    name: 'IELTS Reading — Skimming & Scanning Workflow',
    description: 'Efficient 60-minute reading strategy: overview, skim, locate, answer, and final check.',
    category: 'ielts',
    tags: ['ielts', 'reading', 'skimming', 'scanning'],
    createdAt: now,
    updatedAt: now,
    nodes: [
      node('rd-start', 'start', 0, 120, {
        label: 'Allocate Time',
        description: 'Divide 60 min across 3 passages',
        details: 'Recommended time split:\n• Passage 1 (easiest): 17 minutes\n• Passage 2 (medium): 20 minutes\n• Passage 3 (hardest): 23 minutes\n\nAlways start timing when you turn to each passage. Strict time discipline is the #1 differentiator between Band 6 and Band 7 readers.',
        metrics: [
          { label: 'Total time', value: '60 min' },
          { label: 'Passages', value: '3' },
        ],
        color: '#10b981',
      }),
      node('rd-overview', 'task', 220, 120, {
        label: 'Overview (90 sec)',
        description: 'Title, headings, images',
        details: 'Spend 90 seconds on structural overview:\n• Read the title and subtitle\n• Read all subheadings (if present)\n• Glance at any figures, tables, or captions\n• Read the first sentence of each paragraph\n\nThis builds a mental map — you\'ll locate answers 40% faster.',
        metrics: [{ label: 'Time', value: '90 sec' }],
        color: '#3b82f6',
      }),
      node('rd-questions', 'task', 440, 60, {
        label: 'Read Questions First',
        description: 'Understand what to look for',
        details: 'Before reading the passage in detail:\n1. Read all questions for the passage\n2. Identify the question type (matching headings, T/F/NG, sentence completion, etc.)\n3. Underline key nouns and proper nouns in each question\n\nThis converts passive reading into active searching.',
        color: '#8b5cf6',
        metrics: [{ label: 'Time', value: '2 min' }],
      }),
      node('rd-skim', 'task', 660, 60, {
        label: 'Skim the Passage',
        description: 'Main idea only — no detail',
        details: 'Read at 2–3× your normal speed. Focus only on:\n• First and last sentence of each paragraph\n• Transition words ("However", "In contrast", "Therefore")\n• Emphasized words (italics, bold, quotes)\n\nDo NOT read every word. Band 9 test-takers process roughly 1,500 words in 3 minutes.',
        metrics: [{ label: 'Speed', value: '~500 wpm' }],
        color: '#06b6d4',
      }),
      node('rd-scan', 'task', 880, 60, {
        label: 'Scan for Answers',
        description: 'Target specific information',
        details: 'For each question:\n1. Identify a unique keyword from the question\n2. Move your eyes rapidly down the passage searching for that keyword or its synonym\n3. When found, slow down and read that section carefully\n4. Verify the answer fits the grammatical form required\n\nSynonyms trap: the text never uses the question\'s exact words for B7+ questions.',
        color: '#f97316',
        metrics: [{ label: 'Method', value: 'keyword → synonym' }],
      }),
      node('rd-tfng', 'decision', 1100, 120, {
        label: 'T/F/NG Question?',
        description: 'True / False / Not Given',
        details: 'T/F/NG is the most misunderstood question type:\n• TRUE: the passage explicitly states it\n• FALSE: the passage explicitly contradicts it\n• NOT GIVEN: the passage neither confirms nor denies it\n\n⚠️ Do not use your personal knowledge. Only what the passage says counts.',
      }),
      node('rd-tfng-strat', 'task', 1300, 40, {
        label: 'Apply T/F/NG Logic',
        description: 'Never guess with outside knowledge',
        details: 'Decision tree:\n1. Does the passage mention the subject? → If NO → Not Given\n2. Does it state the same thing? → If YES → True\n3. Does it state the opposite? → If YES → False\n4. Is it only partially mentioned? → Not Given (partial ≠ true)\n\nBand 7 students get 80%+ on T/F/NG once they learn this logic.',
        color: '#f59e0b',
        metrics: [{ label: 'Band score', value: 'B7 = 80%' }],
      }),
      node('rd-check', 'task', 1300, 200, {
        label: 'Final Check',
        description: 'Verify blanks and limits',
        details: 'In the last 2 minutes:\n• Ensure NO blank answers (no negative marking)\n• Verify word count limits on completion tasks\n• Re-read any answers you were uncertain about\n• Transfer answers correctly if working on rough paper\n\n🚫 Changing answers randomly in the last minute usually reduces your score.',
        color: '#8b5cf6',
        metrics: [{ label: 'Time', value: '2 min' }],
      }),
      node('rd-end', 'end', 1540, 120, {
        label: 'Complete',
        description: 'Move to next passage or finish',
        details: 'Band score guide (Academic Reading, 40 questions):\n• 39–40 → Band 9.0\n• 35–36 → Band 8.0\n• 30–31 → Band 7.0\n• 23–25 → Band 6.0\n• 16–18 → Band 5.0',
        metrics: [
          { label: 'Total marks', value: '40' },
          { label: 'Band 7 target', value: '30/40' },
        ],
        color: '#10b981',
      }),
    ],
    edges: [
      edge('rd-e1', 'rd-start', 'rd-overview', undefined, { color: '#10b981' }),
      edge('rd-e2', 'rd-overview', 'rd-questions', undefined, { color: '#3b82f6' }),
      edge('rd-e3', 'rd-questions', 'rd-skim', undefined, { color: '#8b5cf6' }),
      edge('rd-e4', 'rd-skim', 'rd-scan', undefined, { color: '#06b6d4' }, true),
      edge('rd-e5', 'rd-scan', 'rd-tfng'),
      edge('rd-e6', 'rd-tfng', 'rd-tfng-strat', 'T/F/NG type', { color: '#f59e0b', dashed: true }),
      edge('rd-e7', 'rd-tfng', 'rd-check', 'other types', { color: '#10b981' }),
      edge('rd-e8', 'rd-tfng-strat', 'rd-check', undefined, { color: '#f59e0b' }),
      edge('rd-e9', 'rd-check', 'rd-end'),
    ],
  }
}

// ─── 5. ESL Lesson Planning Pipeline ─────────────────────────────────────────

function eslLessonPlanning(): Workflow {
  const now = Date.now()
  return {
    id: uid(),
    name: 'ESL Lesson Planning Pipeline',
    description: 'Full PPP lesson plan from needs analysis to reflection, with timing and differentiation notes.',
    category: 'esl',
    tags: ['esl', 'lesson plan', 'ppp', 'teaching'],
    createdAt: now,
    updatedAt: now,
    nodes: [
      node('lp-start', 'start', 0, 140, {
        label: 'Needs Analysis',
        description: 'Who are your learners?',
        details: 'Before writing a single objective, establish:\n• CEFR level (A1–C2)\n• First language / L1 interference patterns\n• Learning goals (exam? communication? work?)\n• Learning style preferences\n• Previous errors or gaps from last lesson\n\nThe best lessons solve the learner\'s actual problem, not an imagined one.',
        color: '#10b981',
        metrics: [
          { label: 'CEFR levels', value: 'A1–C2' },
          { label: 'Time', value: '10 min' },
        ],
      }),
      node('lp-obj', 'task', 220, 140, {
        label: 'Set SMART Objectives',
        description: 'Specific, measurable outcomes',
        details: 'Write 1–3 SMART objectives:\n• Specific — "Students will use the present perfect to express life experiences"\n• Measurable — "produce 5 sentences using the target form"\n• Achievable — appropriate for CEFR level\n• Relevant — tied to learner goal\n• Time-bound — "by the end of the 60-minute lesson"\n\nObjectives drive every subsequent design decision.',
        color: '#3b82f6',
        metrics: [{ label: 'Max objectives', value: '1–3' }],
      }),
      node('lp-warmup', 'task', 440, 80, {
        label: 'Warmer / Lead-in',
        description: 'Engage & activate schemata',
        details: 'Purpose: motivate, recycle prior knowledge, and contextualise the lesson topic.\n\nEffective warmers:\n• Image-based discussion\n• Quick quiz or poll\n• Anecdote or video clip (max 2 min)\n• Vocabulary brainstorm on the board\n\nKeep it under 8 minutes — learners lose engagement if warmers drag.',
        color: '#f59e0b',
        metrics: [{ label: 'Duration', value: '5–8 min' }],
      }),
      node('lp-present', 'task', 660, 80, {
        label: 'Presentation (PPP)',
        description: 'Introduce target language in context',
        details: 'Present the target language (grammar, vocabulary, or function) in a meaningful context.\n\nMethods:\n• Text/dialogue with highlighted examples\n• Audio with transcript\n• Concept Checking Questions (CCQs) to verify understanding\n• Timeline or diagram (for tenses)\n\nAvoid metalanguage overload — show meaning through context first, label later.',
        color: '#8b5cf6',
        metrics: [
          { label: 'Duration', value: '10–15 min' },
          { label: 'CCQs', value: '3–5 min' },
        ],
      }),
      node('lp-practice', 'task', 880, 80, {
        label: 'Controlled Practice',
        description: 'Guided exercises — accuracy focus',
        details: 'Controlled practice builds accuracy before fluency:\n• Gap-fill, sentence transformation, matching\n• Drills (substitution, repetition with variation)\n• Information-gap with a single correct answer\n\nMonitor closely. Collect errors for delayed feedback — do not interrupt mid-task.\n\nICQ before starting: "Are you writing or speaking?" / "Do you work alone or in pairs?"',
        color: '#06b6d4',
        metrics: [
          { label: 'Duration', value: '10–15 min' },
          { label: 'Focus', value: 'accuracy' },
        ],
      }),
      node('lp-fb1', 'task', 1100, 80, {
        label: 'Feedback Round 1',
        description: 'Error correction & elicitation',
        details: 'Conduct whole-class feedback:\n• Write errors on board (anonymised)\n• Elicit the correct form from the class before revealing\n• Highlight the rule/pattern — connect to objective\n\nPeer correction before teacher correction builds learner autonomy.',
        color: '#f97316',
        metrics: [{ label: 'Duration', value: '5 min' }],
      }),
      node('lp-produce', 'task', 880, 220, {
        label: 'Freer Production',
        description: 'Communicative task — fluency focus',
        details: 'Production tasks promote fluency and authentic language use:\n• Role play, discussion, debate, storytelling\n• Information gap, problem-solving, survey\n• Writing task (paragraph, email, story)\n\nSet a clear communicative goal ("find three classmates who have never…"). Monitor without interrupting. Note errors for delayed feedback.',
        color: '#3b82f6',
        metrics: [
          { label: 'Duration', value: '15–20 min' },
          { label: 'Focus', value: 'fluency' },
        ],
      }),
      node('lp-fb2', 'task', 1100, 220, {
        label: 'Feedback Round 2',
        description: 'Delayed feedback on production errors',
        details: 'Reformulation and error feedback after production:\n• Use examples heard during monitoring\n• Board work: correct → incorrect alternatives\n• Positive feedback: highlight good language heard\n• Pronunciation: model and drill where needed\n\nBand 7 teachers correct 3–5 high-priority errors, not every mistake.',
        color: '#f97316',
        metrics: [{ label: 'Duration', value: '5 min' }],
      }),
      node('lp-close', 'task', 1320, 140, {
        label: 'Lesson Close & Homework',
        description: 'Recap + extend at home',
        details: 'Closing routine:\n1. Elicit key language from the lesson (not just lecturing)\n2. Relate back to objectives — "Did we achieve X?"\n3. Set meaningful homework: journal entry, recording, grammar worksheet\n4. Preview next lesson to build anticipation\n\nA good close takes only 3–5 minutes but dramatically improves retention.',
        color: '#8b5cf6',
        metrics: [{ label: 'Duration', value: '5 min' }],
      }),
      node('lp-reflect', 'end', 1540, 140, {
        label: 'Teacher Reflection',
        description: 'Post-lesson annotation',
        details: 'Immediately after class, note:\n• What worked well and why\n• What to change next time\n• Individual learner progress notes\n• Errors to recycle in the next lesson\n• Timing — which stages overran?\n\nReflective teachers improve 3–5× faster than those who don\'t journal.',
        metrics: [{ label: 'Habit', value: '5 min journal' }],
        color: '#10b981',
      }),
    ],
    edges: [
      edge('lp-e1', 'lp-start', 'lp-obj', undefined, { color: '#10b981' }),
      edge('lp-e2', 'lp-obj', 'lp-warmup', undefined, { color: '#3b82f6' }),
      edge('lp-e3', 'lp-warmup', 'lp-present', undefined, { color: '#f59e0b' }),
      edge('lp-e4', 'lp-present', 'lp-practice', undefined, { color: '#8b5cf6' }, true),
      edge('lp-e5', 'lp-practice', 'lp-fb1', undefined, { color: '#06b6d4' }),
      edge('lp-e6', 'lp-fb1', 'lp-produce', undefined, { color: '#f97316' }),
      edge('lp-e7', 'lp-produce', 'lp-fb2', undefined, { color: '#3b82f6' }),
      edge('lp-e8', 'lp-fb2', 'lp-close', undefined, { color: '#f97316' }),
      edge('lp-e9', 'lp-close', 'lp-reflect', undefined, { color: '#8b5cf6' }),
    ],
  }
}

// ─── 6. ESL Error Correction Workflow ─────────────────────────────────────────

function eslErrorCorrection(): Workflow {
  const now = Date.now()
  return {
    id: uid(),
    name: 'ESL Error Correction Decision Tree',
    description: 'How to identify, classify, and correct learner errors with the right strategy for the right moment.',
    category: 'esl',
    tags: ['esl', 'error correction', 'feedback', 'teaching'],
    createdAt: now,
    updatedAt: now,
    nodes: [
      node('ec-start', 'start', 0, 160, {
        label: 'Error Detected',
        description: 'Spoken or written mistake observed',
        details: 'An error is a systematic gap in interlanguage — it reveals what the learner has yet to acquire. A mistake is a slip the learner can self-correct when alerted.\n\nDistinguishing the two changes your corrective approach entirely.',
        color: '#10b981',
      }),
      node('ec-classify', 'task', 220, 160, {
        label: 'Classify the Error',
        description: 'Type matters for correction strategy',
        details: 'Error taxonomy:\n• Grammatical — tense, agreement, article\n• Lexical — wrong word choice, false friends\n• Phonological — pronunciation, stress, intonation\n• Pragmatic — inappropriate register or politeness\n• Discourse — cohesion, paragraph structure\n\nClassification shapes the correction technique.',
        color: '#3b82f6',
        metrics: [{ label: 'Types', value: '5 categories' }],
      }),
      node('ec-fluency', 'decision', 440, 160, {
        label: 'Fluency or Accuracy Task?',
        description: 'Context determines when to correct',
        details: 'The cardinal rule of error correction:\n• ACCURACY tasks → correct immediately (during or after)\n• FLUENCY tasks → delay correction (never interrupt communication flow)\n\nInterrupting a speaking task for errors destroys learner confidence and makes the lesson teacher-centered.',
      }),
      node('ec-immediate', 'task', 660, 60, {
        label: 'Immediate Correction',
        description: 'During controlled accuracy work',
        details: 'Techniques for immediate correction:\n• Recast: repeat the sentence correctly without drawing attention ("Oh, you went there? Great.")\n• Elicitation: "Can you say that again?", "Are you sure about the tense?"\n• Explicit correction: "We say X, not Y, because…"\n• Finger highlighting: hold up fingers for each word, tap the incorrect one\n\nRecast is the least disruptive — prefer it for shy learners.',
        color: '#10b981',
        metrics: [{ label: 'Best for', value: 'accuracy tasks' }],
      }),
      node('ec-delayed', 'task', 660, 280, {
        label: 'Delayed Correction',
        description: 'After the production task ends',
        details: 'During the fluency task, quietly note errors on a clipboard or digital note.\n\nAfter the task:\n1. Write selected errors on the board (anonymous — never name the student)\n2. Ask: "Is this correct? How would you improve it?"\n3. Elicit the correction from the class\n4. Drill the correct form 2–3 times\n\n📌 Select only the 3–5 most important errors — cognitive overload kills retention.',
        color: '#f59e0b',
        metrics: [{ label: 'Max errors', value: '3–5' }],
      }),
      node('ec-strategy', 'decision', 880, 160, {
        label: 'Learner Notices Error?',
        description: 'Self-repair or teacher-led?',
        details: 'Self-repair is the gold standard for acquisition.\n\nAfter using a prompt or recast:\n• If the learner self-corrects → praise briefly and move on\n• If the learner doesn\'t notice → use a more explicit technique\n• If persistent after 2 attempts → note for recycling, don\'t dwell',
      }),
      node('ec-selfrepair', 'task', 1100, 80, {
        label: 'Learner Self-Corrects',
        description: 'Best outcome — praise & continue',
        details: 'When a learner successfully self-corrects:\n• Acknowledge with brief positive feedback: "Exactly right!"\n• Do NOT over-praise — it disrupts flow\n• Record that the learner can self-repair this error type\n\nSelf-repair is evidence of noticing — the crucial first step in acquisition.',
        color: '#10b981',
        metrics: [{ label: 'Acquisition signal', value: '✓ noticing' }],
      }),
      node('ec-teachercorrect', 'task', 1100, 240, {
        label: 'Teacher Models Correction',
        description: 'Explicit form focus',
        details: 'When the learner cannot self-repair:\n1. Provide the correct form clearly\n2. Briefly explain why ("We use \'have been\' because this started in the past and continues now")\n3. Ask the learner to repeat the correct form\n4. Add to your "errors to recycle" list for the next lesson\n\nNever over-correct — target only errors that impede communication or are above the learner\'s current level.',
        color: '#f43f5e',
      }),
      node('ec-recycle', 'task', 1320, 160, {
        label: 'Recycle in Future Lessons',
        description: 'Spaced retrieval practice',
        details: 'Errors that recur signal a fossilised pattern. To break it:\n• Include the target structure in the next lesson\'s objectives\n• Use spaced repetition: revisit at lesson 2, 4, and 8\n• Include it in a quiz or test for accountability\n\nResearch shows 6–8 spaced encounters are needed to acquire a new form at B2+ level.',
        color: '#8b5cf6',
        metrics: [{ label: 'Repetitions needed', value: '6–8 times' }],
      }),
      node('ec-end', 'end', 1540, 160, {
        label: 'Error Addressed',
        description: 'Continue lesson or close loop',
        details: 'After the correction cycle:\n• Update your lesson notes / learner profile\n• If during a lesson, continue the task smoothly\n• If end of lesson, assign homework targeting the error type\n\nGood error correction is invisible to the learner but transformational over time.',
        color: '#10b981',
      }),
    ],
    edges: [
      edge('ec-e1', 'ec-start', 'ec-classify', undefined, { color: '#10b981' }),
      edge('ec-e2', 'ec-classify', 'ec-fluency', undefined, { color: '#3b82f6' }),
      edge('ec-e3', 'ec-fluency', 'ec-immediate', 'accuracy', { color: '#10b981' }),
      edge('ec-e4', 'ec-fluency', 'ec-delayed', 'fluency', { color: '#f59e0b', dashed: true }),
      edge('ec-e5', 'ec-immediate', 'ec-strategy'),
      edge('ec-e6', 'ec-delayed', 'ec-strategy'),
      edge('ec-e7', 'ec-strategy', 'ec-selfrepair', 'yes', { color: '#10b981' }),
      edge('ec-e8', 'ec-strategy', 'ec-teachercorrect', 'no', { color: '#f43f5e', dashed: true, arrowEnd: 'open' }),
      edge('ec-e9', 'ec-selfrepair', 'ec-recycle', undefined, { color: '#10b981' }),
      edge('ec-e10', 'ec-teachercorrect', 'ec-recycle', undefined, { color: '#f43f5e' }),
      edge('ec-e11', 'ec-recycle', 'ec-end', undefined, { color: '#8b5cf6' }),
    ],
  }
}

// ─── 7. RAG Pipeline (Retrieval-Augmented Generation) ─────────────────────────

export function ragPipeline(): Workflow {
  const now = Date.now()
  return {
    id: uid(),
    name: 'RAG Pipeline — Enterprise Knowledge Retrieval',
    description:
      'Production-grade Retrieval-Augmented Generation pipeline: document ingestion, semantic chunking, dense vector embeddings, vector database similarity search, prompt synthesis, and grounded LLM generation.',
    category: 'ai',
    tags: ['ai', 'rag', 'vector-db', 'embeddings', 'llm', 'retrieval', 'knowledge-base'],
    createdAt: now,
    updatedAt: now,
    nodes: [
      node('rag-docs', 'tool', 0, 120, {
        label: 'Document Ingestion',
        description: 'Multi-format document loaders',
        details:
          'Ingest enterprise knowledge documents across PDFs, Markdown manuals, Notion pages, and Confluence spaces. Strips formatting noise, normalizes UTF-8 encoding, and extracts structured metadata (source URL, document version, access permissions, timestamp).',
        codeSnippet: `from langchain_community.document_loaders import PyPDFDirectoryLoader

loader = PyPDFDirectoryLoader("./enterprise_docs/")
raw_documents = loader.load()
print(f"Loaded {len(raw_documents)} raw document pages")`,
        metrics: [
          { label: 'Throughput', value: '45 docs/s' },
          { label: 'Formats', value: 'PDF/MD/HTML' },
        ],
        color: '#06b6d4',
        functionSignature: 'load_documents(directory_path: str, supported_types: list[str]) -> list[Document]',
        apiEndpoint: 'https://ingest.enterprise.internal/v1/documents',
        httpMethod: 'POST',
      }),
      node('rag-chunking', 'tool', 240, 120, {
        label: 'Semantic Chunking',
        description: 'Recursive token splitting',
        details:
          'Decomposes long documents into semantically coherent text chunks. Employs recursive character/token boundary splitting with a 15% sliding window overlap to maintain contextual continuity across adjacent chunks.',
        codeSnippet: `from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=512,
    chunk_overlap=64,
    separators=["\\n\\n", "\\n", ". ", " ", ""]
)
chunks = splitter.split_documents(raw_documents)`,
        metrics: [
          { label: 'Chunk size', value: '512 tokens' },
          { label: 'Overlap', value: '64 tokens' },
        ],
        color: '#06b6d4',
        functionSignature: 'chunk_documents(documents: list[Document], chunk_size: int, chunk_overlap: int) -> list[Chunk]',
        httpMethod: 'RPC',
      }),
      node('rag-embed', 'llm-model', 480, 120, {
        label: 'Vector Embeddings',
        description: 'Generate dense text vectors',
        details:
          'Passes text chunks through a neural embedding model (e.g. OpenAI text-embedding-3-small or Google Gecko) to project semantic meaning into a 1536-dimensional latent space with cosine similarity optimization.',
        codeSnippet: `from openai import OpenAI

client = OpenAI()
response = client.embeddings.create(
    input=[c.page_content for c in chunks],
    model="text-embedding-3-small"
)
embeddings = [e.embedding for e in response.data]`,
        metrics: [
          { label: 'Dimensions', value: '1536' },
          { label: 'Latency', value: '85ms' },
          { label: 'Model', value: 'text-embedding-3' },
        ],
        color: '#8b5cf6',
        model: 'text-embedding-3-small',
      }),
      node('rag-vecdb', 'tool', 720, 120, {
        label: 'Vector DB Query',
        description: 'Cosine similarity search & HNSW',
        details:
          'Indexes vectors in Pinecone / Chroma / Milvus using Hierarchical Navigable Small World (HNSW) graphs. When a user query arrives, it embeds the query and retrieves the Top-K closest document chunks filtered by metadata permissions.',
        codeSnippet: `results = vector_db.similarity_search_with_score(
    query="How do I configure SAML 2.0 SSO?",
    k=4,
    filter={"status": "published"}
)
top_context = "\\n---\\n".join([doc.page_content for doc, score in results])`,
        metrics: [
          { label: 'Top-K', value: 'k=4' },
          { label: 'Search latency', value: '12ms' },
          { label: 'Index type', value: 'HNSW' },
        ],
        color: '#06b6d4',
        functionSignature: 'similarity_search(query_vector: list[float], top_k: int = 4, filter_expr: dict = None) -> list[ScoredChunk]',
        apiEndpoint: 'https://vectordb.enterprise.internal/v2/query',
        httpMethod: 'POST',
      }),
      node('rag-prompt', 'prompt', 960, 120, {
        label: 'LLM Prompt Generation',
        description: 'Context injection & anti-hallucination',
        details:
          'Assembles the grounded prompt template, injecting retrieved context passages, user question, conversation history, and system instructions. Enforces strict anti-hallucination guardrails demanding explicit context attribution.',
        codeSnippet: `SYSTEM: You are a factual enterprise assistant. Answer the question STRICTLY using the context below. If the answer cannot be determined from the context, state that you do not have sufficient information.

CONTEXT:
{retrieved_context}

USER QUESTION: {user_query}`,
        metrics: [
          { label: 'Context tokens', value: '1,840' },
          { label: 'Grounding score', value: '98.5%' },
        ],
        color: '#ec4899',
        systemPrompt:
          'You are a factual enterprise assistant. Answer the question STRICTLY using the context provided below. If the answer cannot be determined from the context, state that you do not have sufficient information. Always include bracketed citations [Doc X] for every claim.',
        userPrompt:
          'CONTEXT:\\n{retrieved_context}\\n\\nUSER QUESTION: {user_query}\\n\\nPlease provide a clear, step-by-step answer based only on the context above.',
      }),
      node('rag-llm-gen', 'llm-model', 1200, 120, {
        label: 'Answer Generation',
        description: 'Grounded reasoning & streaming response',
        details:
          'Executes inference on foundation LLM (Gemini 1.5 Pro / GPT-4o) with low temperature (0.2) for deterministic, grounded reasoning. Streams response tokens with inline citation markers back to client.',
        codeSnippet: `completion = client.chat.completions.create(
    model="gpt-4o",
    temperature=0.2,
    max_tokens=1024,
    messages=[{"role": "user", "content": populated_prompt}]
)
answer = completion.choices[0].message.content`,
        metrics: [
          { label: 'Model', value: 'GPT-4o / Gemini' },
          { label: 'Temperature', value: '0.2' },
          { label: 'TTFT', value: '280ms' },
        ],
        color: '#8b5cf6',
        model: 'gpt-4o',
        temperature: 0.2,
        maxTokens: 1024,
      }),
      node('rag-end', 'end', 1440, 120, {
        label: 'Verified Response',
        description: 'Deliver grounded output to client',
        details:
          'Delivers citation-grounded response to the user with complete provenance metadata, latency metrics, and token cost telemetry.',
        metrics: [
          { label: 'Total latency', value: '410ms' },
          { label: 'Alignment score', value: '99.2%' },
          { label: 'Cost', value: '$0.0032' },
        ],
        color: '#10b981',
      }),
    ],
    edges: [
      edge('rag-e1', 'rag-docs', 'rag-chunking', undefined, { color: '#06b6d4' }),
      edge('rag-e2', 'rag-chunking', 'rag-embed', undefined, { color: '#8b5cf6' }),
      edge('rag-e3', 'rag-embed', 'rag-vecdb', undefined, { color: '#06b6d4' }),
      edge('rag-e4', 'rag-vecdb', 'rag-prompt', undefined, { color: '#ec4899' }, true),
      edge('rag-e5', 'rag-prompt', 'rag-llm-gen', undefined, { color: '#8b5cf6' }),
      edge('rag-e6', 'rag-llm-gen', 'rag-end', undefined, { color: '#10b981' }),
    ],
  }
}

// ─── 8. Multi-Agent Reflection Loop ──────────────────────────────────────────

export function multiAgentReflection(): Workflow {
  const now = Date.now()
  return {
    id: uid(),
    name: 'Multi-Agent Reflection & Self-Correction Loop',
    description:
      'Iterative actor-critic agent system: a primary generator agent drafts a solution, a critic agent reviews against strict rubrics, and feedback drives iterative self-correction until quality thresholds are satisfied.',
    category: 'ai',
    tags: ['ai', 'multi-agent', 'reflection', 'critic', 'self-correction', 'iteration', 'evals'],
    createdAt: now,
    updatedAt: now,
    nodes: [
      node('ref-start', 'start', 0, 140, {
        label: 'User Request',
        description: 'Task specification & constraints',
        details:
          'Captures complex user requirements, performance benchmarks, styling guidelines, and strict verification constraints for challenging coding, reasoning, or content synthesis tasks.',
        codeSnippet: `{
  "task": "Implement an async distributed rate-limiter in TypeScript",
  "constraints": [
    "Redis backend",
    "Sliding window log algorithm",
    "Zero memory leak",
    "Unit test suite"
  ]
}`,
        metrics: [
          { label: 'Task complexity', value: 'High' },
          { label: 'Input tokens', value: '280' },
        ],
        color: '#10b981',
      }),
      node('ref-primary-agent', 'agent', 240, 140, {
        label: 'Primary Agent Draft',
        description: 'Actor agent generates initial solution',
        details:
          'The primary Actor Agent synthesizes an initial full-featured draft solution utilizing chain-of-thought decomposition and domain-specific code tools.',
        codeSnippet: `class GeneratorAgent:
    system_prompt = "You are a Principal Software Engineer. Write clean, production-grade solutions."
    
    def draft(self, spec, previous_critique=None):
        return llm.invoke(format_messages(spec, previous_critique))`,
        metrics: [
          { label: 'Agent role', value: 'Primary Actor' },
          { label: 'Model', value: 'Claude 3.5 Sonnet' },
          { label: 'Temperature', value: '0.7' },
        ],
        color: '#6366f1',
        systemInstructions:
          'You are a Principal Software Engineer. Write clean, modular, and production-grade TypeScript implementations strictly adhering to provided specifications and constraints.',
        model: 'claude-3-5-sonnet',
        temperature: 0.7,
      }),
      node('ref-critic-agent', 'agent', 500, 140, {
        label: 'Critic Agent Review',
        description: 'Rigorous validation & edge-case audit',
        details:
          'An adversarial Critic Agent systematically audits the draft against 5 dimensions: logical soundness, edge cases, vulnerability analysis, performance bottlenecks, and specification compliance. Emits itemized critiques and a quality score (0–100).',
        codeSnippet: `class CriticAgent:
    system_prompt = "You are a Staff QA & Security Auditor. Find all bugs, concurrency hazards, and edge cases."
    
    def evaluate(self, code_draft) -> EvaluationReport:
        return llm.with_structured_output(EvaluationReport).invoke(code_draft)`,
        metrics: [
          { label: 'Agent role', value: 'Critic / Auditor' },
          { label: 'Rubric criteria', value: '5 checks' },
          { label: 'Review latency', value: '340ms' },
        ],
        color: '#f59e0b',
        systemInstructions:
          'You are a Staff QA & Security Auditor. Methodically critique proposed code implementations across correctness, memory safety, concurrency, race conditions, edge case coverage, and style.',
        model: 'gpt-4o',
      }),
      node('ref-decision-gate', 'decision', 760, 140, {
        label: 'Score ≥ 90% or Max Loops?',
        description: 'Quality gate threshold check',
        details:
          'Evaluates whether the critic score satisfies the production standard (Score ≥ 90/100) or if max iteration count (e.g. 3 loops) has expired. If substandard, triggers feedback loop; otherwise routes to final answer generation.',
        metrics: [
          { label: 'Quality threshold', value: '90 / 100' },
          { label: 'Max loops', value: '3' },
        ],
        color: '#f59e0b',
      }),
      node('ref-refinement-prompt', 'prompt', 500, 300, {
        label: 'Feedback Synthesis Prompt',
        description: 'Injects critique for next iteration',
        details:
          'Compiles the critic\'s itemized feedback, flagged lines, and recommended fixes into a focused revision prompt for the Primary Agent\'s next correction pass.',
        codeSnippet: `CRITIQUE FEEDBACK (Loop {loop_count}):
- Issue: Concurrency race condition in sliding window timestamp eviction.
- Recommendation: Wrap Redis ZREMRANGEBYSCORE and ZADD in MULTI/EXEC transaction.

Please revise the implementation addressing every item above.`,
        metrics: [
          { label: 'Feedback items', value: '3 issues' },
          { label: 'Iteration step', value: '+1 loop' },
        ],
        color: '#ec4899',
        systemPrompt:
          'You are an iteration supervisor synthesizing structured critique reports into actionable revision guidelines.',
        userPrompt:
          'CRITIQUE FEEDBACK (Iteration {iteration_count}):\\n{itemized_critique_list}\\n\\nSCORE: {score}/100\\n\\nPlease rewrite the draft addressing all high-severity items above.',
      }),
      node('ref-refined-generator', 'llm-model', 1020, 140, {
        label: 'Refined Answer Generator',
        description: 'Final polish & documentation assembly',
        details:
          'Performs final compilation of the verified solution, generating TypeScript interfaces, comprehensive unit tests, JSDoc documentation, and algorithmic complexity notes.',
        codeSnippet: `final_deliverable = llm.generate(
    prompt=f"Compile final validated artifact with docs and tests:\\n{approved_draft}",
    temperature=0.2
)`,
        metrics: [
          { label: 'Accuracy rate', value: '97.4%' },
          { label: 'Alignment score', value: '98.8%' },
          { label: 'Token count', value: '2,640' },
        ],
        color: '#8b5cf6',
        model: 'gpt-4o',
        temperature: 0.2,
        maxTokens: 4096,
      }),
      node('ref-end', 'end', 1260, 140, {
        label: 'Final Delivery',
        description: 'Approved deliverable & audit history',
        details:
          'Emits production-ready deliverable accompanied by the complete reflection audit trail, critic scores across iterations, and performance benchmarks.',
        metrics: [
          { label: 'Final score', value: '96 / 100' },
          { label: 'Iterations taken', value: '2' },
          { label: 'Total cost', value: '$0.018' },
        ],
        color: '#10b981',
      }),
    ],
    edges: [
      edge('ref-e1', 'ref-start', 'ref-primary-agent', undefined, { color: '#10b981' }),
      edge('ref-e2', 'ref-primary-agent', 'ref-critic-agent', undefined, { color: '#6366f1' }, true),
      edge('ref-e3', 'ref-critic-agent', 'ref-decision-gate', undefined, { color: '#f59e0b' }),
      edge('ref-e4', 'ref-decision-gate', 'ref-refined-generator', 'Score ≥ 90%', { color: '#10b981' }),
      edge('ref-e5', 'ref-decision-gate', 'ref-refinement-prompt', 'Score < 90%', {
        color: '#f43f5e',
        dashed: true,
        lineStyle: 'bezier',
        arrowEnd: 'open',
      }),
      edge('ref-e6', 'ref-refinement-prompt', 'ref-primary-agent', 'Retry with Critique', {
        color: '#ec4899',
        dashed: true,
      }),
      edge('ref-e7', 'ref-refined-generator', 'ref-end', undefined, { color: '#8b5cf6' }),
    ],
  }
}

// ─── 9. Router-Classifier Pattern ─────────────────────────────────────────────

export function routerClassifierPattern(): Workflow {
  const now = Date.now()
  return {
    id: uid(),
    name: 'Router-Classifier Dynamic Multi-Agent Routing',
    description:
      'Intelligent intent classification and execution routing: a user request enters a high-speed LLM classifier router and branches dynamically into Customer Support, Technical Specialist, or Fast General LLM.',
    category: 'ai',
    tags: ['ai', 'router', 'classifier', 'multi-agent', 'intent-classification', 'branching', 'gateway'],
    createdAt: now,
    updatedAt: now,
    nodes: [
      node('route-query', 'start', 0, 180, {
        label: 'User Query Ingestion',
        description: 'Multi-channel request gateway',
        details:
          'Receives raw natural language query from API gateway, web interface, or Slack bot. Normalizes input, redacts sensitive customer PII, and enriches payload with user authorization context.',
        codeSnippet: `incoming_request = {
    "user_id": "usr_88219",
    "tier": "enterprise",
    "query": "Our production database connection pool is throwing 504 gateway timeout errors under load"
}`,
        metrics: [
          { label: 'Protocol', value: 'REST / WebSocket' },
          { label: 'Input tokens', value: '42' },
        ],
        color: '#10b981',
      }),
      node('route-classifier', 'decision', 260, 180, {
        label: 'LLM Router & Classifier',
        description: 'Semantic intent & domain classifier',
        details:
          'High-throughput classification model (or function-calling router) parses query semantics, technical complexity, and urgency. Classifies the query into one of three execution paths: Support Agent, Technical Specialist, or General LLM.',
        codeSnippet: `class RouteDecision(BaseModel):
    intent: Literal["support", "technical", "general"]
    confidence: float
    urgency: Literal["low", "medium", "critical"]

router = llm.with_structured_output(RouteDecision)
route = router.invoke(f"Classify query destination:\\n{incoming_request['query']}")`,
        metrics: [
          { label: 'Router model', value: 'GPT-4o-mini' },
          { label: 'Latency', value: '42ms' },
          { label: 'Accuracy', value: '99.2%' },
        ],
        color: '#f59e0b',
        model: 'gpt-4o-mini',
        temperature: 0.0,
      }),
      node('route-support-agent', 'agent', 580, 40, {
        label: 'Path A: Support Agent',
        description: 'Billing, accounts & subscriptions',
        details:
          'Specialized customer support agent equipped with CRM connectors, billing adjustment tools, and SLA escalation policies for non-technical customer success workflows.',
        codeSnippet: `class CustomerSupportAgent:
    tools = [fetch_stripe_customer, modify_subscription, create_zendesk_ticket]
    system_prompt = "You are an empathetic, policy-compliant Customer Support Agent."`,
        metrics: [
          { label: 'Tools connected', value: '4 tools' },
          { label: 'SLA target', value: '< 2s' },
          { label: 'CSAT rating', value: '4.9 / 5' },
        ],
        color: '#3b82f6',
        systemInstructions:
          'You are an empathetic, policy-compliant Customer Support Agent. Assist enterprise customers with subscription management, invoicing, seat allocations, and account inquiries.',
        model: 'gpt-4o',
      }),
      node('route-technical-agent', 'agent', 580, 180, {
        label: 'Path B: Technical Agent',
        description: 'Deep diagnostics, code & telemetry',
        details:
          'Engineering specialist agent equipped with Datadog log querying, Kubernetes pod diagnostics, SQL execution sandboxes, and stack trace analyzers to resolve complex technical incidents.',
        codeSnippet: `class TechnicalSpecialistAgent:
    tools = [query_datadog_traces, inspect_k8s_pods, run_sql_explain]
    system_prompt = "You are a Staff SRE & Systems Architect. Diagnose and resolve technical incidents."`,
        metrics: [
          { label: 'Tools connected', value: '6 tools' },
          { label: 'Resolution rate', value: '94.2%' },
          { label: 'Model', value: 'Claude 3.5 Sonnet' },
        ],
        color: '#6366f1',
        systemInstructions:
          'You are a Staff SRE & Systems Architect. Diagnose and resolve complex infrastructure, database, and application runtime incidents using telemetry and log analysis tools.',
        model: 'claude-3-5-sonnet',
      }),
      node('route-general-llm', 'llm-model', 580, 320, {
        label: 'Path C: General LLM',
        description: 'Fast zero-shot conversational responses',
        details:
          'Ultra-low-latency foundation model for answering general FAQs, conceptual definitions, and conversational queries that require no external tool execution.',
        codeSnippet: `fast_completion = fast_llm.invoke([
    {"role": "system", "content": "Provide direct, concise factual answers."},
    {"role": "user", "content": query}
])`,
        metrics: [
          { label: 'Model', value: 'Gemini 1.5 Flash' },
          { label: 'TTFT', value: '95ms' },
          { label: 'Cost / 1k', value: '$0.00015' },
        ],
        color: '#8b5cf6',
        model: 'gemini-1.5-flash',
        temperature: 0.3,
        maxTokens: 1024,
      }),
      node('route-tool-gateway', 'tool', 860, 110, {
        label: 'Enterprise Tool Gateway',
        description: 'Auth & API execution layer',
        details:
          'Secure Model Context Protocol (MCP) and REST tool execution gateway with strict Role-Based Access Control (RBAC), rate-limiting, and distributed audit logging.',
        codeSnippet: `async def execute_tool_call(tool_name: str, params: dict, user_context: dict):
    verify_rbac(user_context, tool_name)
    return await mcp_tool_runner.execute(tool_name, params)`,
        metrics: [
          { label: 'Auth security', value: 'RBAC + OAuth' },
          { label: 'Execution p99', value: '88ms' },
        ],
        color: '#06b6d4',
        functionSignature: 'execute_mcp_tool(tool_id: str, payload: dict, auth_token: str) -> ToolResult',
        apiEndpoint: 'https://gateway.enterprise.internal/v1/mcp/execute',
        httpMethod: 'POST',
      }),
      node('route-response-aggregator', 'prompt', 1120, 180, {
        label: 'Response Synthesis & Polish',
        description: 'Unified response schema & safety checks',
        details:
          'Aggregates tool outputs and agent reasoning into a unified, user-facing markdown response. Executes automated safety, brand tone, and content policy verifications before dispatch.',
        codeSnippet: `SYNTHESIS TEMPLATE:
Format raw agent output: {agent_output}
Include: Summary, step-by-step resolution, and action items.`,
        metrics: [
          { label: 'Safety check', value: '100% passed' },
          { label: 'Output format', value: 'Markdown' },
        ],
        color: '#ec4899',
        systemPrompt:
          'Synthesize multiple agent execution traces and tool outputs into a polished, professional response adhering to enterprise tone guidelines.',
        userPrompt:
          'AGENT EXECUTION TRACE:\\n{agent_trace}\\n\\nTOOL RESULTS:\\n{tool_results}\\n\\nPlease generate a clean Markdown response with executive summary, resolution, and next steps.',
      }),
      node('route-end', 'end', 1360, 180, {
        label: 'Dispatched Response',
        description: 'Stream response to client',
        details:
          'Streams final response to user client along with routing telemetry (selected route, confidence score, end-to-end latency, and cost breakdown).',
        metrics: [
          { label: 'Total latency', value: '290ms' },
          { label: 'Routing accuracy', value: '99.4%' },
          { label: 'Cost', value: '$0.0048' },
        ],
        color: '#10b981',
      }),
    ],
    edges: [
      edge('route-e1', 'route-query', 'route-classifier', undefined, { color: '#10b981' }),
      edge('route-e2', 'route-classifier', 'route-support-agent', 'Path A: Support', { color: '#3b82f6' }),
      edge('route-e3', 'route-classifier', 'route-technical-agent', 'Path B: Technical', { color: '#6366f1' }),
      edge('route-e4', 'route-classifier', 'route-general-llm', 'Path C: General', { color: '#8b5cf6' }),
      edge('route-e5', 'route-support-agent', 'route-tool-gateway', undefined, { color: '#3b82f6' }),
      edge('route-e6', 'route-technical-agent', 'route-tool-gateway', undefined, { color: '#6366f1' }),
      edge('route-e7', 'route-tool-gateway', 'route-response-aggregator', undefined, { color: '#06b6d4' }, true),
      edge('route-e8', 'route-general-llm', 'route-response-aggregator', undefined, {
        color: '#8b5cf6',
        lineStyle: 'bezier',
      }),
      edge('route-e9', 'route-response-aggregator', 'route-end', undefined, { color: '#ec4899' }),
    ],
  }
}


// ─── 10. GTD Weekly Review ────────────────────────────────────────────────
export function gtdReview(): Workflow {
  const now = Date.now()
  return {
    id: uid(),
    name: 'GTD Weekly Review Pipeline',
    description: 'A structured Getting Things Done (GTD) weekly review to clear your mind, organize tasks, and plan the week ahead.',
    category: 'productivity',
    tags: ['productivity', 'gtd', 'planning', 'organization'],
    createdAt: now,
    updatedAt: now,
    nodes: [
      node('gtd-1', 'start', 0, 0, { label: 'Clear the Deck', description: 'Empty your physical and digital inboxes', details: 'Gather all loose papers, receipts, and notes. Process your email inbox to zero. Move everything into your trusted system.' }),
      node('gtd-2', 'task', 0, 150, { label: 'Mind Sweep', description: 'Write down everything on your mind', details: 'Do a brain dump. Write down every idea, task, and commitment that is taking up mental space. Do not process them yet, just capture.' }),
      node('gtd-3', 'task', 0, 300, { label: 'Review Next Actions', description: 'Update your action lists', details: 'Go through your Next Actions lists. Cross off completed items. Move items that require waiting to the Waiting For list.' }),
      node('gtd-4', 'decision', 0, 450, { label: 'Project Review', description: 'Are all projects moving forward?', details: 'Review your active projects list. Ensure every project has at least one current Next Action.' }),
      node('gtd-5a', 'task', -150, 600, { label: 'Add Next Actions', description: 'Create actions for stalled projects', details: 'Break down the stalled project into the very next physical, visible action required to move it forward.' }),
      node('gtd-5b', 'task', 150, 600, { label: 'Review Someday/Maybe', description: 'Check your someday/maybe list', details: 'Review projects you put on hold. Are any of them ready to become active?' }),
      node('gtd-6', 'end', 0, 750, { label: 'Weekly Plan Set', description: 'Ready for the week', details: 'Your system is clear, current, and complete. You are ready to execute with a clear mind.' })
    ],
    edges: [
      edge('e-gtd1', 'gtd-1', 'gtd-2'),
      edge('e-gtd2', 'gtd-2', 'gtd-3'),
      edge('e-gtd3', 'gtd-3', 'gtd-4'),
      edge('e-gtd4a', 'gtd-4', 'gtd-5a', 'Needs action', { color: '#f59e0b' }),
      edge('e-gtd4b', 'gtd-4', 'gtd-5b', 'Looks good', { color: '#10b981' }),
      edge('e-gtd5a', 'gtd-5a', 'gtd-5b', undefined, { dashed: true }),
      edge('e-gtd5b', 'gtd-5b', 'gtd-6')
    ]
  }
}

// ─── 11. Deep Work Sprint ────────────────────────────────────────────────
export function deepWorkSprint(): Workflow {
  const now = Date.now()
  return {
    id: uid(),
    name: 'Deep Work Sprint Manager',
    description: 'A 90-minute focused work sprint system to maximize concentration and output.',
    category: 'productivity',
    tags: ['productivity', 'deep-work', 'focus', 'time-management'],
    createdAt: now,
    updatedAt: now,
    nodes: [
      node('dw-1', 'start', 0, 0, { label: 'Define the Goal', description: 'Set a singular, clear objective', details: 'What is the ONE thing you must accomplish in this 90-minute block? Write it down.' }),
      node('dw-2', 'task', 0, 150, { label: 'Eliminate Distractions', description: 'Zero interruptions', details: 'Close all non-essential tabs. Put your phone in another room or on airplane mode. Turn on website blockers.' }),
      node('dw-3', 'task', 0, 300, { label: '90-Min Sprint', description: 'Execute the work', details: 'Work continuously on the single objective. If you get distracted, gently bring your focus back to the task.', duration: 5000 }),
      node('dw-4', 'decision', 0, 450, { label: 'Sprint Complete?', description: 'Did you finish the objective?', details: 'Assess your progress after 90 minutes.' }),
      node('dw-5a', 'task', -150, 600, { label: 'Capture Remaining', description: 'Note what is left', details: 'Write down exactly where you left off so you can easily resume in the next sprint.' }),
      node('dw-5b', 'task', 150, 600, { label: 'Celebrate', description: 'Acknowledge the win', details: 'Take a moment to appreciate the focused effort and the completion of the task.' }),
      node('dw-6', 'end', 0, 750, { label: '20-Min Recovery', description: 'Rest and recharge', details: 'Step away from the screen. Walk, stretch, or grab water. Let your brain rest before the next sprint.' })
    ],
    edges: [
      edge('e-dw1', 'dw-1', 'dw-2'),
      edge('e-dw2', 'dw-2', 'dw-3'),
      edge('e-dw3', 'dw-3', 'dw-4'),
      edge('e-dw4a', 'dw-4', 'dw-5a', 'Unfinished', { color: '#f59e0b' }),
      edge('e-dw4b', 'dw-4', 'dw-5b', 'Finished', { color: '#10b981' }),
      edge('e-dw5a', 'dw-5a', 'dw-6'),
      edge('e-dw5b', 'dw-5b', 'dw-6')
    ]
  }
}

// ─── 12. Local Business Setup ──────────────────────────────────────────────
export function localBusinessSetup(): Workflow {
  const now = Date.now()
  return {
    id: uid(),
    name: 'Small/Local Business Setup',
    description: 'A step-by-step guide to legally establishing and launching a local business.',
    category: 'business',
    tags: ['business', 'startup', 'local', 'legal', 'launch'],
    createdAt: now,
    updatedAt: now,
    nodes: [
      node('lb-1', 'start', 0, 0, { label: 'Business Plan', description: 'Define value prop & target audience', details: 'Outline your services, target market, competitive advantage, and initial financial projections.' }),
      node('lb-2', 'task', 0, 150, { label: 'Register Entity', description: 'LLC, Sole Prop, or Corp', details: 'Choose a business structure and register your business name with the state.' }),
      node('lb-3', 'task', 0, 300, { label: 'Obtain EIN & Licenses', description: 'Federal and local compliance', details: 'Apply for an Employer Identification Number (EIN) from the IRS and acquire necessary local city/county permits.' }),
      node('lb-4', 'decision', 0, 450, { label: 'Physical Location?', description: 'Do you need a storefront?', details: 'Decide if your business requires a physical retail or office space.' }),
      node('lb-5a', 'task', -150, 600, { label: 'Lease & Outfitting', description: 'Secure and prep space', details: 'Sign a commercial lease, obtain insurance, and renovate the space for operations.' }),
      node('lb-5b', 'task', 150, 600, { label: 'Digital Presence', description: 'Website & Google My Business', details: 'Set up a professional website, social media profiles, and claim your Google My Business listing.' }),
      node('lb-6', 'end', 0, 750, { label: 'Soft Launch', description: 'Open doors to beta customers', details: 'Launch with a limited audience to test operations, gather feedback, and iron out bugs before the grand opening.' })
    ],
    edges: [
      edge('e-lb1', 'lb-1', 'lb-2'),
      edge('e-lb2', 'lb-2', 'lb-3'),
      edge('e-lb3', 'lb-3', 'lb-4'),
      edge('e-lb4a', 'lb-4', 'lb-5a', 'Yes', { color: '#3b82f6' }),
      edge('e-lb4b', 'lb-4', 'lb-5b', 'No (Online/Mobile)', { color: '#8b5cf6' }),
      edge('e-lb5a', 'lb-5a', 'lb-5b', 'Setup digital too', { dashed: true }),
      edge('e-lb5b', 'lb-5b', 'lb-6')
    ]
  }
}

// ─── 13. Digital Product Launch ──────────────────────────────────────────
export function digitalProductLaunch(): Workflow {
  const now = Date.now()
  return {
    id: uid(),
    name: 'Digital Product Launch Funnel',
    description: 'A marketing and sales pipeline for launching an ebook, course, or digital asset.',
    category: 'business',
    tags: ['business', 'marketing', 'sales', 'funnel', 'digital-product'],
    createdAt: now,
    updatedAt: now,
    nodes: [
      node('dp-1', 'start', 0, 0, { label: 'Lead Magnet Creation', description: 'Free value to build list', details: 'Create a high-value, free resource (PDF, mini-course, template) related to your paid product.' }),
      node('dp-2', 'task', 0, 150, { label: 'Landing Page & Opt-in', description: 'Collect email addresses', details: 'Build a high-converting landing page offering the lead magnet in exchange for an email address.' }),
      node('dp-3', 'task', 0, 300, { label: 'Email Nurture Sequence', description: 'Build trust and authority', details: 'Send a 5-day automated email sequence delivering value, sharing case studies, and introducing the problem your product solves.' }),
      node('dp-4', 'decision', 0, 450, { label: 'Pitch Product', description: 'Open the cart', details: 'Send the sales email. Did the user click through to the sales page?' }),
      node('dp-5a', 'task', -150, 600, { label: 'Retargeting & Follow-up', description: 'Overcome objections', details: 'Send follow-up emails addressing common objections (price, time, results) or run retargeting ads.' }),
      node('dp-5b', 'task', 150, 600, { label: 'Checkout & Upsell', description: 'Process payment & offer more', details: 'User purchases the product. Present a one-click upsell or order bump to increase average order value.' }),
      node('dp-6', 'end', 0, 750, { label: 'Onboarding Sequence', description: 'Deliver product & ensure success', details: 'Send welcome email with access details and start the post-purchase engagement sequence.' })
    ],
    edges: [
      edge('e-dp1', 'dp-1', 'dp-2'),
      edge('e-dp2', 'dp-2', 'dp-3'),
      edge('e-dp3', 'dp-3', 'dp-4'),
      edge('e-dp4a', 'dp-4', 'dp-5a', 'No Click/Purchase', { color: '#f43f5e' }),
      edge('e-dp4b', 'dp-4', 'dp-5b', 'Purchased', { color: '#10b981' }),
      edge('e-dp5a', 'dp-5a', 'dp-4', 'Retry Pitch', { dashed: true, lineStyle: 'bezier' }),
      edge('e-dp5b', 'dp-5b', 'dp-6')
    ]
  }
}

// ─── 14. Spaced Repetition Study System ──────────────────────────────────
export function spacedRepetition(): Workflow {
  const now = Date.now()
  return {
    id: uid(),
    name: 'Spaced Repetition Study System',
    description: 'An evidence-based learning system for long-term memory retention.',
    category: 'student',
    tags: ['student', 'study', 'learning', 'memory', 'anki'],
    createdAt: now,
    updatedAt: now,
    nodes: [
      node('sr-1', 'start', 0, 0, { label: 'Information Intake', description: 'Read/Listen to material', details: 'Consume the source material (lecture, textbook, article) and understand the core concepts first.' }),
      node('sr-2', 'task', 0, 150, { label: 'Extract Flashcards', description: 'Create Q&A pairs', details: 'Distill the information into atomic, active-recall questions. Avoid putting too much info on one card.' }),
      node('sr-3', 'task', 0, 300, { label: 'First Review', description: 'Initial learning phase', details: 'Review the new cards immediately. You should be able to answer them correctly.' }),
      node('sr-4', 'decision', 0, 450, { label: 'Recall Assessment', description: 'How hard was it to remember?', details: 'When reviewing a card later, honestly grade your recall: Easy, Good, Hard, or Again (Forgot).' }),
      node('sr-5a', 'task', -200, 600, { label: 'Review Tomorrow (Again)', description: 'Reset interval', details: 'You forgot the card. The interval resets, and you will see it again tomorrow.' }),
      node('sr-5b', 'task', 0, 600, { label: 'Review in 3 Days (Hard)', description: 'Slightly increase interval', details: 'You remembered, but it took significant effort.' }),
      node('sr-5c', 'task', 200, 600, { label: 'Review in 7+ Days (Easy)', description: 'Significantly increase interval', details: 'You recalled the information instantly. The card is pushed further into the future.' }),
      node('sr-6', 'end', 0, 750, { label: 'Long-Term Retention', description: 'Knowledge solidified', details: 'Through repeated spaced exposure, the information is now stored in long-term memory.' })
    ],
    edges: [
      edge('e-sr1', 'sr-1', 'sr-2'),
      edge('e-sr2', 'sr-2', 'sr-3'),
      edge('e-sr3', 'sr-3', 'sr-4'),
      edge('e-sr4a', 'sr-4', 'sr-5a', 'Forgot', { color: '#ef4444' }),
      edge('e-sr4b', 'sr-4', 'sr-5b', 'Hard', { color: '#f59e0b' }),
      edge('e-sr4c', 'sr-4', 'sr-5c', 'Easy', { color: '#10b981' }),
      edge('e-sr5a', 'sr-5a', 'sr-4', 'Next Review', { dashed: true, lineStyle: 'bezier' }),
      edge('e-sr5b', 'sr-5b', 'sr-4', 'Next Review', { dashed: true, lineStyle: 'bezier' }),
      edge('e-sr5c', 'sr-5c', 'sr-6')
    ]
  }
}

// ─── 15. Research Paper Pipeline ─────────────────────────────────────────
export function researchPaperPipeline(): Workflow {
  const now = Date.now()
  return {
    id: uid(),
    name: 'Academic Research & Writing Pipeline',
    description: 'A structured approach to literature review, data synthesis, and academic writing.',
    category: 'student',
    tags: ['student', 'research', 'writing', 'academic', 'thesis'],
    createdAt: now,
    updatedAt: now,
    nodes: [
      node('rp-1', 'start', 0, 0, { label: 'Define Research Question', description: 'Narrow the scope', details: 'Formulate a specific, arguable, and researchable question to guide your literature search.' }),
      node('rp-2', 'task', 0, 150, { label: 'Literature Search', description: 'Gather primary sources', details: 'Use academic databases (JSTOR, PubMed, Google Scholar) to find relevant peer-reviewed papers.' }),
      node('rp-3', 'task', 0, 300, { label: 'Annotated Bibliography', description: 'Summarize & evaluate', details: 'Write brief summaries and evaluations of key sources to track how they relate to your thesis.' }),
      node('rp-4', 'decision', 0, 450, { label: 'Sufficient Evidence?', description: 'Do you have enough data?', details: 'Evaluate if your gathered sources adequately support your intended argument or address the research question.' }),
      node('rp-5a', 'task', -150, 600, { label: 'Refine Search', description: 'Adjust keywords & databases', details: 'Modify your search terms, look at bibliographies of key papers, and gather more specific evidence.' }),
      node('rp-5b', 'task', 150, 600, { label: 'Outline & Draft', description: 'Structure the paper', details: 'Create a detailed outline (Intro, Lit Review, Methodology, Results, Discussion) and write the first draft.' }),
      node('rp-6', 'end', 0, 750, { label: 'Revise & Cite', description: 'Final polish', details: 'Edit for clarity, flow, and academic tone. Ensure all citations and the bibliography are correctly formatted.' })
    ],
    edges: [
      edge('e-rp1', 'rp-1', 'rp-2'),
      edge('e-rp2', 'rp-2', 'rp-3'),
      edge('e-rp3', 'rp-3', 'rp-4'),
      edge('e-rp4a', 'rp-4', 'rp-5a', 'No, need more', { color: '#f59e0b' }),
      edge('e-rp4b', 'rp-4', 'rp-5b', 'Yes, proceed', { color: '#10b981' }),
      edge('e-rp5a', 'rp-5a', 'rp-3', 'Analyze new sources', { dashed: true, lineStyle: 'bezier' }),
      edge('e-rp5b', 'rp-5b', 'rp-6')
    ]
  }
}

// ─── 16. Student Progress Tracking & Intervention ────────────────────────
export function studentProgressTracking(): Workflow {
  const now = Date.now()
  return {
    id: uid(),
    name: 'Student Progress Tracking & Intervention',
    description: 'A proactive framework for monitoring student performance and providing timely support.',
    category: 'teacher',
    tags: ['teacher', 'admin', 'tracking', 'intervention', 'education'],
    createdAt: now,
    updatedAt: now,
    nodes: [
      node('spt-1', 'start', 0, 0, { label: 'Formative Assessment', description: 'Initial knowledge check', details: 'Administer a quiz, exit ticket, or brief assignment to gauge baseline understanding of the topic.' }),
      node('spt-2', 'task', 0, 150, { label: 'Data Analysis', description: 'Review scores & trends', details: 'Analyze the assessment data to identify common misconceptions and pinpoint students who are struggling.' }),
      node('spt-3', 'decision', 0, 300, { label: 'Performance Tier?', description: 'Categorize student needs', details: 'Based on the data, group students into tiers for targeted instruction.' }),
      node('spt-4a', 'task', -200, 450, { label: 'Tier 3: Intensive Support', description: '1-on-1 tutoring', details: 'Schedule individualized sessions to reteach foundational concepts. Consider special education referral if lack of progress persists.' }),
      node('spt-4b', 'task', 0, 450, { label: 'Tier 2: Targeted Group', description: 'Small group reteaching', details: 'Form a small group of students with similar gaps. Reteach the specific skill using a different instructional method.' }),
      node('spt-4c', 'task', 200, 450, { label: 'Tier 1: Core/Enrichment', description: 'Proceed or extend', details: 'Student has mastered the concept. Proceed with standard curriculum or provide enrichment/extension activities.' }),
      node('spt-5', 'end', 0, 600, { label: 'Summative Re-Assessment', description: 'Verify mastery', details: 'Administer a follow-up assessment to ensure the interventions were successful and mastery was achieved.' })
    ],
    edges: [
      edge('e-spt1', 'spt-1', 'spt-2'),
      edge('e-spt2', 'spt-2', 'spt-3'),
      edge('e-spt3a', 'spt-3', 'spt-4a', 'Significant Deficit (<60%)', { color: '#ef4444' }),
      edge('e-spt3b', 'spt-3', 'spt-4b', 'Partial Mastery (60-80%)', { color: '#f59e0b' }),
      edge('e-spt3c', 'spt-3', 'spt-4c', 'Mastery (>80%)', { color: '#10b981' }),
      edge('e-spt4a', 'spt-4a', 'spt-5'),
      edge('e-spt4b', 'spt-4b', 'spt-5'),
      edge('e-spt4c', 'spt-4c', 'spt-5')
    ]
  }
}

// ─── 17. Flipped Classroom Planning ──────────────────────────────────────
export function flippedClassroom(): Workflow {
  const now = Date.now()
  return {
    id: uid(),
    name: 'Flipped Classroom Lesson Design',
    description: 'Design a lesson where students learn concepts at home and apply them in class.',
    category: 'teacher',
    tags: ['teacher', 'planning', 'flipped-classroom', 'active-learning'],
    createdAt: now,
    updatedAt: now,
    nodes: [
      node('fc-1', 'start', 0, 0, { label: 'Identify Core Concept', description: 'What is the key learning objective?', details: 'Determine the specific skill or concept students need to master.' }),
      node('fc-2', 'task', 0, 150, { label: 'Curate Pre-Class Media', description: 'Video, podcast, or reading', details: 'Create or find a short, engaging video or article that introduces the core concept. Keep it under 10 minutes.' }),
      node('fc-3', 'task', 0, 300, { label: 'Pre-Class Accountability', description: 'Check for understanding', details: 'Design a brief online quiz or guided notes sheet students must complete before coming to class.' }),
      node('fc-4', 'decision', 0, 450, { label: 'In-Class Application', description: 'How will they use the knowledge?', details: 'Design the active learning activity for the classroom.' }),
      node('fc-5a', 'task', -150, 600, { label: 'Collaborative Project', description: 'Group problem solving', details: 'Students work in teams to solve a complex problem using the pre-class knowledge. Teacher facilitates and assists.' }),
      node('fc-5b', 'task', 150, 600, { label: 'Debate / Discussion', description: 'Peer-to-peer exploration', details: 'Host a structured debate, Socratic seminar, or peer review session based on the pre-class material.' }),
      node('fc-6', 'end', 0, 750, { label: 'Synthesis & Reflection', description: 'Consolidate learning', details: 'Wrap up the class with a brief synthesis of the main takeaways and a reflection on the learning process.' })
    ],
    edges: [
      edge('e-fc1', 'fc-1', 'fc-2'),
      edge('e-fc2', 'fc-2', 'fc-3'),
      edge('e-fc3', 'fc-3', 'fc-4'),
      edge('e-fc4a', 'fc-4', 'fc-5a', 'STEM / Application', { color: '#3b82f6' }),
      edge('e-fc4b', 'fc-4', 'fc-5b', 'Humanities / Theory', { color: '#8b5cf6' }),
      edge('e-fc5a', 'fc-5a', 'fc-6'),
      edge('e-fc5b', 'fc-5b', 'fc-6')
    ]
  }
}

// ─── 18. Online Course Launch ────────────────────────────────────────────
export function onlineCourseLaunch(): Workflow {
  const now = Date.now()
  return {
    id: uid(),
    name: 'Online Course Creation & Launch',
    description: 'End-to-end process from ideation to launching a profitable online course.',
    category: 'business',
    tags: ['business', 'online-teacher', 'course', 'launch', 'creator'],
    createdAt: now,
    updatedAt: now,
    nodes: [
      node('oc-1', 'start', 0, 0, { label: 'Audience Research', description: 'Find the painful problem', details: 'Survey your audience or analyze forums to identify a specific, urgent problem they are willing to pay to solve.' }),
      node('oc-2', 'task', 0, 150, { label: 'Pre-sell (Beta Launch)', description: 'Validate the idea', details: 'Create an outline and a sales page. Try to sell the course before you build it to validate demand.' }),
      node('oc-3', 'decision', 0, 300, { label: 'Validation Goal Met?', description: 'Did enough people buy?', details: 'Assess if you reached your minimum viable sales target to justify building the course.' }),
      node('oc-4a', 'task', -150, 450, { label: 'Pivot or Refund', description: 'Idea invalidated', details: 'Refund the early buyers and pivot to a new idea or angle based on feedback.' }),
      node('oc-4b', 'task', 150, 450, { label: 'Content Production', description: 'Record & Edit', details: 'Record the video lessons, create worksheets, and edit the content. Deliver live if it is a cohort course.' }),
      node('oc-5', 'task', 150, 600, { label: 'Platform Setup', description: 'LMS & Payment Gateway', details: 'Upload content to Teachable, Thinkific, or Kajabi. Set up Stripe integration and affiliate links.' }),
      node('oc-6', 'end', 150, 750, { label: 'Evergreen Launch', description: 'Automate sales', details: 'Set up an automated email funnel or webinar to sell the course passively on autopilot.' })
    ],
    edges: [
      edge('e-oc1', 'oc-1', 'oc-2'),
      edge('e-oc2', 'oc-2', 'oc-3'),
      edge('e-oc3a', 'oc-3', 'oc-4a', 'Failed Target', { color: '#ef4444' }),
      edge('e-oc3b', 'oc-3', 'oc-4b', 'Hit Target', { color: '#10b981' }),
      edge('e-oc4b', 'oc-4b', 'oc-5'),
      edge('e-oc5', 'oc-5', 'oc-6')
    ]
  }
}

// ─── 19. Content Creation Pipeline ───────────────────────────────────────
export function contentCreationPipeline(): Workflow {
  const now = Date.now()
  return {
    id: uid(),
    name: 'Multi-Channel Content Creation Pipeline',
    description: 'System for turning one core idea into multiple pieces of content across platforms.',
    category: 'productivity',
    tags: ['productivity', 'content-creator', 'marketing', 'system'],
    createdAt: now,
    updatedAt: now,
    nodes: [
      node('cc-1', 'start', 0, 0, { label: 'Idea Capture & SEO', description: 'Keyword research & ideation', details: 'Log content ideas in a database (Notion/Airtable). Validate ideas with basic keyword research.' }),
      node('cc-2', 'task', 0, 150, { label: 'Pillar Content Creation', description: 'YouTube Video or Podcast', details: 'Write the script and record the core, long-form piece of content (the "Pillar").' }),
      node('cc-3', 'task', 0, 300, { label: 'Repurpose: Blog Post', description: 'Transcribe & Format', details: 'Transcribe the video/audio, edit for readability, add headings, and publish as an SEO-optimized blog post.' }),
      node('cc-4', 'decision', 0, 450, { label: 'Micro-Content Extraction', description: 'Splice into short-form', details: 'Identify the best 15-60 second clips or key quotes from the pillar content.' }),
      node('cc-5a', 'task', -150, 600, { label: 'Short-Form Video', description: 'Reels, Shorts, TikTok', details: 'Edit the clips into vertical videos with captions and trending audio.' }),
      node('cc-5b', 'task', 150, 600, { label: 'Text/Image Posts', description: 'Twitter/X, LinkedIn, IG Carousel', details: 'Turn key quotes into text posts or design them into carousel graphics using Canva.' }),
      node('cc-6', 'end', 0, 750, { label: 'Schedule & Publish', description: 'Buffer / HootSuite', details: 'Load all repurposed assets into a social media scheduler to be published throughout the week.' })
    ],
    edges: [
      edge('e-cc1', 'cc-1', 'cc-2'),
      edge('e-cc2', 'cc-2', 'cc-3'),
      edge('e-cc3', 'cc-3', 'cc-4'),
      edge('e-cc4a', 'cc-4', 'cc-5a', 'Video Clips', { color: '#8b5cf6' }),
      edge('e-cc4b', 'cc-4', 'cc-5b', 'Text/Quotes', { color: '#3b82f6' }),
      edge('e-cc5a', 'cc-5a', 'cc-6'),
      edge('e-cc5b', 'cc-5b', 'cc-6')
    ]
  }
}

export function createSampleWorkflows(): Record<string, Workflow> {
  const samples = [
    ragPipeline(),
    multiAgentReflection(),
    routerClassifierPattern(),
    ieltWritingTask2(),
    ieltsSpeakingPart2(),
    ieltsListening(),
    ieltsReading(),
    eslLessonPlanning(),
    eslErrorCorrection(),
    gtdReview(),
    deepWorkSprint(),
    localBusinessSetup(),
    digitalProductLaunch(),
    spacedRepetition(),
    researchPaperPipeline(),
    studentProgressTracking(),
    flippedClassroom(),
    onlineCourseLaunch(),
    contentCreationPipeline(),
  ]
  return Object.fromEntries(samples.map((wf) => [wf.id, wf]))
}


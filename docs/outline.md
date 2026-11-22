### Product direction and MVP scope

**Vision:** TutorMonkey is a general-purpose, AI-assisted document reader for learning and understanding complex material—not a course-specific study or quiz app. The central workflow is **read → select → ask → understand → continue reading**. The document is the primary interface; AI is a contextual assistant, not an autonomous agent.

**Primary audience:** Curious readers, students, professionals, and researchers reading long-form PDFs, guides, reports, books, or technical material.

**Core MVP (reader-first):**

- Desktop-first responsive web app, initially Chrome-tested; Google sign-in and a private personal document library.
- Support born-digital, text-based PDFs initially. Users upload and open a document directly—no mandatory study-session creation or course structure.
- A focused PDF reader with page navigation, zoom, document text search, available table of contents/thumbnails, selected-text actions, and saved reading position.
- A collapsible AI chat alongside the reader; one persistent conversation per document, with streaming responses and follow-up questions.
- Selection-aware and current-page questions use bounded text context without mandatory embeddings or vector search.
- Source-grounded answers when a question relies on the PDF. Each citation points to one PDF page or a contiguous two-page range; citation clicks jump to its starting page. Exact text offsets, coordinates, and highlighting are not required.
- Private file storage, explicit processing/error states, document ownership checks, server-side AI usage limits, and graceful fallback when AI is unavailable.

**Deliberately deferred:** OCR and scanned/handwritten PDFs, PPTX/images/EPUB, generic transient chat attachments, quizzes, multi-document synthesis, shared libraries, browser/mobile apps, agentic workflows. Full-document RAG is a later milestone rather than a prerequisite to launch.

**Success criterion:** A user can upload a supported PDF, read and navigate it comfortably, select a passage, ask for an explanation, follow a cited page, and resume reading with chat history and position intact.

### MVP user flow

1. **Sign in / library:** Google login leads to a personal dashboard of recently opened documents with a clear upload action.
2. **Upload:** Validate a text-based PDF, store it privately, extract page-attributed text with clear ready/failed states, then open it in the reader.
3. **Read:** Use the document outline or page controls, text search, zoom, and last-read position without relying on AI.
4. **Ask in context:** Highlight a passage and choose Explain / Ask, or type a question about the current page. Stream answers in an adjacent persistent chat.
5. **Verify and resume:** Click a citation to navigate to the cited PDF page; continue reading with document position and chat history saved.
6. **Manage limits:** Show a clear AI usage allowance and a non-AI reading experience when the allowance is exhausted.

**Design principle:** Reading should not require chat; chat should not displace the document. Default to current selection/page as context, with an explicit document-wide search scope in the RAG milestone.

### Decision register

Use these labels to distinguish agreed product direction from implementation ideas. Update a status when a choice is tested or explicitly decided; never treat a candidate library, cloud provider, or metric target as committed merely because it appears in a plan.

| Status | Current decisions |
| --- | --- |
| **Decided** | General-purpose document reading and understanding, not course-oriented sessions; reader-first UX; text-based PDFs first; original documents private; one continuous chat associated with each document once chat is implemented; page-level citations referencing one page or a contiguous two-page range; browser-side text extraction as the preferred initial approach; infrastructure hosting budget at most $5/month (target $0); Next.js + FastAPI monorepo; Supabase Auth/Postgres and Cloudflare R2 as the working architecture; React-PDF (wojtekmaj/react-pdf) as the frontend PDF viewer library. |
| **Proposed / validate** | Validation of PDF.js browser-side extraction and page mapping; Vercel / Cloud Run deployment details; upload/page limits; LLM and embedding providers (intentionally TBD); PostgreSQL pgvector as the preferred later retrieval store; browser-processing retry/resume behavior; exact AI quota policy; UX patterns below. |
| **Deferred** | OCR/scanned images, PPTX/EPUB, exact-text citation highlighting, cross-document retrieval, autonomous agents, public collaboration, and advanced retrieval unless shown beneficial in evaluations. |

**Milestone interpretation:** Milestone 1 is the usable **non-AI reader**; Milestone 2 adds **contextual AI**. Features named in the overall MVP are not necessarily gates for Milestone 1. See the child milestone for the core/polish split.

### Visual design system — TutorMonkey

**Status:** Decided visual direction; implementation mapping to Tailwind/shadcn semantic theme variables is proposed. Use a Notion-inspired look: warm neutrals and quiet surfaces, sage green for primary actions, and dusty rose for restrained secondary accents. Support both light and dark themes.

#### Light theme palette

| Token | Hex | Use |
| --- | --- | --- |
| Background | `#FFFFFF` | Main page background |
| Sidebar / Secondary | `#F7F7F5` | Sidebar and secondary surfaces |
| Elevated surface | `#FAFAF8` | Cards and subtle panels |
| Border | `#E9E9E7` | Dividers, outlines and borders |
| Primary text | `#222222` | Headings and body text |
| Secondary text | `#737373` | Descriptions and metadata |
| Sage green | `#47785B` | Primary buttons and active states |
| Soft sage | `#E7F0E9` | Green-tinted backgrounds |
| Dusty rose | `#B97589` | Secondary accent color |
| Blush pink | `#F7E8ED` | Pink-tinted backgrounds |
| Rose text | `#944B66` | Text on blush backgrounds |

#### Dark theme palette

| Token | Hex | Use |
| --- | --- | --- |
| Background | `#191919` | Main page background |
| Sidebar / Secondary | `#242424` | Sidebar and secondary surfaces |
| Elevated surface | `#2B2B2B` | Cards and subtle panels |
| Border | `#353535` | Dividers, outlines and borders |
| Primary text | `#F4F4F4` | Headings and body text |
| Secondary text | `#B5B5B5` | Descriptions and metadata |
| Sage green | `#7CA98C` | Primary buttons and active states |
| Soft sage | `#293D31` | Green-tinted backgrounds |
| Dusty rose | `#D49AAA` | Secondary accent color |
| Blush pink | `#442C37` | Pink-tinted backgrounds |
| Rose text | `#E9B7C6` | Text on blush backgrounds |

#### Copy-ready CSS color tokens

```css
:root {
  --tm-background: #FFFFFF;
  --tm-sidebar: #F7F7F5;
  --tm-surface: #FAFAF8;
  --tm-border: #E9E9E7;
  --tm-text: #222222;
  --tm-text-muted: #737373;
  --tm-sage: #47785B;
  --tm-sage-soft: #E7F0E9;
  --tm-rose: #B97589;
  --tm-rose-soft: #F7E8ED;
  --tm-rose-text: #944B66;
}
.dark {
  --tm-background: #191919;
  --tm-sidebar: #242424;
  --tm-surface: #2B2B2B;
  --tm-border: #353535;
  --tm-text: #F4F4F4;
  --tm-text-muted: #B5B5B5;
  --tm-sage: #7CA98C;
  --tm-sage-soft: #293D31;
  --tm-rose: #D49AAA;
  --tm-rose-soft: #442C37;
  --tm-rose-text: #E9B7C6;
}
```

**Usage guidelines:**

- Neutral backgrounds and typography dominate the document library, reader, and AI panel.
- Sage indicates primary actions, selected navigation, and subtle AI affordances.
- Dusty rose is a restrained secondary accent for informational highlights, supporting UI accents, or contextual actions; avoid competing primary CTAs.
- Maintain legible contrast in both themes; do not assume every accent hex is appropriate for small text on every surface. Validate accessible combinations as components are built.
- These TutorMonkey-specific tokens are not direct replacements for shadcn/ui semantic theme tokens. Map them explicitly in `globals.css` when implementing the theme.
- Preserve the PDF page's natural rendering rather than tinting the document canvas with interface accent colors.

### Reader and AI interaction model

**Proposed UX contract (subject to usability testing):**

1. **Document first:** The PDF occupies the main reading area. A document outline/library area and AI chat are independently collapsible; collapsing chat never blocks reading.
2. **Selecting text:** Highlighting creates a small contextual toolbar with **Explain** and **Ask AI**. Selection alone never sends content to an AI provider.
3. **Explain:** Explicitly clicking Explain opens the AI panel and sends the selected passage, its page number, and a concise explanation request. Clicking Ask AI opens the panel with that passage attached as context; the user can add a question and must submit it.
4. **Default context:** Without a selection, a chat question uses bounded text from the visible/current PDF page (and nearby text where warranted). Display a scope indicator such as “Selected text” or “Current page”; full-document search arrives with RAG.
5. **Conversation:** Chat streams replies, remains saved with its document, and restores when the document is reopened. Changing documents switches to the associated conversation; it must not merge context from other documents.
6. **Citations:** A source page reference is clickable; it jumps the existing PDF reader to that page without dismissing or resetting chat. Offer a “Return to reading” action after a citation jump. Exact source-phrase highlighting is deferred.
7. **Reading progress:** Opening a document normally restores the last intentionally read page. Navigation and closing/switching documents persist progress. A temporary citation jump preserves a return location; whether it becomes the new last-read page is an explicit UX behavior to validate, not assumed.
8. **Graceful failure:** When extraction is unavailable or an AI limit is reached, keep PDF viewing/navigation operational. Clearly communicate that document-grounded answers require extractable text.

**Non-goal:** No auto-summarize-on-open, silent attachment ingestion into an LLM prompt, or autonomous document modification.

### Implementation and system design

**Existing stack retained:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, pnpm; Python FastAPI with uv; Supabase Auth (Google OAuth) and PostgreSQL; private Cloudflare R2 object storage. The monorepo has independently run web and API apps.

- **Frontend:** Next.js on Vercel (planned); **React-PDF** (wojtekmaj/react-pdf, built on Mozilla PDF.js) selected for PDF rendering and text/annotation layers, with TutorMonkey-owned controls for selection, navigation, zoom, outlines, and citation jumps. Use an accessible, resizable three-area reading layout (library/outline, reader, chat) and responsive drawers as appropriate.
- **Authentication and authorization:** Supabase Auth/Google OAuth. FastAPI verifies the signed-in user's identity and ownership of documents, original files, extracted text, messages, and any future embeddings on every request.
- **Backend and database:** FastAPI (Cloud Run remains a hosting candidate). PostgreSQL stores user profiles, documents, processing status, page-text metadata, reading progress, per-document chats/messages, and AI usage. Add chunks and embeddings only when full-document RAG is implemented.
- **Document upload/storage:** Private Cloudflare R2 bucket with size/type limits and short-lived presigned upload/download URLs. Verify uploaded file signatures and completion server-side. Never expose bucket keys to the browser.
- **Extraction:** Start with browser-side PDF.js text extraction for supported digital PDFs, preferably in a Web Worker. Process pages incrementally; send page-numbered text in validated, bounded batches to FastAPI for authorized, idempotent upserts into `document_pages`. Track progress and failed/incomplete states, and permit resume or restart when the tab closes. Page text submitted by a browser is untrusted: validate ownership, page count/ranges and payload limits; do not claim the server has verified all extracted text against the PDF. A server-side fallback or durable worker remains optional only if later reliability or performance evidence requires it. Future opt-in OCR could render selected PDF pages client-side and use a browser OCR worker with progress/cancellation and configurable effort.
- **Reader state:** Store last-read page/position, associated document metadata, and chat history. Handle deleted or failed documents gracefully; never serve private R2 links without authorization.
- **AI baseline (after reader):** Send a selected passage or bounded current-page/neighboring text with the user's prompt and short relevant chat history to a hosted LLM. Stream the response. This is contextual prompting, not vector RAG. Return only verifiable citation page numbers from supplied passages; acknowledge insufficient evidence.
- **RAG extension:** Chunk extraction results with page provenance, embed once per content version, and store vectors in PostgreSQL using pgvector as the preferred later retrieval store, subject to storage and performance testing. Retrieval must filter by authenticated user and active document. Measure baseline retrieval first; add keyword+vector hybrid search, reranking, or multi-document retrieval only if evaluations show benefits. A separate Qdrant service is not assumed.
- **Cost and abuse prevention:** Infrastructure hosting ceiling $5 USD/month (target $0). Model and embedding API costs are a separately managed budget. Server-side rate limits, daily per-user AI quotas, file/page/size caps, bounded prompt tokens, limits on concurrent/duplicate ingestion, and a global provider budget. Reading remains available at the AI limit. Avoid paid ingestion fan-out and unbounded agent loops.
- **Testing and observability:** Auth/ownership tests, upload and extraction tests, page mapping/citation tests, browser reading-flow tests, and LLM usage/latency metrics. Do not log raw documents or prompts by default. For RAG, maintain a labeled evaluation set including unanswerable questions.

**Decisions to validate:** Hosting plans/regions within the $5/month infrastructure ceiling (target free tiers); upload size and page caps; LLM and embedding providers (leave unspecified for now); pgvector performance/storage limits; AI allowance/reset policy; browser extraction, validation, and resume behavior. Keep model/API costs tracked separately from hosting costs.

**Directional change — November 20, 2026:** Prior course-specific study sessions, mandatory ingestion-before-session, broad OCR/media support, Qdrant-first RAG, and infrastructure-heavy milestones were assumptions for the older TutorMonkey concept. They are superseded by a document-first reading workflow and staged contextual chat → evaluated RAG.

### System architecture simplified

**Reader:** Browser (Next.js + React-PDF / Mozilla PDF.js) → privately authorized PDF from Cloudflare R2; FastAPI + Supabase Postgres provide document metadata, reading progress, and persistent chat. Supabase Auth handles sign-in; FastAPI enforces authorization.

**Upload/extract:** Browser → private Cloudflare R2 upload (authorized by FastAPI) → PDF.js in browser extracts page-attributed text → bounded batches to FastAPI → validated/upserted `document_pages` in Postgres → processing status ready. PDF viewing does not require extraction to complete. An ingestion/processing job is simply tracked status and progress, not a dedicated server worker. A server-side worker/queue is not planned for the first release; browser processing may pause when the tab closes and must be resumable.

**Contextual chat (first AI release):** Selection/current page + question → FastAPI ownership/quota check → hosted LLM (TBD) → streamed answer and cited page or contiguous two-page range → saved per-document conversation. Citations should correspond to supplied page-attributed text, without claiming phrase-level verification.

**Document-wide RAG (later):** Extracted text → chunks with page provenance → embeddings in Postgres/pgvector → document-scoped retrieval → hosted LLM → cited answer. Add keyword/hybrid search and reranking after measuring improvements.

**Not currently needed:** Autonomous agents, server-side OCR workers, dedicated ingestion queues, or a separate Qdrant deployment.

### Milestones and demonstrable outcomes

1. **Reader foundation:** Google auth, private library, supported PDF upload, in-browser reader, page navigation/search/selection, saved reading position, and reliable document access. No AI required to complete the reading flow.
2. **Contextual AI chat:** Persistent per-document conversation, streaming explanations of highlighted/current-page text, usage quotas, and clickable page citations. Establish baseline answer-quality tests.
3. **Measured full-document RAG:** Page-aware chunking, embeddings/pgvector, document-scoped retrieval, cited answers, and an evaluation set with relevant/not-in-document questions. Compare direct page context against vector retrieval.
4. **Retrieval quality and launch polish:** Evaluate hybrid keyword+semantic search, optional reranking, recall@k/citation grounding/latency/cost, and end-to-end UX/security tests. Ship a live demo and architecture/evaluation write-up.
5. **Optional extensions after validation:** Highlights/notes, additional file formats and OCR, document collections, cross-document search, and advanced annotation navigation.

### Milestone definitions of done

- **Milestone 1 — Reader foundation:** Another signed-in account cannot access a user's PDF; a supported PDF can be uploaded, opened, navigated, and resumed; rejected or no-text files show a clear state; the experience operates with no LLM configured. Advanced reader conveniences are tracked separately as polish.
- **Milestone 2 — Contextual AI chat:** A selected passage or current page can produce a streamed answer; every document-supported citation jumps to an actual supplied PDF page; the correct conversation restores on reopen; insufficient-context answers are handled explicitly; AI limits are enforced on the server and do not block reading.
- **Milestone 3 — Full-document RAG:** The system indexes a PDF with page provenance, retrieves only authorized document chunks, and returns usable cited answers including cases where evidence appears away from the current page. Run a reproducible evaluation that compares RAG against the local-context baseline; report results, not assumed improvements.
- **Milestone 4 — Evaluation / demo:** Run and document at least a direct-context baseline and a dense retrieval pipeline, plus any tested hybrid/reranker variant; report evidence/citation accuracy, retrieval quality, unanswerable-question behavior, latency, and actual cost. Complete a live end-to-end reader/chat demo and security smoke tests.
- **Milestone 5 — Optional extensions:** Only considered done per feature after its own acceptance criteria are agreed; none block the previous milestones.

**Measurement note:** Exact numeric pass/fail thresholds should be selected after baseline data exists; do not invent performance targets as if already validated.

**Portfolio evidence:** Public demo, strong README with architecture diagram, measurable retrieval and answer evaluations, citation navigation test cases, p50/p95 response latency, and cost/usage measurements.

**Detailed AI plan:** TutorMonkey — AI Retrieval & Evaluation Plan (contextual baseline, RAG variants, source-grounding, metrics, and cost controls).

**References:** Landed — AI portfolio projects; Production RAG brief; Evaluation suite brief; Semantic + hybrid search brief.

Milestone 1

### Documents

[]()
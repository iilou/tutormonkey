## Milestone 1 — Reader foundation

**Goal:** Ship the first complete, usable TutorMonkey reading flow before adding AI: sign in → upload a text-based PDF → read and navigate it → resume later. This replaces the earlier infrastructure-first milestone.

**Product context:** TutorMonkey is an AI-assisted document reader for learning in general, not course-specific study sessions. The document remains the primary workspace. AI explanations, citations, and full-document retrieval are staged in later milestones.

### Milestone 1 priorities

**P0 — Required to ship (non-AI end-to-end reader)**

- Supabase Auth with Google sign-in/sign-out; authenticated library routes.
- Private document library listing uploaded PDFs with clear processing/ready/failed states and an open action.
- Upload text-based PDFs privately to Cloudflare R2 with server-side ownership/type/size validation, signed access, and useful error states.
- Extract page-numbered text in the browser with PDF.js, preferably using its Web Worker. Send bounded, authenticated batches to FastAPI for `document_pages` upserts; track processing progress and support restart/resume. PDFs without usable text remain viewable, but show that AI text context is unavailable until optional OCR is added.
- An in-browser PDF reader that opens the stored document, allows next/previous or direct-page navigation, and remembers the last-read page when the user returns.
- FastAPI endpoints and PostgreSQL migrations for documents, page text, file access, and reading progress; ownership tests, basic local setup, and security checks.

**P1 — Reader polish; desirable but not required for Milestone 1 completion**

- Built-in find-in-document, zoom controls, document outline/thumbnails (when available), and keyboard navigation.
- High-quality selected-text interaction and visual toolbar foundation for Milestone 2's Ask/Explain actions.
- Resizable/collapsible navigation region, mobile-friendly drawers, refined empty/loading states, and advanced visual polish.
- Last-opened metadata and a richer profile/dashboard.

**Scope boundary:** P1 items are not removed from the product. Implement them when convenient or before the AI UI if a dependency requires them, but do not let them prevent completion of the basic reader workflow. Text selection and the chat panel become explicit dependencies for Milestone 2.

**Decision status:** Product direction, private library, text-based PDF-first support, Next.js/FastAPI, Supabase, and R2 are the working decisions. React-PDF (wojtekmaj/react-pdf, backed by Mozilla PDF.js) is the selected viewer, and browser-side PDF.js extraction is the preferred P0 implementation. Hosting configuration, file/page limits, client-processing reliability/retry policy, and future OCR implementation remain to be tested. The infrastructure hosting ceiling is $5/month (target $0); LLM/embedding provider costs are tracked separately.

### Out of scope for Milestone 1

- LLM calls, chat UI functionality, vector embeddings, RAG, rerankers, and citations (Milestones 2–4).
- OCR, images, slides, handwriting, arbitrary file types, note-taking/annotations, cross-document search, or collaborative sharing.
- AI model/provider selection, AI quotas and usage accounting (introduced alongside AI features), and hosting services that would exceed the $5/month infrastructure budget.
- Mandatory course sessions or temporary session-creation staging; uploaded documents live directly in the user's library.

### Suggested API and database boundaries

**Backend routes (illustrative, not frozen):**

- `GET /me` — authenticated profile summary.
- `GET /documents` — list only the user's documents.
- `POST /documents/uploads` — validate upload intent and issue a presigned R2 upload URL.
- `POST /documents/uploads/{upload_id}/complete` — verify uploaded object and create metadata idempotently. Browser begins extraction after upload.
- `GET /documents/{id}` — authorized metadata/status and extraction progress.
- `PUT /documents/{id}/pages/batch` — validate ownership, page range, text size, and upsert extracted text idempotently.
- `POST /documents/{id}/processing/complete` — mark extracted text ready after validating expected page coverage; allow retry/resume for incomplete processing.
- `GET /documents/{id}/file-url` — short-lived authorized download URL.
- `GET /documents/{id}/progress` and `PUT /documents/{id}/progress` — reading position.
- `DELETE /documents/{id}` — user-initiated document removal with ownership checks and cleanup (implement only when safe).

**Minimum data:** Auth identity/profile; `documents` (owner, filename, object key, size, status, page count, timestamps); `document_pages` (document ID, 1-based page number, extracted text, unique document/page constraint); `reading_progress` (user/document, last page/position). Keep `document_pages` because Milestone 2 can efficiently retrieve bounded current-page context without re-parsing a PDF for every AI request. It stores extracted text and page provenance, not rendered PDF images; the original PDF stays in R2. Add `chats`, `messages`, `chunks`, and `embeddings` in later milestones.

**Processing:** A processing job here means progress/status for a document, not a separately deployed backend service. The browser performs text extraction incrementally and sends page batches to FastAPI. Store pending/processing/ready/failed or interrupted states and page progress, handle duplicates/idempotency, and permit user-triggered resume when the tab closes. Do not deploy an ingestion queue or dedicated worker for P0. Browser-provided text is untrusted: verify the user's access and enforce page count/range, total text size, and payload constraints. Exact match to the original PDF is not guaranteed without server-side re-extraction.

### Monorepo folder structure (target)

```
tutormonkey/
├── apps/
│   ├── web/                           # Next.js / pnpm
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/login/page.tsx
│   │   │   │   ├── (dashboard)/layout.tsx
│   │   │   │   ├── (dashboard)/library/page.tsx
│   │   │   │   ├── (dashboard)/documents/[documentId]/page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── components/
│   │   │   │   ├── documents/
│   │   │   │   └── reader/
│   │   │   └── lib/
│   │   │       ├── api/
│   │   │       └── supabase/
│   │   ├── package.json
│   │   ├── pnpm-lock.yaml
│   │   └── .env.example
│   └── api/                           # FastAPI / uv
│       ├── app/
│       │   ├── main.py
│       │   ├── core/
│       │   ├── api/
│       │   │   ├── deps.py
│       │   │   └── routes/
│       │   │       └── documents.py
│       │   ├── services/
│       │   │   ├── pdf.py
│       │   │   └── storage.py
│       │   └── schemas/
│       ├── tests/
│       ├── pyproject.toml
│       ├── uv.lock
│       ├── Dockerfile
│       └── .env.example
├── supabase/migrations/
├── .github/workflows/ci.yml
├── .gitignore
└── README.md
```

**Monorepo approach:** Keep the established one-repository/two-app structure, with separate pnpm and uv dependency management. Do not introduce Turborepo, a separate worker service, or empty RAG folders before they are needed. FastAPI route modules handle HTTP; services handle file processing and storage; schemas hold Pydantic models.

### Implementation order

**P0 — Essential path**

- [ ]  Confirm local Next.js and FastAPI development, a health endpoint, and Supabase Auth integration.
- [ ]  Add PostgreSQL migrations for documents, extraction states/pages, and reading progress.
- [ ]  Build authenticated private library, upload action, and processing/error states.
- [ ]  Implement validated R2 upload completion and authorized short-lived file access.
- [ ]  Extract page-attributed digital-PDF text with browser-side PDF.js, send validated batches to FastAPI, and persist in `document_pages`. Allow reading when no text is extractable; report AI-context unavailability and support interrupted-processing retry.
- [ ]  Render authorized PDFs with React-PDF (Mozilla PDF.js underneath) and implement basic page navigation.
- [ ]  Persist and restore last-read page and complete owner-isolation tests.
- [ ]  Document local setup, known limitations, and a reproducible demo.

**P1 — Polish / Milestone 2 preparation**

- [ ]  Build zoom, PDF text search, outline/thumbnails, and keyboard conveniences around React-PDF; these controls are application UI, not automatically provided by the rendering components.
- [ ]  Add robust PDF text-selection support and test selection-to-page metadata for future AI context.
- [ ]  Refine responsive panel behavior, visual states, and optional profile metadata.

**Implementation rule:** Finish the smallest complete path before building sophisticated reading controls or the RAG pipeline.

### Milestone 1 definition of done

**Required (P0)**

1. Signed-in user A can upload and reopen a supported born-digital PDF in a private library.
2. Signed-in user B cannot list it or retrieve its document metadata, extracted text, or a signed PDF URL.
3. The PDF reader can navigate between pages and jump to a specified page; it restores the saved page on a later visit.
4. A PDF with no extractable text remains readable but shows an accurate text-extraction status; unsupported PDFs, interrupted extraction, and failed uploads produce clear recovery actions without silently claiming success.
5. The complete flow works with no AI keys configured and with repeatable local setup instructions.
6. Relevant API/authorization tests and an end-to-end browser smoke test pass.

**Additional reader-quality checks (P1; not blockers)**

- Zoom, find-in-document, available outline, and text selection function on representative PDFs.
- Reader controls are usable on narrower layouts and the future AI panel fits without obscuring the document.
- Selection capture preserves source document/page metadata for contextual AI.

**Handoff into Milestone 2:** By the start of AI-chat integration, selected-text capture, page-context retrieval, collapsible chat layout, and source-page navigation must be reliable; these may be delivered as P1 of Milestone 1 or as initial tasks in Milestone 2.

### Next milestone interface contracts

Milestone 2 adds a collapsible, persistent per-document chat. It passes selected text or bounded current-page content, streams grounded explanations, and provides clickable citations to one page or a contiguous two-page range; exact passage highlighting is not required. Milestone 3 adds evaluated full-document RAG using page-attributed chunks and pgvector; hybrid retrieval and reranking are optional measurable extensions.

**Revision note — November 20, 2026:** Milestone 1 prioritizes the non-AI reader before contextual chat and RAG. **Refinement — November 21, 2026:** Browser-side extraction is preferred over a dedicated server ingestion worker to minimize hosting cost and support future opt-in browser OCR. This is a plan, not a claim that any tasks above are implemented.
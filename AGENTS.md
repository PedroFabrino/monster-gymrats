# AGENTS.md — Strict Engineering & Quality Gate Contract

> **AGENT DIRECTIVE:** This file defines non-negotiable engineering standards and quality gates. You must validate all generated or modified code against every rule in the Universal Core and the relevant Language Addendum before declaring any task complete.

---

## Part 1: Universal Quality Gates (Language-Agnostic)

### 1. Structural & Complexity Limits
To guarantee maintainability and prevent monolithic files, enforce these hard quantitative limits:
* **File Length:** Maximum **300 lines of code (LOC)** per file (excluding comments, blank lines, and auto-generated types). Split files exceeding this limit by domain responsibility.
* **Function Length:** Maximum **40 LOC** per function or method.
* **Cyclomatic Complexity:** Maximum complexity score of **10** per function. Refactor nested conditionals using guard clauses, early returns, or strategy patterns.
* **Parameter Count:** Maximum **3 positional parameters** per function. If a function requires more than 3 inputs, group them into a single typed configuration/options object.
* **Nesting Depth:** Maximum **3 levels** of control-flow nesting (`if`/`for`/`try`/`switch`).

### 2. Architecture & Modularity
* **Unidirectional Dependencies:** Dependencies must flow inward toward the domain logic: `UI / Controllers -> Application / Use Cases -> Domain -> Infrastructure / Utilities`. Circular dependencies are strictly forbidden.
* **Single Responsibility Principle (SRP):** Each module/file must have one reason to change. Never mix I/O operations (network, disk, database) with pure business logic or data transformations.
* **Explicit Public APIs:** Modules must expose only their intended contract. Keep helper functions, internal constants, and implementation details private to the module.
* **No Hardcoded Configuration:** Environment URLs, timeouts, feature flags, and credentials must be injected via validated environment variables or configuration providers—never hardcoded in logic.

### 3. Defensive Coding & Error Handling
* **Parse, Don't Validate:** Validate and sanitize all external inputs (API payloads, CLI args, env vars, DB reads) at the system boundary using schema validation before passing data to internal functions.
* **No Silent Failures:** Empty `catch` blocks or swallowed errors are forbidden. Every caught error must be either handled with a recovery path, wrapped with domain context and rethrown, or logged with structured metadata.
* **Immutability by Default:** Treat function arguments and shared state as immutable. Return new data structures rather than mutating inputs in place unless explicitly optimizing a proven performance bottleneck.

### 4. Testing & Verification Requirements
* **No Untested Logic:** Every new feature or bug fix requires automated unit or integration tests covering:
  1. The happy path.
  2. Edge/boundary cases (empty inputs, nulls, limits).
  3. Failure/error paths.
* **Deterministic Tests:** Tests must never depend on execution order, real wall-clock time, live external networks, or shared mutable state. Mock external I/O boundaries only—never mock the system under test.
* **Zero Warnings Policy:** Linter warnings, compiler warnings, and deprecation notices are treated as build-breaking errors.

### 5. Pre-Completion Verification Checklist (Mandatory Loop)
Before completing a task or submitting changes, the agent **MUST** execute the project's verification pipeline in this exact order and resolve all failures:
1. **Static Analysis / Typecheck** — Must exit with `0` errors.
2. **Linter & Formatter** — Must exit with `0` errors and `0` warnings.
3. **Test Suite** — All relevant unit/integration tests must pass with `0` failures.
4. **Self-Review Diff Check** — Inspect `git diff` to ensure no debug logs, commented-out code, unrelated formatting changes, or secret tokens remain.

---

## Part 2: Language Addendums

### Addendum A: JavaScript / TypeScript Quality Gate

#### 1. Type Safety & Language Strictness
* **Strict Mode:** TypeScript `strict: true` (including `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and `noImplicitOverride`) or `@ts-check` with JSDoc in pure JS projects is mandatory.
* **Zero `any` Policy:** Usage of `any` is strictly forbidden. Use `unknown` with type guards/narrowing or generics.
* **No Non-Null Assertions:** Do not use the postfix `!` operator (`value!`). Handle `null`/`undefined` explicitly via optional chaining (`?.`), nullish coalescing (`??`), or guard clauses.
* **No Unsafe Type Assertions:** Avoid `as Type` casting on external data. Use runtime schema validators (e.g., Zod, Valibot, TypeBox) to infer and guarantee types at runtime.

#### 2. Asynchronous Execution & Concurrency
* **Floating Promises:** Every Promise must be `await`ed, returned, or explicitly handled with `.catch()`. Unhandled floating promises are forbidden.
* **Parallelism by Default:** Independent async operations must use `Promise.all()` or `Promise.allSettled()` instead of sequential `await` statements inside loops.
* **Cancellation & Timeouts:** All external network requests (`fetch`, Axios, RPC calls) must include an `AbortSignal` or explicit timeout configuration.

#### 3. Modern Syntax & Immutability
* **Variable Declarations:** Use `const` by default. Use `let` only for loop counters or accumulators. `var` is strictly banned.
* **Non-Mutating Array/Object Methods:** Prefer ES2023+ immutable methods (`toSorted()`, `toReversed()`, `toSpliced()`, `map()`, `filter()`) or spread syntax over mutating methods (`sort()`, `reverse()`, `splice()`, `push()` on shared arrays).
* **Strict Equality:** Always use `===` and `!==`.
* **Module System:** Use standard ES Modules (`import`/`export`). CommonJS (`require`/`module.exports`) is prohibited unless required by a legacy build tool config.
* **Named Exports Only:** Default exports (`export default`) are forbidden in application and library code to enforce consistent naming and reliable refactoring (exception: framework routing files that strictly require default exports).

#### 4. Dependency & Security Hygiene
* **No Console Logs:** `console.log`, `console.debug`, and `debugger` statements are forbidden in production source files. Use the project's structured logger.
* **Bundle & Import Hygiene:** Import specific submodules or tree-shakeable functions rather than entire heavy libraries. Never import server-only modules into client/browser bundles.

#### 5. Standard JS/TS Gate Commands
Run and pass these checks before finalizing any JS/TS task:
```bash
# 1. Typecheck
npm run typecheck # or: npx tsc --noEmit

# 2. Lint (Zero warnings allowed)
npm run lint -- --max-warnings=0

# 3. Format check
npm run format:check

# 4. Unit/Integration tests
npm test -- --run
```

---

## Agent skills

### Issue tracker

GitHub Issues in `PedroFabrino/monster-gymrats` via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five canonical triage labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout (`CONTEXT.md` and `docs/adr/` at the repo root). See `docs/agents/domain.md`.

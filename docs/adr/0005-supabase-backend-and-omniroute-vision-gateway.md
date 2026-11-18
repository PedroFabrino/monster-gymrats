# Supabase Platform Backend and OpenAI-Compatible Vision Gateway

We will use Supabase from the start for PostgreSQL persistence, Authentication, Image Storage, and Realtime subscriptions (Club feeds, chat, reactions, and Dispute votes), paired with an OpenAI-compatible Vision LLM client configurable via environment variables (`AI_BASE_URL`, `AI_API_KEY`, `AI_VISION_MODEL`) defaulting to OmniRoute / Gemini Flash. This avoids building bespoke WebSocket, blob storage, and auth infrastructure while keeping the AI vision pipeline provider-agnostic and routable through OmniRoute.

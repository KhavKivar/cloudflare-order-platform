# WhatsApp Bot Implementation Plan

## Goals
- Clients can place orders via WhatsApp.
- Admin can view incoming orders.

## Assumptions to Confirm
- WhatsApp provider: Meta Cloud API or Twilio WhatsApp.
- Backend stack already in repo or to be created.
- Admin interface: web dashboard, email/Slack, or WhatsApp admin thread.
- Hosting: where the webhook will run.

## Architecture
- WhatsApp provider -> Webhook endpoint (backend)
- Backend parses messages, manages session state, stores orders
- Admin view via dashboard or notifications

## Data Model
- Order
  - id
  - client_phone
  - items (name, qty, notes)
  - status (new, confirmed, fulfilled)
  - created_at
- Conversation State (optional)
  - client_phone
  - step (collect_name, collect_items, confirm)
  - temp_order_data

## Flow: Client Order
- Step 1: User starts chat with keyword "order"
- Step 2: Bot collects required details (name, items, quantity, notes)
- Step 3: Bot summarizes order and asks for confirmation
- Step 4: On confirm, persist order and acknowledge

## Flow: Admin View
- Option A: Simple admin notification in WhatsApp group or direct admin number
- Option B: Web dashboard listing orders
- Option C: Both A and B for redundancy

## Integration Steps
- Register WhatsApp API provider and configure webhook URL
- Implement webhook handler with verification and message parsing
- Add conversation state storage (DB or in-memory with TTL)
- Implement order persistence and status updates
- Add admin notification and/or dashboard

## Security and Compliance
- Verify webhook signature
- Rate limit per client
- Sanitize input
- Store minimal PII required for orders

## Testing Plan
- Unit tests for message parsing and state transitions
- Integration test for webhook end-to-end
- Manual test with a real WhatsApp number

## Milestones
1. Provider setup and webhook hello-world
2. Conversation state machine for order flow
3. Order persistence and admin view
4. Hardening, tests, and deployment

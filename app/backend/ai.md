# AI Plan (OrderSapp)

## Goal
Build an AI layer that can read incoming order messages, extract structured order data, validate it, and create an order with a confirmation flow.

## Scope
- Input: WhatsApp messages (text, later media/voice if needed).
- Output: Structured order payload + confirmation response.
- Constraints: Handle incomplete messages, ask follow-up questions, avoid duplicate orders.

## Proposed Flow
1. Message intake
   - Normalize text (trim, collapse whitespace, basic language detection).
2. Extraction
   - Use an LLM with schema-guided extraction to produce a draft order.
3. Validation
   - Validate required fields (customer, items, quantities, delivery address/time).
   - If missing/ambiguous, ask a follow-up question.
4. Order creation
   - Create order in storage (DB or in-memory for MVP).
5. Confirmation
   - Summarize order and request confirmation or edits.

## Data Model (MVP)
- orderId
- customerName
- phone
- items[]: { name, qty, notes }
- deliveryAddress
- deliveryTime
- paymentMethod
- specialInstructions
- status (draft | confirmed | canceled)

## MVP Tasks
- Add AI config (provider + model + API key).
- Implement extraction pipeline with JSON schema.
- Add validator + missing-fields prompt.
- Add order storage layer (simple JSON or DB).
- Add confirmation messages and edit flow.

## Next Steps
- Support multi-turn context (per chat session).
- Add item catalog matching (fuzzy match).
- Add payment integration and status updates.

# Project Decisions

This document tracks the architectural and design decisions for the OrderSapp project.

## 1. Application Structure and Routing

### Routing Philosophy

We will follow a resource-based routing structure using singular names for the primary resources to keep URLs concise and intuitive, as per initial requirements.

| Resource           | Route                 | Component/Page            | Description                         |
| :----------------- | :-------------------- | :------------------------ | :---------------------------------- |
| **Client**         | `/client`             | `ClientListPage`          | List of all clients                 |
|                    | `/client/new`         | `ClientCreatePage`        | Form to create a new client         |
|                    | `/client/:id`         | `ClientDetailPage`        | View/Edit specific client           |
| **Order**          | `/order`              | `OrderListPage`           | List of all orders                  |
|                    | `/order/new`          | `OrderCreatePage`         | Form to create a new order          |
|                    | `/order/:id`          | `OrderDetailPage`         | View/Edit specific order            |
| **Purchase Order** | `/purchase-order`     | `PurchaseOrderListPage`   | List of all purchase orders         |
|                    | `/purchase-order/new` | `PurchaseOrderCreatePage` | Form to create a new purchase order |
|                    | `/purchase-order/:id` | `PurchaseOrderDetailPage` | View/Edit specific purchase order   |

### Folder Structure (Frontend)

The `src/app` directory will be restructured to match the routing logic. This improves maintainability and makes it easier to find code associated with specific routes.

Proposed mapping:

- `src/app/client/`
  - `page.tsx` (List)
  - `new/page.tsx` (Create)
  - `[id]/page.tsx` (Detail/Edit)
- `src/app/order/`
  - `page.tsx` (List)
  - `new/page.tsx` (Create)
  - `[id]/page.tsx` (Detail/Edit)
- `src/app/purchase-order/`
  - `page.tsx` (List)
  - `new/page.tsx` (Create)
  - `[id]/page.tsx` (Detail/Edit)

### Next Steps for Implementation

1.  **Rename/Move Folders**: Consolidate existing folders like `clients-all`, `orders-list`, `orders-detail` into the new structured format.
2.  **Update Routes**: Update the `Routes` definition in `src/app/App.tsx` to reflect the new paths.
3.  **Refactor Imports**: Update imports in components and layouts to point to the new file locations.

## 2. Error Handling and Service Patterns

### Service Response Patterns

To maintain consistency across our backend services, we follow these rules for return values and error handling:

- **GET (Queries)**:
  - If a resource is not found, the service method returns `null`.
  - The route handler is responsible for checking for `null` and throwing a `NotFoundError` (resulting in a 404 response).
- **CREATE / UPDATE / DELETE (Mutations)**:
  - These methods should **throw errors** if the operation cannot be completed (e.g., resource not found for update/delete, database constraints violated).
  - This ensures that transactions are rolled back (if applicable) and the caller is notified of the failure explicitly.

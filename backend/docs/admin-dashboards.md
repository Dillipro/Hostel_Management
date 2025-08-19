# Admin/Warden Dashboards API Guide

This guide shows how to consume the analytics endpoints in `routes/reports.js` for your frontend.

## Collections Trend (Finance)
- Endpoint: GET /api/reports/dashboard/collections-trend?months=6
- Roles: admin, super_admin, accounts
- Returns: [{ month: "2025-07", amount: 123450 }]
- Use: Plot a line or bar chart of monthly paid collections.

## Occupancy by Block
- Endpoint: GET /api/reports/dashboard/occupancy
- Roles: admin, super_admin, warden
- Returns: [{ block: "A", occupancy: 120, totalRooms: 150 }]
- Use: Horizontal bar chart or donut of occupancy vs capacity per block.

## Mess Waste vs Served
- Endpoint: GET /api/reports/dashboard/mess-waste?messId=<id>&from=2025-08-01&to=2025-08-31
- Roles: admin, super_admin, warden, mess_manager
- Returns: { breakfast: { served: 3000, wasted: 120 }, lunch: { served: 4000, wasted: 200 }, ... }
- Use: Grouped bars (served vs wasted) per meal type.

## Tips
- Use the authenticated JWT and pass it in `Authorization: Bearer <token>`.
- For real-time alerts and mess events, subscribe to socket rooms: `block:<blockId>`, `mess:<messId>`.
- Respect celebrate validations; provide required query params.
- For exports (CSV/PDF/Excel), trigger a file download and infer type via Content-Type header.

# Frontend Integration Guide (Phase 2)

## Socket.IO rooms
After login, connect to Socket.IO and join rooms based on role.

- Students: `student:<studentId>`
- Wardens: `block:<blockId>`, `mess:<messId>`

Example (React):
```ts
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_BASE, { withCredentials: true });

export function joinRooms({ studentId, blockIds, messIds }) {
  const rooms = [];
  if (studentId) rooms.push(`student:${studentId}`);
  (blockIds || []).forEach(id => rooms.push(`block:${id}`));
  (messIds || []).forEach(id => rooms.push(`mess:${id}`));
  socket.emit('join-rooms', rooms);
}

socket.on('scan-event', payload => console.log('scan-event', payload));
socket.on('mess-entry', payload => console.log('mess-entry', payload));
socket.on('special-diet', payload => console.log('special-diet', payload));
socket.on('discipline-event', payload => console.log('discipline-event', payload));
```

## Key Endpoints
- Attendance scan (QR/RFID): `POST /api/access-control/scan`
- IoT ingest (device → server): `POST /api/attendance/ingest` (header: `x-iot-token`)
- Mess
  - Entry log: `POST /api/mess/entry`
  - Special diet: `POST /api/mess/special-diet`, `GET /api/mess/special-diet`
  - Today counts: `GET /api/mess/attendance/today?messId=`
- Payments
  - Create order: `POST /api/payments/create-order`
  - Verify: `POST /api/payments/verify-payment`
  - Receipt PDF: `GET /api/payments/receipt/:paymentId/pdf`
- Reports
  - Defaulters: `GET /api/reports/defaulters` (+ `/pdf` for branded PDF)
  - Mess forecast: `GET /api/reports/mess/forecast` (+ `/pdf` for branded PDF)
- Student portal (Phase 2 additions)
  - Mess join/leave/view: `POST /api/student-portal/mess/join`, `POST /api/student-portal/mess/leave`, `GET /api/student-portal/mess`

## Event payloads
- scan-event: `{ success, action, reason, scope, student, device, at }`
- mess-entry: `{ student, mealType, at }`
- special-diet: `{ id, mealType, dietType }`
- discipline-event: `{ id, category, severity }`

## UI Notes
- Show realtime banners on scan denial and discipline events.
- Use defaulters + forecast to power admin dashboards (collections and meal planning).

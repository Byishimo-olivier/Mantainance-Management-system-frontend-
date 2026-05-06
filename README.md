# FixNest Frontend

Vite React frontend for the FixNest Maintenance Management System.

## What This App Does

The frontend contains the public website, authentication flows, dashboards, subscription flow, request portals, maintenance management screens, inventory screens, analytics, and role-specific experiences for admins, managers, clients, technicians, and superadmins.

## Stack

- React 18
- Vite
- React Router
- Tailwind CSS
- PrimeReact
- Axios
- Lucide React
- Recharts / Chart.js
- Framer Motion

## Setup

```powershell
npm install
npm run dev
```

Production build:

```powershell
npm run build
npm run preview
```

Default local URL:

```text
http://localhost:5173
```

## Environment Variables

Create `.env`:

```env
VITE_API_URL=http://localhost:5000
```

The shared Axios client in `src/api/axios.js`:

- Uses `VITE_API_URL` as the backend base URL.
- Automatically prefixes relative requests with `/api`.
- Adds `Authorization: Bearer <token>` from `localStorage`.
- Clears session and redirects to `/login` on authenticated `401` responses.

## Project Structure

```text
src/
  App.jsx                         Main route table and subscription guard
  Dashboard.jsx                   Main dashboard shell
  main.jsx                        React entry point
  index.css                       Global and Tailwind styles
  api/                            API clients
  hooks/                          Trial and subscription hooks
  i18n/                           Language provider
  components/
    auth/                         Login, register, SSO, password reset, invites
    features/                     Marketing feature pages
    legal/                        Legal pages and sitemap
    marketing/                    Footer-generated marketing page template
    products/                     Product pages
    resources/                    Resource pages and calculators
    solutions/                    Role and industry solution pages
  data/                           Footer and legal page data
  assets/                         Product screenshots, photos, PDFs, videos
```

## Main App Routes

Public routes:

- `/`: landing page
- `/request-demo`: demo request
- `/login`, `/register`, `/sso-login`
- `/forgot-password`, `/reset-password/:token`
- `/activate/:token`, `/activation-pending`, `/accept-invite`
- `/pricing`, `/subscribe`, `/payment-selection`, `/payment-confirmation`
- `/properties`, `/properties-cards`, `/property-details/:id`, `/property/:id`
- `/public-request/:companySlug`
- `/public-purchase-order/:token`
- Product pages under `/product/...`
- Feature pages under `/feature/...`
- Solution pages under `/solution/...`
- Resource pages under `/resource/...` and `/resources`
- Legal pages: `/privacy-policy`, `/terms-of-use`, `/cookie-settings`, `/sitemap`

Protected app routes:

- `/dashboard` and `/dashboard/:view`
- `/issues`
- `/requests`
- `/analytics`
- `/technicians`
- `/technician-dashboard`
- `/manager-issues`
- `/manager-dashboard` for superadmin users
- `/feedback`
- `/manager-feedback`
- `/admin-chat` for superadmin users
- `/subscription`

## Authentication Flow

The app stores the authenticated session in `localStorage`:

- `token`
- `user`

After login, users are redirected by role:

- `superadmin` / `super-admin`: `/manager-dashboard`
- `admin` / `manager`: `/dashboard`
- `technician`: `/technician-dashboard`
- fallback: `/dashboard`

`SubscriptionGuard` protects private routes. Superadmins bypass subscription checks. Other users must either be in trial or have an active company subscription.

## Important Feature Areas

- `Dashboard.jsx`: central authenticated dashboard shell.
- `ClientDashboard.jsx`: client maintenance, PM, request, and asset workflows.
- `TechnicianDashboard.jsx`: technician task/work order experience.
- `ManagerDashboard.jsx`: superadmin/admin management experience.
- `ManagementIssues.jsx`, `AllIssues.jsx`, `NewIssue.jsx`: issue and work order UI.
- `ScheduleMaintenanceForm.jsx`, `PreventiveMaintenanceDetail.jsx`: preventive maintenance UI.
- `SparePartsList.jsx`, `PublicPurchaseOrder.jsx`: inventory and purchase order UI.
- `AIChatbot.jsx`: authenticated in-app assistant.
- `TrialBanner.jsx`, `TrialCountdown.jsx`, `TrialExpiredModal.jsx`: trial UX.
- `SubscriptionPlan.jsx`, `SubscriptionManagement.jsx`, `PaymentSelection.jsx`: billing UX.

## Styling and Responsiveness

The app uses Tailwind CSS with custom responsive utilities. See:

- [Responsive Design Guide](./RESPONSIVE_DESIGN_GUIDE.md)
- [Quick Reference](./QUICK_REFERENCE.md)
- [Component Update Examples](./COMPONENT_UPDATE_EXAMPLES.md)
- `tailwind.config.js`
- `src/index.css`

## Build and Deployment

The frontend includes `vercel.json` with a rewrite to `index.html`, which allows React Router routes to work after refresh in production.

Production checklist:

1. Set `VITE_API_URL` to the deployed backend URL.
2. Run `npm run build`.
3. Deploy the generated Vite build.
4. Ensure the backend `FRONTEND_URL` allows the deployed frontend origin.

## Related Docs

- [Root Project README](../README.md)
- [Backend README](../Mantainance-Management-system-Backend-/README.md)
- [Recurring PM Guide](./RECURRING_PM_GUIDE.md)
- [Header Usage Guide](./HEADER_USAGE_GUIDE.md)


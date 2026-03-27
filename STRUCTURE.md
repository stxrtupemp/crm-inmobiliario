# CRM Inmobiliario — Estructura de Carpetas

```
crm-inmobiliario/
├── docker-compose.yml
├── package.json                        ← workspace raíz
├── .env.example
├── .gitignore
│
├── server/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   └── src/
│       ├── app.ts                      ← Express app factory
│       ├── server.ts                   ← Entry point
│       ├── config/
│       │   ├── env.ts                  ← Zod-validated env vars
│       │   ├── database.ts             ← Prisma client singleton
│       │   └── storage.ts              ← Multer config
│       ├── lib/
│       │   ├── jwt.ts
│       │   ├── bcrypt.ts
│       │   ├── response.ts             ← { success, data, error, meta }
│       │   └── errors.ts               ← AppError, HttpError classes
│       ├── middlewares/
│       │   ├── auth.middleware.ts
│       │   ├── role.middleware.ts
│       │   ├── validate.middleware.ts
│       │   ├── upload.middleware.ts
│       │   └── error.middleware.ts
│       └── modules/
│           ├── auth/
│           │   ├── auth.routes.ts
│           │   ├── auth.controller.ts
│           │   ├── auth.service.ts
│           │   └── auth.schema.ts
│           ├── users/
│           │   ├── users.routes.ts
│           │   ├── users.controller.ts
│           │   ├── users.service.ts
│           │   └── users.schema.ts
│           ├── properties/
│           │   ├── properties.routes.ts
│           │   ├── properties.controller.ts
│           │   ├── properties.service.ts
│           │   └── properties.schema.ts
│           ├── leads/
│           │   ├── leads.routes.ts
│           │   ├── leads.controller.ts
│           │   ├── leads.service.ts
│           │   └── leads.schema.ts
│           ├── tasks/
│           │   ├── tasks.routes.ts
│           │   ├── tasks.controller.ts
│           │   ├── tasks.service.ts
│           │   └── tasks.schema.ts
│           ├── contacts/
│           │   ├── contacts.routes.ts
│           │   ├── contacts.controller.ts
│           │   ├── contacts.service.ts
│           │   └── contacts.schema.ts
│           ├── pipeline/
│           │   ├── pipeline.routes.ts
│           │   ├── pipeline.controller.ts
│           │   ├── pipeline.service.ts
│           │   └── pipeline.schema.ts
│           ├── documents/
│           │   ├── documents.routes.ts
│           │   ├── documents.controller.ts
│           │   ├── documents.service.ts
│           │   └── documents.schema.ts
│           └── dashboard/
│               ├── dashboard.routes.ts
│               ├── dashboard.controller.ts
│               └── dashboard.service.ts
│
└── client/
    ├── package.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    ├── .env.example
    └── src/
        ├── main.tsx                    ← Entry point
        ├── App.tsx                     ← Router root
        ├── vite-env.d.ts
        ├── config/
        │   └── env.ts
        ├── lib/
        │   ├── axios.ts                ← Axios instance + interceptors
        │   ├── queryClient.ts          ← React Query client
        │   └── utils.ts
        ├── store/
        │   ├── auth.store.ts           ← Zustand auth slice
        │   └── ui.store.ts             ← Zustand UI slice (sidebar, modals)
        ├── hooks/
        │   ├── useAuth.ts
        │   └── useDebounce.ts
        ├── types/
        │   ├── api.types.ts            ← ApiResponse<T>, Meta, etc.
        │   ├── auth.types.ts
        │   ├── property.types.ts
        │   ├── lead.types.ts
        │   ├── task.types.ts
        │   ├── contact.types.ts
        │   └── user.types.ts
        ├── components/
        │   ├── ui/                     ← Primitivos reutilizables
        │   │   ├── Button.tsx
        │   │   ├── Input.tsx
        │   │   ├── Select.tsx
        │   │   ├── Modal.tsx
        │   │   ├── Badge.tsx
        │   │   ├── Table.tsx
        │   │   ├── Pagination.tsx
        │   │   ├── Spinner.tsx
        │   │   └── Toast.tsx
        │   └── layout/
        │       ├── AppLayout.tsx       ← Shell CRM (sidebar + topbar)
        │       ├── PublicLayout.tsx    ← Shell web pública
        │       ├── Sidebar.tsx
        │       ├── Topbar.tsx
        │       └── ProtectedRoute.tsx
        └── modules/
            ├── auth/
            │   ├── pages/
            │   │   ├── LoginPage.tsx
            │   │   └── ForgotPasswordPage.tsx
            │   ├── components/
            │   │   └── LoginForm.tsx
            │   └── hooks/
            │       └── useLogin.ts
            ├── dashboard/
            │   ├── pages/
            │   │   └── DashboardPage.tsx
            │   └── components/
            │       ├── StatsCard.tsx
            │       └── RecentActivity.tsx
            ├── properties/
            │   ├── pages/
            │   │   ├── PropertiesPage.tsx
            │   │   ├── PropertyDetailPage.tsx
            │   │   └── PropertyFormPage.tsx
            │   ├── components/
            │   │   ├── PropertyCard.tsx
            │   │   ├── PropertyFilters.tsx
            │   │   └── PropertyGallery.tsx
            │   └── hooks/
            │       ├── useProperties.ts
            │       └── useProperty.ts
            ├── leads/
            │   ├── pages/
            │   │   ├── LeadsPage.tsx
            │   │   └── LeadDetailPage.tsx
            │   ├── components/
            │   │   ├── LeadCard.tsx
            │   │   └── LeadForm.tsx
            │   └── hooks/
            │       └── useLeads.ts
            ├── contacts/
            │   ├── pages/
            │   │   ├── ContactsPage.tsx
            │   │   └── ContactDetailPage.tsx
            │   ├── components/
            │   │   └── ContactForm.tsx
            │   └── hooks/
            │       └── useContacts.ts
            ├── tasks/
            │   ├── pages/
            │   │   └── TasksPage.tsx
            │   ├── components/
            │   │   ├── TaskBoard.tsx
            │   │   └── TaskForm.tsx
            │   └── hooks/
            │       └── useTasks.ts
            ├── pipeline/
            │   ├── pages/
            │   │   └── PipelinePage.tsx
            │   └── components/
            │       ├── KanbanBoard.tsx
            │       └── KanbanCard.tsx
            ├── users/
            │   ├── pages/
            │   │   └── UsersPage.tsx
            │   └── components/
            │       └── UserForm.tsx
            └── public-web/             ← Frontend público (mismo proyecto)
                ├── pages/
                │   ├── HomePage.tsx
                │   ├── ListingsPage.tsx
                │   └── ListingDetailPage.tsx
                └── components/
                    ├── HeroSection.tsx
                    ├── SearchBar.tsx
                    └── PropertyListingCard.tsx
```

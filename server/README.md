# SU - Wilfrid Laurier Student Platform

A comprehensive student community platform for Wilfrid Laurier University students to connect, share, sell, and discover everything happening on campus.

## Features

###  Blog Posts
- Create and publish blog posts in multiple categories: Blog, Academic, Campus, General
- View recent blog posts from other students
- Delete your own posts
- Search functionality across post titles and content

###  Marketplace
- Buy and sell textbooks, furniture, and other items
- Create listings with descriptions, prices, and categories
- View active marketplace listings
- Delete your own listings
- Price display and category filtering

###  Direct Messaging
- Send and receive direct messages with other verified students
- Keep conversations organized with conversation history
- Real-time messaging updates

###  Search & Discovery
- Comprehensive search across:
  - Blog posts (title, content, category)
  - Marketplace listings (title, description, category)
  - Student profiles (name, bio, program)
- Filter results by category

###  Student Profiles
- Browse student profiles
- View profile information, program, year of study, and bio
- Edit your own profile
- Profile verification

###  Dashboard
- Personalized greeting
- Quick access navigation
- Recent blog posts feed
- Activity overview

##  Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Framework**: shadcn/ui components
- **Styling**: Tailwind CSS
- **Data Fetching**: React Query (@tanstack/react-query)
- **Routing**: React Router v6
- **Backend**: Supabase (PostgreSQL + Auth)
- **Testing**: Vitest + Playwright
- **Package Manager**: npm/bun

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── ui/             # shadcn/ui components
├── pages/              # Page components
│   ├── Index.tsx       # Landing page
│   ├── Login.tsx       # Login page
│   ├── Signup.tsx      # Sign up page
│   ├── Dashboard.tsx   # Dashboard
│   ├── Blogs.tsx       # Blog posts
│   ├── BlogPost.tsx    # Single blog post
│   ├── Marketplace.tsx # Marketplace listings
│   ├── Messages.tsx    # Direct messages
│   ├── SearchPage.tsx  # Search results
│   ├── Profile*.tsx    # Profile pages
│   └── ...
├── contexts/           # React contexts (Auth)
├── hooks/              # Custom React hooks
├── integrations/       # External integrations (Supabase)
├── lib/                # Utility functions
└── App.tsx             # Main app component
```

##  Getting Started

### Prerequisites
- Node.js 16+
- npm or bun package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8080/`

##  Environment Setup

Create a `.env` file with the following variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

##  Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

##  Authentication

The platform uses Supabase Authentication with:
- Email/password signup and login
- Email verification
- Secure session management
- Protected routes for authenticated users

##  Key Pages

| Page | Path | Description |
|------|------|-------------|
| Landing | `/` | Homepage for anonymous users |
| Login | `/login` | User login |
| Signup | `/signup` | User registration |
| Dashboard | `/dashboard` | Main dashboard (protected) |
| Blogs | `/blogs` | Blog posts list |
| Blog Post | `/blogs/:id` | Single blog post |
| Marketplace | `/marketplace` | Marketplace listings |
| Messages | `/messages` | Direct messaging |
| Search | `/search` | Search results |
| Profile | `/profile/:id` | User profile view |
| Profile Edit | `/profile/edit` | Edit user profile |
| Calendar | `/calendar` | Events calendar |
| Academic | `/academic` | Academic resources |

##  Styling

The project uses Tailwind CSS with a custom component library (shadcn/ui) for consistent theming and responsive design. Colors, spacing, and other design tokens can be customized in `tailwind.config.ts`.

##  Database Schema

The project uses Supabase with the following main tables:
- `auth.users` - User authentication
- `profiles` - User profiles and information
- `posts` - Blog posts
- `marketplace_listings` - Marketplace items
- `conversations` - Direct message conversations
- `messages` - Individual messages
- `events` - Calendar events

##  Component Patterns

- **Protected Routes**: Routes wrapped with `<ProtectedRoute>` require authentication
- **Layout**: All authenticated routes use `<Layout>` component for consistent navigation
- **Query Hooks**: Data fetching uses `useQuery` from React Query
- **Error Handling**: Comprehensive error states and toast notifications

##  Development Notes

- The application uses client-side filtering for search to allow flexible keyword matching across multiple fields
- Blog posts, marketplace listings, and profiles are queryable from any context
- Row-level security (RLS) is enabled on Supabase to protect user data
- Authentication is required for most features except landing and auth pages

##  Future Enhancements

- Advanced search filters
- Notification system
- Post comments and replies
- Marketplace messaging
- Image uploads
- Social features (follows, likes)
- Analytics dashboard
- Mobile app

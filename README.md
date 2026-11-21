# RoutineTrack

A student wellness tracker. Students log daily sleep, study hours, hydration and stress, and get a Burnout Risk Index (BRI) with recovery suggestions. Administrators can review students' recent BRI and manage their accounts.

Built with React 19, Vite and Tailwind on the front end, and Supabase (Postgres + Supabase Auth) for data and login.

## Setup

### 1. Database (one time)

In the Supabase dashboard, open **SQL Editor → New query**, paste the contents of [database/supabase_auth_setup.sql](database/supabase_auth_setup.sql), and click **Run**. This:

- links the `users` table to Supabase Auth accounts,
- turns on Row Level Security, so each student can only see their own data and only admins can see everyone,
- adds the `admin_delete_student` function used by the admin console.

Under **Authentication → Sign In / Providers → Email**, you can choose whether new users must confirm their email address. The app supports both settings.

### 2. Client

```bash
cd client
cp .env.example .env   # then fill in the values from Project Settings → API
npm install
npm run dev
```

## Accounts

- **Students** register in the app. Accounts that existed before the move to Supabase Auth need to **register again with the same email**. Their existing routine logs are linked to the new login automatically once the email is confirmed.
- **Admins** are users whose `users.role` is `ADMIN`. `admin@usiu.ac.ke` is set as admin by the setup script. That account also needs to register in the app once to get a login. To make someone else an admin, change their `role` in the Supabase table editor.
- Admins can flag an account, which blocks that student from signing in, or delete it completely.

## Project layout

```
client/src/
  App.jsx                 page switching and session restore
  supabaseClient.js       Supabase client (reads client/.env)
  services/authService.js sign in / sign up / profile loading
  utils/bri.js            Burnout Risk Index calculation
  pages/                  Landing, Login, Register, Dashboard, AdminDashboard
  components/dashboard/   TaskList (stored in the browser's localStorage)
database/
  supabase_auth_setup.sql auth + security setup script
server/                   placeholder files for a planned Express API (not used yet)
```

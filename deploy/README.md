# Deploy Notes

HeroQuest MMO deploys as two services:

- Netlify hosts the static Vite client from `client/dist`.
- Render hosts the Express and Socket.IO server from `server`.

The optional `supabase_schema.sql` is reserved for future persistent accounts and is not required for Version 1.1.

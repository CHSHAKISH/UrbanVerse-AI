# UrbanVerse AI

UrbanVerse AI is an interactive, AI-powered urban planning simulator. It allows city planners and enthusiasts to simulate infrastructural changes across different city zones and instantly receive an AI-generated impact analysis on traffic, carbon emissions, flood risk, and accessibility.

## 🚀 Key Features

- **Interactive City Map**: A beautiful, fully interactive map using React-Leaflet and OpenStreetMap/CartoDB tiles, with dynamic Light/Dark mode support.
- **AI Simulation Engine**: Powered by Google's **Gemini 3.1 Pro**, the app generates realistic, contextual urban impact assessments based on user inputs.
- **Side-by-Side Comparison**: Compare multiple urban planning scenarios simultaneously using interactive dual radar charts and metric-by-metric breakdowns.
- **Scenario History**: All simulations are saved to a PostgreSQL database, allowing users to revisit past ideas and track urban evolution.
- **Authentication**: Secure login system powered by NextAuth.js.
- **Beautiful UI**: Built with Tailwind CSS v4, Framer Motion animations, and Shadcn UI components for a premium, glassmorphic aesthetic.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: PostgreSQL (hosted on [Neon](https://neon.tech/))
- **ORM**: [Prisma v7](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Mapping**: [React-Leaflet](https://react-leaflet.js.org/) & Leaflet
- **Data Visualization**: [Recharts](https://recharts.org/)
- **AI Integration**: `@google/genai` (Gemini API)

---

## 💻 Local Development Setup

Follow these steps to run UrbanVerse AI on your local machine.

### 1. Clone the repository
```bash
git clone https://github.com/CHSHAKISH/UrbanVerse-AI.git
cd UrbanVerse-AI
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root of the project and add the following keys:
```env
# Your PostgreSQL connection string (Local Docker or Neon)
DATABASE_URL="postgresql://user:password@localhost:5432/urbanverse?schema=public"

# Generate a random 32-character string (e.g. run `openssl rand -base64 32`)
NEXTAUTH_SECRET="your-super-secret-key"

# Required for local NextAuth development
NEXTAUTH_URL="http://localhost:3000"

# Your Google Gemini API Key
GEMINI_API_KEY="your-gemini-api-key"
```

### 4. Setup the Database
Push the Prisma schema to your database to create the required tables, and then run the seed script to populate the initial Map Zones and the Demo Admin user.
```bash
npx prisma db push
npm run build # This will run postinstall and seed automatically based on package.json
# OR manually run:
# npx prisma generate
# npx prisma db seed
```

*Note: The default demo user created by the seed script is `admin@urbanverse.ai` with the password `password123`.*

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Production Deployment (Vercel)

UrbanVerse AI is optimized for deployment on Vercel.

1. Create a PostgreSQL database on **Neon.tech** and copy the connection string.
2. Push this repository to GitHub.
3. Import the project into **Vercel**.
4. In the Vercel deployment settings, add the following Environment Variables:
   - `DATABASE_URL` (Your Neon connection string)
   - `GEMINI_API_KEY`
   - `NEXTAUTH_SECRET` (A strong random string)
   *(Note: `NEXTAUTH_URL` is not required on Vercel).*
5. Click **Deploy**. 

Vercel will automatically run `npm install`, then trigger our custom build script (`prisma generate && prisma db push && prisma db seed && next build`), which will set up your production database tables and insert the default map zones!

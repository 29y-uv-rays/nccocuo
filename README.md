# NCC Digital Bomb Defusal System

A production-ready web application for NCC scavenger hunt events where teams solve physical clues and enter passwords to defuse a digital bomb.

## Features

- **Real-time Countdown Timer**: Precision timer with 4 decimal places (MM:SS.MMMM)
- **Team Management**: Add/remove teams with unique passwords
- **Live Leaderboard**: Real-time rankings updated every 2 seconds
- **Admin Control Panel**: Complete system control with timer management
- **Explosion Mode**: Full-screen explosion animation when timer reaches zero
- **Military Terminal Theme**: Hacker-style UI with CRT effects and animations
- **Mobile-First Design**: Responsive layout optimized for all devices
- **SQLite Database**: Local file-based database with Prisma ORM
- **Polling Updates**: 2-second interval updates (no WebSockets)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: SQLite
- **ORM**: Prisma
- **Deployment**: Render-compatible

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd ncc-bomb-defusal
   npm install
   ```

2. **Setup database**:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

### Environment variables

Before running the app, copy `.env.example` to `.env` and fill in your secrets (do not commit `.env`):

```bash
# macOS / Linux
cp .env.example .env

# Windows (PowerShell)
copy .env.example .env
```

- `DATABASE_URL`: runtime connection (use Supabase pooler for ORM)
- `DIRECT_URL`: direct DB connection used for migrations
- `ADMIN_PASSWORD`: admin panel password

Use your hosting provider or Git server secrets (e.g., GitHub Actions secrets) to store production credentials instead of committing `.env`.

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open application**:
   Navigate to `http://localhost:3000`

### Default Setup

- Timer starts at 30 minutes (configurable in admin panel)
- No groups registered initially
- Admin panel accessible at `/admin`
- Leaderboard always accessible at `/leaderboard`

## Usage Guide

### For Administrators

1. **Access Admin Panel**: Go to `/admin`
2. **Add Groups**: Enter team names and passwords
3. **Set Timer Duration**: Adjust minutes as needed
4. **Start Timer**: Click "START TIMER" (cannot be undone)
5. **Monitor Progress**: View real-time updates on leaderboard
6. **Reset System**: Use "RESET SYSTEM" to clear all data

### For Teams

1. **Find Your Team**: Locate your team button on the home page
2. **Enter Password**: Click your team and enter the password from physical clues
3. **Defuse Bomb**: Submit correct password to stop your timer
4. **View Ranking**: Check your position on the success page or leaderboard

### Game Flow

1. Admin sets up teams and timer duration
2. Admin starts the global countdown timer
3. Teams solve physical clues to get passwords
4. Teams enter passwords on their group pages
5. System records defusal time and calculates rankings
6. If timer reaches zero, explosion mode activates
7. Only leaderboard remains accessible after explosion

## Project Structure

```
ncc-bomb-defusal/
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   │   ├── timer/    # Timer control
│   │   │   ├── groups/   # Group management
│   │   │   ├── defuse/   # Password submission
│   │   │   └── leaderboard/ # Rankings
│   │   ├── admin/        # Admin control panel
│   │   ├── group/[id]/   # Team pages
│   │   ├── success/      # Defusal success page
│   │   ├── leaderboard/  # Live rankings
│   │   ├── explosion/    # Explosion screen
│   │   └── page.tsx      # Home page
│   ├── components/
│   │   ├── TimerDisplay.tsx
│   │   ├── AudioManager.tsx
│   │   └── SoundButton.tsx
│   ├── hooks/
│   │   └── useAudio.ts
│   ├── lib/
│   │   └── prisma.ts     # Database client
│   └── app/
│       └── globals.css   # Military terminal styling
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── public/
│   └── sounds/           # Audio files
└── README.md
```

## Database Schema

### EventState
- Timer duration and start time
- Started/exploded status flags

### Group
- Team information and passwords
- Relationship to defusal records

### DefusalRecord
- Successful defusal attempts
- Time taken and timestamps

## API Endpoints

- `GET /api/timer` - Get current timer state
- `POST /api/timer` - Start timer or update duration
- `DELETE /api/timer` - Reset entire system
- `GET /api/groups` - List all groups
- `POST /api/groups` - Add new group
- `DELETE /api/groups` - Delete group
- `POST /api/defuse` - Submit password for defusal
- `GET /api/leaderboard` - Get current rankings

## Deployment on Render

### Prerequisites

- Render account
- GitHub repository with code

### Step-by-Step Deployment

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push origin main
   ```

2. **Create New Web Service on Render**:
   - Go to Render Dashboard
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select repository: `ncc-bomb-defusal`

3. **Configure Build Settings**:
   ```
   Build Command: npm install && npx prisma migrate deploy && npx prisma generate
   Start Command: npm start
   ```

4. **Environment Variables**:
   ```
   NODE_ENV: production
   DATABASE_URL: file:./dev.db
   ```

5. **Advanced Settings**:
   - Instance Type: Free (or Standard for better performance)
   - Auto-Deploy: Yes (for updates)
   - Health Check Path: `/api/timer`

6. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment to complete

### Post-Deployment Setup

1. **Initialize Database**:
   - Once deployed, visit `/admin` to set up initial groups
   - The database will be created automatically on first run

2. **Test Functionality**:
   - Verify timer controls work
   - Test group creation and password submission
   - Check leaderboard updates

3. **Persistent Storage**:
   - Render's file system persists the SQLite database
   - Data survives deployments and restarts

### Important Notes for Render

- **Free Tier Limitations**: May have cold starts (30-60 seconds)
- **Database Persistence**: SQLite file persists in Render's file system
- **Performance**: Upgrade to Standard instance for better response times
- **SSL**: Automatic HTTPS provided by Render

## Development

### Adding New Features

1. **Database Changes**:
   ```bash
   npx prisma migrate dev --name feature-name
   npx prisma generate
   ```

2. **Styling**:
   - Military terminal theme in `globals.css`
   - Custom animations for CRT effects
   - Responsive design with Tailwind

3. **Audio**:
   - Web Audio API for sound effects
   - Background music loops
   - No external audio files required

### Testing

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Troubleshooting

### Common Issues

1. **Database Not Found**:
   - Run `npx prisma migrate dev`
   - Ensure `prisma/dev.db` file exists

2. **Timer Not Syncing**:
   - Check browser console for errors
   - Verify API endpoints are accessible
   - Ensure polling is working (2-second intervals)

3. **Styling Issues**:
   - Clear browser cache
   - Check TailwindCSS compilation
   - Verify CSS animations are loading

4. **Deployment Issues**:
   - Check Render build logs
   - Verify environment variables
   - Ensure database migrations run on deploy

### Performance Optimization

- Limited to 10 concurrent devices as specified
- Polling interval set to 2 seconds
- Minimal API payload sizes
- Optimized animations and transitions

## Security Considerations

- No authentication system (as specified)
- Passwords stored in plain text (for event simplicity)
- Admin panel accessible to all users
- Suitable for controlled event environments

## License

MIT License - Feel free to modify and distribute for NCC events.

## Support

For issues and questions:
1. Check this README
2. Review the codebase
3. Test API endpoints individually
4. Verify database connection

---

**Built with ❤️ for NCC Scavenger Hunts**

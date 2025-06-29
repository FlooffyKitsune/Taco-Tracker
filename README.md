# 🌮 Taco Tracker

A **gamified social taco tracking application** built with SvelteKit, featuring Discord authentication, real-time multi-user sessions, achievements system, and cloud-powered taco analytics.

## ✨ Features

### 🧮 **Smart Taco Calculator**
- **Dynamic Taco Types**: Load from database with 12+ unique varieties
- **Group Optimization**: Calculate optimal quantities for any group size (1-50 people)
- **Buy 2 Get 1 Free Logic**: Automatically optimizes orders for maximum deal value
- **Custom Distribution**: Personalize taco ratios based on preferences
- **Real-time Calculation**: Instant order summaries with total quantities

### 👥 **Social & Multi-User Features**
- **Discord Authentication**: Seamless sign-in with Discord OAuth
- **User Management**: Track multiple users and their taco histories
- **Participant Selection**: Choose who's joining your taco session
- **Social Sessions**: Create shared taco orders with friends
- **User Profiles**: View taco consumption stats and achievements

### 📊 **Consumption Tracking**
- **Individual Logging**: Track who ate what and when
- **Session Management**: Organize consumption by taco sessions
- **Historical Data**: View past orders and consumption patterns
- **Real-time Updates**: Live tracking across all participants

### 🏆 **Gamification & Achievements**
- **Achievement System**: Unlock badges for taco milestones
- **Progress Tracking**: Monitor personal and group statistics
- **Leaderboards**: See who's the ultimate taco champion
- **Visual Celebrations**: Taco rain animations for order completion

### 📈 **Analytics Dashboard**
- **Consumption Statistics**: Detailed breakdowns by user and type
- **Favorite Analysis**: Discover most popular taco varieties
- **Trend Visualization**: Track consumption patterns over time
- **Group Insights**: Compare performance across different sessions

### 🎨 **Premium UI/UX**
- **Immersive Design**: Parallax backgrounds with floating geometric shapes
- **3D Card Effects**: Glass-morphism design with backdrop blur
- **Responsive Layout**: Perfect on desktop, tablet, and mobile
- **Theme Consistency**: Taco-inspired color palette throughout
- **Smooth Animations**: Transitions and micro-interactions

## 🌮 Available Taco Types

Our database includes **12 delicious varieties**:

- 🌶️ **Al Pastor** - Traditional spit-grilled pork
- 🥩 **Carne Asada** - Grilled beef classic  
- 🌶️ **Chorizo** - Spicy Mexican sausage
- 🥩 **Barbacoa** - Slow-cooked beef
- 🐷 **Carnitas** - Tender braised pork
- 🐟 **Fish** - Fresh seafood option
- 👅 **Lengua** - Traditional beef tongue
- 🍤 **Shrimp** - Coastal favorite
- 🧀 **Quesabirria** - Cheese-filled birria
- 🥬 **Vegetariano** - Plant-based option
- 🌱 **Beyond** - Modern meat alternative
- � **Mixed** - Chef's combination

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/taco-tracker.git
cd taco-tracker

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase and Discord credentials

# Run database migrations
npx prisma migrate dev

# Seed the database
npm run seed

# Start development server
npm run dev

# Open http://localhost:5173
```

## 🛠️ Tech Stack

### **Frontend**
- **SvelteKit** - Modern web framework with SSR
- **TypeScript** - Full type safety throughout
- **Tailwind CSS** - Utility-first styling with custom theme
- **Vite** - Lightning-fast build tool and dev server

### **Backend & Database**
- **Supabase** - PostgreSQL cloud database with real-time features
- **Prisma** - Type-safe database ORM with migrations
- **Auth.js (NextAuth)** - Authentication with Discord provider
- **API Routes** - RESTful endpoints for all operations

### **Authentication & Social**
- **Discord OAuth** - Secure social authentication
- **Session Management** - Persistent user sessions
- **User Profiles** - Rich user data with statistics

### **Deployment & DevOps**
- **Vercel Ready** - Optimized for easy deployment
- **Environment Configuration** - Secure credential management
- **Developer Tools** - Debug mode for development accounts

## 📱 Usage Guide

### 🧮 **Calculator Tab**
1. **Select Participants**: Choose who's joining your taco session
2. **Adjust Quantities**: Use +/- buttons to set people count
3. **Customize Distribution**: Modify taco type ratios to taste
4. **Add Taco Types**: Select from available varieties
5. **Review Order**: Check the optimized order summary
6. **Place Order**: Create session and celebrate with taco rain! 🌮🎉

### 📊 **Tracker Tab**
1. **Select Session**: Choose from your recent taco orders
2. **Log Consumption**: Record who ate which tacos
3. **Real-time Updates**: See consumption progress instantly
4. **Achievement Unlocks**: Get notified of new badges

### 📈 **Stats Tab**
1. **Personal Statistics**: View your taco consumption history
2. **Favorite Analysis**: Discover your preferred varieties
3. **Achievement Progress**: Track your taco milestones
4. **Group Comparisons**: See how you stack up

### 🏆 **Achievements Tab**
- **Browse Badges**: View all available achievements
- **Track Progress**: See completion status for each
- **Unlock Celebrations**: Get visual rewards for milestones

### 👑 **Leaderboard Tab**
- **Global Rankings**: See top taco consumers
- **Category Leaders**: Champions in different metrics
- **Social Competition**: Friendly rivalry with friends

## 🔧 Development

### **Environment Setup**
```bash
# Required environment variables
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
DATABASE_URL=your_postgres_connection_string
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
AUTH_SECRET=your_auth_secret
```

### **Database Operations**
```bash
# Reset database
npx prisma migrate reset

# Apply migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# View database
npx prisma studio
```

### **Debug Mode**
Developer accounts get access to debug information in development mode. Add usernames to `src/lib/debug.ts` to enable debug features.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Taco Tuesday Community** - For the inspiration
- **Supabase** - For the incredible backend platform
- **Discord** - For seamless authentication
- **SvelteKit Team** - For the amazing framework
- **All Taco Enthusiasts** - For making this project worthwhile

---

**Built with ❤️ and lots of 🌮 by VulpineStudio**

*Perfect for groups who want to optimize their Taco Tuesday orders, track consumption, and gamify their taco experience!*

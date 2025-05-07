# 📊 Social Media Dashboard

In the fragmented world of social media, managing multiple platforms with disconnected data makes it difficult for businesses and influencers to track performance and extract insights. This project solves that by offering a unified, intelligent dashboard solution.

**Industry:** Technology  
**Developer:** Kareem  
**Completion Date:** 4/12/2025  
**Trello Board:** [Social Dashboard Trello](https://trello.com/b/tctMaHzw/social-dashboard)  
**Live Demo:** *[Coming Soon]*

---

## 🧩 Business Problem

### 📝 Problem Statement  
In today's digital landscape, influencers and businesses often manage multiple social media accounts across different platforms, each with its own analytics and engagement metrics. This fragmented system makes it challenging to get a clear, unified view of performance. Users must manually collect and analyze data from various dashboards, which is time-consuming and prone to error. Without centralized insights, it's difficult to optimize content strategies, track growth effectively, or make informed decisions.

### 🎯 Target Users  
The primary users are **influencers** who manage multiple social media platforms and rely on consistent engagement and growth metrics.

### 🛠️ Current Solution  
The current solution is a website that connects to your social media accounts and visually displays the latest data every 5 minutes.

### ⚠️ Limitations  
- API calls are limited to every 5 minutes to avoid excessive charges.  
- API integration is still in progress; this version uses randomized dummy data as a placeholder.

---

## 🚀 Project Overview

This dashboard aims to bring clarity and actionable insight to content creators and businesses by offering:

- 🔄 Real-time analytics from multiple platforms  
- 📈 Interactive, customizable data visualizations  
- 🤖 AI-generated content recommendations  
- 📊 Centralized performance dashboards

---

## 🔧 Tech Stack

| Frontend         | Backend            | Database | Authentication | AI & APIs   |
|------------------|--------------------|----------|------------------|-------------|
| Next.js + React  | Node.js + Express  | MongoDB  | next-auth.js      | Soon  |

### Additional Tools:
- 🎨 Tailwind CSS for responsive design  
- 📊 Recharts for elegant data visualization  
- ☁️ Vercel for streamlined deployment  

---

## 📁 Project Structure

```
social-dashboard/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── profile/      # User profile endpoints
│   │   └── social-stats/ # Social media stats endpoints
│   ├── components/       # React components
│   ├── context/         # React context providers
│   └── public/          # Static assets
├── lib/                  # Utility functions and configurations
├── scripts/             # Database seeding and utility scripts
└── .env.local          # Environment variables (create this file)
```

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/social-dashboard.git
   cd social-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   next-auth_SECRET=your_nextauth_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. **Initialize the database**
   ```bash
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

---

## 🛡️ License

MIT License — free to use, modify, and distribute.


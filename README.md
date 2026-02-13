# KIX RECORDS - Website & Demo Intake System

A modern music label website featuring a multi-step demo submission form with Discord webhook integration, Spotify embeds, and dynamic animations.

## Features

- **Multi-Step Form Wizard**: 5-step progressive form for demo submissions
- **Discord Integration**: Automatic webhook submissions with unique ticket IDs
- **Cooldown System**: 1-hour cooldown between submissions with persistent storage
- **Success Popup**: Animated success modal with copyable ticket ID
- **Spotify Embeds**: Interactive album player modals
- **Responsive Design**: Works seamlessly on all devices
- **Professional Animations**: Smooth transitions and blue glow effects
- **Dark Theme**: Modern dark UI with excellent contrast

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express
- **Styling**: CSS with animations and responsive design
- **Integration**: Discord Webhooks, Spotify URLs
- **Hosting**: Vercel

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Discord webhook URL (for demo submissions)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Dap69420/kix-records.git
cd kix-records
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
DISCORD_WEBHOOK_URL=your_discord_webhook_url_here
```

4. Start the development server:
```bash
npm run dev
```

The site will be available at `http://localhost:3000`

## Deployment on Vercel

### Quick Deploy
1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "New Project" and import the repository
4. Add environment variables:
   - `DISCORD_WEBHOOK_URL`: Your Discord webhook URL
5. Click "Deploy"

### Environment Variables on Vercel
In Vercel project settings, add:
- **Name**: `DISCORD_WEBHOOK_URL`
- **Value**: Your Discord webhook URL

### Custom Domain
1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Update DNS records as instructed

## Project Structure

```
├── index.html           # Homepage with hero section
├── submit-demo.html     # Multi-step form page
├── server.js            # Express backend server
├── script.js            # Frontend JavaScript
├── styles.css           # Global styling
├── package.json         # Dependencies
├── vercel.json          # Vercel configuration
├── .env                 # Environment variables
└── assets/
    └── logo.png         # Logo image
```

## Features in Detail

### Multi-Step Form (5 Steps)
1. **Legal Name & Release Title** - Identifies the artist and project
2. **Artists** - Add multiple artists with optional Spotify links
3. **Demo Details** - Demo link, email, and optional message
4. **Review** - Summary of all submitted information
5. **Rights Confirmation** - Legal confirmation before submission

### Discord Webhook Integration
- Unique ticket ID generation (DEMO-XXXX-XXXX)
- Color-coded embeds for visual hierarchy
- Full artist information with Spotify links
- Automatic timestamp and footer

### Cooldown System
- 1-hour cooldown after each submission
- Stored in browser's localStorage
- Countdown timer displayed to user
- Submit button disabled during cooldown

### Success Popup
- Animated checkmark with scaling effects
- Copyable ticket ID
- Cooldown countdown display
- Smooth fade-in/slide-up animation

## Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is proprietary to KIX RECORDS.

## Contact

For support or inquiries, visit the KIX RECORDS website or contact through Discord.

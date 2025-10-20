# Roadhouse - the band

Website for the Roadhouse rock band from Wiesental, Germany.

## About

This is the official website for Roadhouse, featuring:
- Band member biographies
- Album information and streaming links
- Live tour dates
- Photo gallery
- Contact form
- Social media links

## Tech Stack

- Next.js 15
- React 18
- TypeScript
- Nodemailer (for contact form)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/laucar69/NextApp.git
cd NextApp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (optional, for contact form):

Create a `.env.local` file in the root directory with the following variables:

```env
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password
```

Note: The contact form will not work without these environment variables configured.

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:9800](http://localhost:9800) in your browser to see the website.

## Building for Production

```bash
npm run build
npm start
```

## Contact Form

The contact form sends emails to `info@roadhouse-rock.com`. To enable this functionality in production:

1. Configure the SMTP environment variables in your deployment platform (Vercel, etc.)
2. Use a reliable SMTP service (Gmail, SendGrid, etc.)

## License

Copyright © 2020 Roadhouse - the band. All rights reserved.

## Links

- Website: https://www.roadhouse-rock.com/
- Facebook: https://www.facebook.com/roadhousewiesental
- Instagram: https://www.instagram.com/roadhouse_rock/

# Tokenator Dashboard Replica

A modern, high-performance replica of the Tokenator dashboard built with Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- **Technical Dark Theme**: Deep black aesthetics with subtle borders and glassmorphism.
- **API Key Management**: Secure-looking fields for Anthropic, OpenAI, and internal keys.
- **Usage Metrics**: Animated stat cards for Used, Limit, and Remaining usage.
- **Available Models**: Interactive model selection cards with status badges.
- **Setup Guide**: Detailed 4-step accordion guide for installing and configuring Claude Code.
- **Gmail Account Generator**: A custom tool to bulk-generate Gmail account placeholders with recovery options and data export (CSV/JSON).
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop.
- **Fluid Animations**: Smooth transitions and loading states using Framer Motion.

## Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## Getting Started

### 1. Installation

```bash
# Clone the repository (if applicable)
# Navigate to the project directory
cd tokenator

# Install dependencies
npm install
```

### 2. Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### 3. Build for Production

```bash
npm run build
npm start
```

## Dashboard Usage

1. **Authentication**: Enter any string into the "Sign in with your API key" field in the header to access the dashboard.
2. **Gmail Generator**:
   - Set the number of accounts (1-50).
   - Click "Generate New Gmail Accounts".
   - View the results in the table.
   - Use "Copy All" or "Download CSV" to export the data.
3. **Setup Guide**: Follow the numbered steps to configure your environment for Tokenator.

## Disclaimer

The Gmail Account Generator is for demonstration and educational purposes only. Generating real Gmail accounts in bulk may violate Google's Terms of Service and typically requires sophisticated proxy and captcha-solving systems.

---

Built with precision by Antigravity.

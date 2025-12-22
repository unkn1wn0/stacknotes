# Stacknotes 📚

A beautiful, local-first, Notion-like note-taking application built with Next.js 15.

<!-- Need to add preview, will add later -->

## ✨ Features

- **Block-Based Editor**: Powered by [TipTap](https://tiptap.dev/), providing a fluid Notion-like writing experience.
- **Slash Commands**: Type `/` to instantly access blocks like headings, lists, todos, code blocks, and more.
- **Local Persistence**: All your notes are stored locally as JSON files in a `data/` directory. No external database required.
- **Privacy Focused**: Your data stays on your machine.
- **Beautiful Design**:
    - Clean, extensive typography using Inter, Source Serif 4, and JetBrains Mono.
    - Full Dark Mode support.
    - Smooth animations and refined UI details.
- **Next.js API Routes**: Self-contained backend logic integrated directly into the application.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Editor**: [TipTap](https://tiptap.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later

### Installation

1.  Clone the repository (or download the source):
    ```bash
    git clone https://github.com/unkn1wn/stacknotes.git
    cd stacknotes
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📁 Project Structure

```
stacknotes/
├── app/
│   ├── api/            # Local API routes for generic CRUD
│   ├── globals.css     # Global styles & Tailwind config
│   ├── layout.tsx      # Root layout w/ fonts
│   └── page.tsx        # Main application entry
├── components/         # React components
│   ├── Editor/         # Tiptap editor configuration
│   └── ...
├── data/               # Local JSON storage for notes (created on runtime)
├── stores/             # Zustand state stores
└── public/             # Static assets
```

## 📝 Usage

- **Create a Page**: Click "New Page" in the sidebar.
- **Slash Menu**: Type `/` in the editor to open the block menu.
- **Formatting**: Select text to reveal the bubble menu for bold, italic, etc.
- **Favorites**: Hover over a page in the sidebar and click the heart icon to pin it.

## Changelog
- Stacknotes 0.1: First beta version of Stacknotes, pretty minimal

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

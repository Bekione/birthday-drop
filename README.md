# 🎈 BirthdayDrop

A modern, interactive web application designed to create beautiful, collaborative digital birthday surprises.

BirthdayDrop allows organizers to effortlessly set up an event, invite friends to leave their wishes and photos on a digital board, and reveal a magical themed surprise page to the birthday person on their special day—complete with custom background music, celebratory confetti, and even an interactive blow-out-the-candles experience.

---

## ✨ Features

- **🪄 Intuitive Setup Wizard:** A step-by-step flow to create a personalized event in seconds.
- **🎨 Thematic Designs:** Beautiful, fully-responsive event themes (e.g., _Confetti Carnival_, _Midnight Stars_).
- **💌 Collaborative Wish Board:** A sharable link for friends and family to write messages anonymously or with their names.
- **🎵 Custom Background Audio:** Pre-bundled high-quality tracks, or upload a custom song via Vercel Blob.
- **🎂 Interactive Cake:** A delightful virtual cake that lets the birthday person "blow out" the candles via device microphone or click.
- **⚙️ Admin Dashboard:** A powerful control center to delete rogue wishes, manage deadlines, change event themes on the fly, and copy access links.

---

## 🛠️ Tech Stack

BirthdayDrop is built on a modern, bleeding-edge web stack:

- **Framework:** [Next.js 16](https://nextjs.org/) (React 19 / App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with Framer Motion for buttery smooth animations
- **Database:** PostgreSQL managed via [Prisma ORM](https://www.prisma.io/)
- **Storage:** [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) (for audio and image uploads)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Validation:** Zod

---

## 🚀 Getting Started

### Prerequisites

You will need **Node.js** (v18+), a running **PostgreSQL** instance, and a **Vercel Blob** read/write token.

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/bekione/birthday-drop.git
   cd birthdaydrop
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add the following keys:

   ```env
   # Prisma Database connection string (PostgreSQL)
   DATABASE_URL="postgres://user:password@localhost:5432/birthdaydrop"

   # Vercel Blob Storage Token (Required for custom audio/photo uploads)
   BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
   ```

4. **Initialize the Database:**
   Push the schema to your database and generate the Prisma Client.

   ```bash
   npm run db:push
   npm run db:generate
   ```

5. **Run the Development Server:**

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

---

## 🤝 Contributing

Contributions, issues, and feature requests are always welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

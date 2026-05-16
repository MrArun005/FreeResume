# Free Resume Builder - Project Documentation

## 1. Project Overview
**Free Resume** is a modern, client-side React application designed to help job seekers create professional, ATS-friendly resumes without any hidden costs or sign-up barriers. It focuses on privacy (local storage), speed, and design quality.

## 2. Technology Stack
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS (Custom Design System)
- **Icons:** Lucide React
- **PDF Generation:** @react-pdf/renderer, jsPDF, html2canvas
- **State Management:** React Context / Local State
- **Drag & Drop:** @dnd-kit/core
- **Animations:** CSS Keyframes & Transitions

## 3. Key Features

### 🎨 Visual Editor
- **Real-time Preview:** See changes instantly as you type.
- **Drag & Drop:** Reorder sections (Experience, Education, Skills) easily.
- **Theme Customization:** Switch between color themes (Blue, Purple, Green, etc.).
- **Dynamic Layouts:** Support for multiple template structures (Classic, Modern Grid, Sidebar, Minimal).

### 📄 Template System
- **ATS-Friendly:** Templates designed to be parsed correctly by Applicant Tracking Systems.
- **Variety:** 
  - *Professional:* Classic, Executive, Gold
  - *Creative:* Canvas, Glitch, Freeform
  - *Student:* Minimal, Leaf, Jakes

### 🛠️ Core Functionality
- **Privacy First:** All data is stored in the user's browser `localStorage`. No database, no tracking.
- **PDF Export:** High-quality, selectable text PDF generation.
- **Word Export:** Basic export to `.doc` format.
- **ATS Score Check:** Built-in analyzer to check resume keywords and formatting.

### 🚀 Performance & UX
- **Code Splitting:** Optimized build with separate chunks for PDF libraries.
- **Responsive Design:** Fully functional on mobile and desktop.
- **Interactive Hero:** "Type Your Name" demo on the landing page.

## 4. Project Structure
```
src/
├── components/
│   ├── editor/       # Form sections (Personal, Experience, etc.)
│   ├── layouts/      # Resume template designs (LayoutClassic, etc.)
│   ├── pages/        # LandingPage, AuthPage
│   ├── pdf/          # PDF document definitions
│   └── ui/           # Reusable UI components (Buttons, Modals, Logo)
├── constants/        # Static data (Templates, Design Tokens)
├── data/             # Mock data and initial state
├── utils/            # Helper functions (PDF helpers, Date formatters)
└── App.jsx           # Main application logic and routing
```

## 5. Setup & Development
1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Run Development Server:**
   ```bash
   npm run dev
   ```
3. **Build for Production:**
   ```bash
   npm run build
   ```

## 6. Future Roadmap
- [ ] User Accounts & Cloud Sync (Supabase/Firebase)
- [ ] AI-Powered Bullet Point Generator
- [ ] LinkedIn Profile Import
- [ ] Cover Letter Generator

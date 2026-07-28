\# CAP — Coding Analytics Platform



A full-stack coding judge and analytics platform that goes beyond simple pass/fail testing. CAP Detector compiles and runs student code against real test cases, uses AI to diagnose \*why\* a submission failed, tracks concept-wise mastery, and recommends what to practice next — all wrapped in a custom-built 3D visualization and gamified progress system.



\## Features



\- \*\*Multi-mode code judge\*\* — supports three distinct judging strategies:

&#x20; - Standard I/O matching (compile + run, compare stdout)

&#x20; - Sequence-of-operations judging for class-based problems (e.g. LRU Cache, LFU Cache)

&#x20; - Stream-based method judging (e.g. Find Median from Data Stream)

\- \*\*63 seeded problems\*\* spanning Arrays, Strings, Recursion, DP, Graphs, Linked Lists, Sorting, Searching, and Design patterns — including a curated set of advanced Infosys/HackWithInfy-style problems

\- \*\*AI-powered mistake analysis\*\* — failed submissions are sent to Groq's LLM API, which identifies the specific mistake pattern (e.g. "missing base case in recursion") instead of a bare verdict

\- \*\*Concept-wise performance tracking\*\* — aggregates accuracy per topic (e.g. Arrays: 80%, Graphs: 45%)

\- \*\*Personalized recommendations\*\* — detects weakest or untried concepts and suggests specific unsolved problems

\- \*\*3D progress visualization\*\* — built with Three.js, renders concept mastery as glowing interactive towers you can rotate and zoom

\- \*\*Gamification\*\* — XP, levels, and achievement badges computed from real submission history

\- \*\*Real syntax-highlighted code editor\*\* (C++ and Python) instead of a plain textarea

\- \*\*Custom cyberpunk-luxury UI\*\* — Playfair Display + Inter typography, neon accent palette, animated particle-network background



\## Tech Stack



\*\*Frontend:\*\* React (Vite), Three.js, react-simple-code-editor + Prism.js, Axios, custom CSS design system



\*\*Backend:\*\* FastAPI (Python), Uvicorn



\*\*Database:\*\* MongoDB Atlas



\*\*AI:\*\* Groq API (Llama models) for mistake pattern analysis



\*\*Judge:\*\* g++ (C++17) and Python subprocess execution, sandboxed via temp files



\## Project Structure

cap/

├── backend/

│ ├── main.py # FastAPI routes

│ ├── database.py # MongoDB connection

│ ├── judge.py # Judging logic (I/O, sequence, stream modes)

│ ├── ai\_analysis.py # Groq-powered mistake analysis

│ ├── seed\_\*.py # Problem seeding scripts

│ └── .env # API keys (not committed)

└── frontend/

└── src/

├── App.jsx # Main app + dashboard layout

├── App.css # Design system

├── CodeEditor.jsx # Syntax-highlighted editor

├── Progress3D.jsx # 3D concept mastery visualization

├── BackgroundFX.jsx # Ambient particle network background

├── BootSequence.jsx # Terminal boot animation

└── gamification.js # XP/level/achievement logic



\## Setup \& Installation



\### Prerequisites

\- Python 3.10+

\- Node.js 18+

\- g++ compiler (MinGW on Windows)

\- MongoDB Atlas account (free tier works)

\- Groq API key (free at console.groq.com)



\### Backend

```bash

cd backend

pip install fastapi uvicorn pymongo python-dotenv groq



\# Create .env with:

\# MONGO\_URI=your\_mongodb\_connection\_string

\# GROQ\_API\_KEY=your\_groq\_api\_key



uvicorn main:app --reload --port 8000

```



\### Frontend

```bash

cd frontend

npm install

npm install three react-simple-code-editor prismjs

npm run dev

```



Visit `http://localhost:5173`



\### Seeding Problems

Run the seed scripts once from the backend folder to populate the database:

```bash

python seed\_problems.py

python seed\_batch1.py

python seed\_batch2.py

python seed\_batch3.py

python seed\_batch4.py

python seed\_batch5.py

python seed\_design.py

python seed\_median.py

```



\## How the Judge Works



1\. \*\*I/O mode\*\* — code is compiled (C++) or executed (Python), fed test case input via stdin, and output is compared exactly against expected output

2\. \*\*Sequence mode\*\* — for class-based problems, a hidden driver constructs the student's class and calls its methods in a defined sequence, comparing each return value

3\. \*\*Stream mode\*\* — similar to sequence mode but tailored for stateful stream-processing classes (e.g. running median)



Verdicts: `AC` (Accepted), `WA` (Wrong Answer), `CE` (Compile Error), `RE` (Runtime Error)



\## Future Improvements



\- Support for additional languages (Java, JavaScript)

\- Multi-line output comparison for formatting-sensitive problems (e.g. Text Justification)

\- User authentication instead of free-text student IDs

\- Deployment with persistent hosting



\## Author



Built by Taneesha Rawat as a placement portfolio project.


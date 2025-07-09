# 🚀 CODEMATE - AI-Powered Code Editor

**CODEMATE** is a modern, full-stack AI-powered code editor that combines the power of Monaco Editor with advanced AI capabilities for code generation, analysis, and real-time execution. Built with React, Node.js, and Groq AI.

![CODEMATE Demo](https://img.shields.io/badge/Status-Active-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-blue)

## ✨ Features

### 🤖 **AI-Powered Code Assistance**
- **Code Generation**: Generate code from natural language prompts
- **Code Optimization**: Get AI suggestions to improve your code
- **Code Explanation**: Detailed explanations of complex algorithms
- **Complexity Analysis**: Visual time and space complexity analysis

### 💻 **Advanced Code Editor**
- **Monaco Editor**: Professional-grade code editor with syntax highlighting
- **Multi-language Support**: Python, C, C++, Java with more coming
- **Real-time Execution**: Run code with live output streaming
- **Interactive Input**: Handle user input during code execution

### 🎨 **Modern UI/UX**
- **Dark/Light Mode**: Beautiful theme switching
- **Responsive Design**: Works on desktop and mobile
- **Real-time Terminal**: Live output display with SSE
- **AI Sidebar**: Dedicated AI assistant panel

### 🔧 **Developer Experience**
- **Hot Reload**: Instant development feedback
- **TypeScript**: Full type safety
- **Tailwind CSS**: Modern styling framework
- **Docker Support**: Containerized execution for safety

## 🧠 Tech Stack

| Layer       | Stack                                 |
|-------------|----------------------------------------|
| **Frontend** | React + Vite + TypeScript + ShadCN UI |
| **Backend**  | Node.js + Express                     |
| **AI Engine**| Groq (LLaMA 3 via API)                |
| **Execution**| Docker (language-specific containers) |
| **Languages**| Python, C, C++, Java                  |

---

## 🛠️ Setup Instructions

### 🔁 Prerequisites

- ✅ [Node.js](https://nodejs.org/) (v18+ recommended)
- ✅ [Docker](https://www.docker.com/) installed & running

## 🏗️ Project Structure

```
codemate/
├── fe/                     # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── server/                # Backend Node.js application
│   ├── language-runners/  # Docker configurations
│   ├── temp/             # Temporary code files
│   ├── index.js          # Main server file
│   ├── executor.js       # Handles code exeuction using docker
│   └── package.json      # Backend dependencies
├── README.md             # This file
└── .gitignore           # Git ignore rules
```

---

## ⚙️ Quick Setup

### 🪟 For Windows

Run:

    ./setup.bat

### 🐧 For Linux/macOS

Run:

    chmod +x setup.sh
    ./setup.sh

---

## 🔑 Environment Variables

Create a `.env` file in the root directory:

    GROQ_API_KEY=your_groq_api_key_here

Frontend `.env` (auto-created):

    VITE_API_BASE_URL=http://localhost:8000

---

## 🧪 Running the App

### Backend

    cd backend
    node index.js

### Frontend

    cd fe
    npm i
    npm run dev

Visit:

    http://localhost:8080

---

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Ensure Docker Desktop is running
- Check if port 8000 is available
- Verify your Groq API key is valid

**Frontend won't connect:**
- Ensure backend is running on port 8000
- Check browser console for CORS errors
- Verify network connectivity

**Code execution fails:**
- Check Docker containers are running
- Verify language syntax is correct
- Check server logs for detailed errors

### Debug Mode
```bash
# Backend with debug logging
cd server
DEBUG=* npm start

# Frontend with verbose logging
cd fe
npm run dev -- --debug
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Monaco Editor** - Professional code editing
- **Groq AI** - Fast and reliable AI model
- **Shadcn/ui** - Beautiful component library
- **Tailwind CSS** - Utility-first styling

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/codemate/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/codemate/discussions)
- **Email**: yashbharvada4@gmail.com, kushal.desaiofficial@gmail.com

---

**Made with JOY by Yash Bharvada,Pankti Akbari,Kushal Desai**

*Star this repository if you found it helpful!* 

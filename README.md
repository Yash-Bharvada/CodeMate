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

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Monaco Editor** - Professional code editor
- **Tailwind CSS** - Utility-first CSS
- **Shadcn/ui** - Beautiful component library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Server-Sent Events (SSE)** - Real-time streaming
- **Docker** - Safe code execution
- **Groq AI** - Fast LLM for code generation

### Languages Supported
- **Python** - Full support with unbuffered output
- **C/C++** - Compiled execution
- **Java** - JVM-based execution

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Docker Desktop** (for safe code execution)
- **Groq API Key** (free at [groq.com](https://groq.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/codemate.git
   cd codemate
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   cd fe
   npm install
   
   # Backend dependencies
   cd ../server
   npm install
   ```

3. **Environment setup**
   ```bash
   # Create .env file in server directory
   cd server
   echo "GROQ_API_KEY=your_groq_api_key_here" > .env
   ```

4. **Start the application**
   ```bash
   # Terminal 1: Start backend (from server directory)
   cd server
   npm start
   
   # Terminal 2: Start frontend (from fe directory)
   cd fe
   npm run dev
   ```

5. **Open your browser**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend: [http://localhost:8000](http://localhost:8000)

## 📖 Usage Guide

### Writing Code
1. Select your programming language from the dropdown
2. Write or paste your code in the Monaco editor
3. Use the AI sidebar for assistance

### AI Features
- **Generate**: Create new code from descriptions
- **Optimize**: Improve existing code efficiency
- **Explain**: Get detailed code explanations
- **Analyze**: View complexity analysis with graphs

### Running Code
1. Click the "Run" button or press `Ctrl+Enter`
2. Watch real-time output in the terminal
3. Provide input when prompted
4. View execution results and complexity analysis

### Example Workflow
```python
# Try this Fibonacci example
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

n = int(input("Enter a number: "))
print(f"Fibonacci({n}) = {fibonacci(n)}")
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the `server/` directory:

```env
GROQ_API_KEY=your_groq_api_key_here
PORT=8000
NODE_ENV=development
```

### Docker Configuration
The backend uses Docker containers for safe code execution:
- **Python**: Unbuffered output with `-u` flag
- **C/C++**: Compiled with gcc/g++
- **Java**: JVM execution with proper classpath

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
│   └── package.json      # Backend dependencies
├── README.md             # This file
└── .gitignore           # Git ignore rules
```

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

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Add tests for new features
- Update documentation
- Use conventional commit messages

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
- **Email**: your.email@example.com

---

**Made with ❤️ by [Your Name]**

*Star this repository if you found it helpful!* 
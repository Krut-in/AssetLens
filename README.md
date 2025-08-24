# AssetLens 🏠🚗

**Professional AI-Powered Asset Valuation Platform**

AssetLens is a modern, full-stack web application that provides instant, accurate valuations for real estate properties and vehicles. Built with cutting-edge technology and featuring a world-class user interface, AssetLens delivers professional-grade asset assessment tools for individuals and businesses.

## 🌟 Features

### 🏡 Land Assessment
- **Comprehensive Property Analysis**: Get detailed property valuations using real-time data
- **Multi-County Coverage**: Supports properties across 7+ trial counties
- **Detailed Reports**: Market value, land value, improvement value, and property details
- **Instant Results**: Fast, accurate assessments in seconds

### 🚗 Vehicle Valuation
- **True Market Value™**: Professional-grade vehicle valuations
- **Multiple Value Types**: Trade-in, private party, and retail values
- **Loan Analysis**: Estimated loan amounts and payment calculations
- **Real-time Data**: Powered by MarketCheck with 84,000+ listings

### 💎 Premium Design
- **World-Class UI**: Modern, professional interface with dark theme
- **Responsive Design**: Perfect experience across all devices
- **Accessibility**: High contrast, readable design
- **Trust Elements**: Security badges and professional styling

## 🚀 Technology Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Vite** - Lightning-fast build tool
- **React Hook Form** - Form validation
- **TanStack Query** - Data fetching and caching
- **Zod** - Schema validation

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Full-stack type safety
- **tsx** - TypeScript execution

### APIs & Services
- **Regrid API** - Real estate data and property information
- **MarketCheck API** - Vehicle valuation and market data

## 📦 Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Git**

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/AssetLens.git
   cd AssetLens
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   REGRID_API_TOKEN=your_regrid_api_token_here
   PORT=3001
   NODE_ENV=development
   ```

4. **Start the development server**
   ```bash
   PORT=3001 REGRID_API_TOKEN="your_api_token" npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3001`

## 🔧 Development

### Project Structure
```
AssetLens/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   └── index.css       # Global styles
├── server/                 # Backend Express application
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   └── storage.ts         # Data storage utilities
├── shared/                # Shared TypeScript types
└── README.md
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### API Endpoints

#### Land Assessment
```http
POST /api/land-assessment
Content-Type: application/json

{
  "streetAddress": "701 Elm St",
  "city": "Dallas",
  "state": "TX"
}
```

#### Vehicle Valuation
```http
POST /api/vehicle-valuation
Content-Type: application/json

{
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "mileage": 50000,
  "zipCode": "75201"
}
```

## 🗺️ Supported Locations

### Land Assessment (Trial Counties)
- **Texas**: Dallas County
- **North Carolina**: Durham County  
- **Tennessee**: Wilson County
- **Indiana**: Marion County
- **Additional counties** available with full API access

### Vehicle Valuation
- **Nationwide coverage** across all US states

## 🔒 Security & Privacy

- **Secure API**: All data transmission encrypted
- **No Data Storage**: User inputs are not permanently stored
- **Privacy First**: No personal information collected
- **Professional Grade**: Enterprise-level security standards

## 🎨 Design Philosophy

AssetLens features a carefully crafted design system:

- **Dark Professional Theme**: Sophisticated, modern appearance
- **Blue-Green Harmony**: Blue for technology, green for trust and success
- **White Text Contrast**: Perfect readability across all elements
- **Premium Interactions**: Smooth animations and hover effects
- **Trust Building**: Green security badges and success indicators

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables (Production)
```env
REGRID_API_TOKEN=your_production_api_token
PORT=3001
NODE_ENV=production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Regrid** - Real estate data and property information
- **MarketCheck** - Vehicle market data and valuations
- **React Team** - Amazing UI library
- **Tailwind CSS** - Excellent utility-first CSS framework

## 📞 Support

For support, questions, or feature requests, please open an issue on GitHub.

---

**AssetLens** - *Professional Asset Valuation Made Simple* ✨

Built with ❤️ using modern web technologies

# Art Gallery App - React Internship Assignment

A professional React application with TypeScript that displays artwork data from the Art Institute of Chicago API with server-side pagination and persistent row selection.

## 🎨 Features

- **Professional Interface**: Clean, modern design with proper typography and spacing
- **Clear Navigation**: Intuitive header with gallery title and description
- **Server-side Pagination**: Fetches data from API per page, not all at once
- **Persistent Row Selection**: Selected rows persist when navigating between pages
- **Custom Row Selection**: Overlay panel to select custom number of rows
- **PrimeReact DataTable**: Professional data table with sorting and selection
- **TypeScript**: Full TypeScript implementation for type safety
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **PrimeReact** for UI components
- **Art Institute of Chicago API** for artwork data

## 📋 Requirements Implemented

✅ **Project Setup**
- ✅ Vite React app with TypeScript
- ✅ No JavaScript files (TypeScript only)

✅ **Data Table Implementation**
- ✅ PrimeReact DataTable component
- ✅ Fetches data from Art Institute API
- ✅ Displays all required fields: title, place_of_origin, artist_display, inscriptions, date_start, date_end

✅ **Server-Side Pagination**
- ✅ Pagination controls with PrimeReact Paginator
- ✅ Fetches data from API on page change
- ✅ No mass data storage - only current page data

✅ **Row Selection**
- ✅ Individual row selection with checkboxes
- ✅ Select/deselect all rows on current page
- ✅ Custom row selection overlay panel

✅ **Persistent Selection**
- ✅ Selected rows persist across page navigation
- ✅ Strategy-based selection without prefetching other pages
- ✅ No storage of objects/IDs from other pages

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd art-gallery-app
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173` (or the port shown in terminal)

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🌐 Deployment

This app can be deployed to:
- ✅ Netlify
- ✅ Cloudflare Pages
- ✅ Any other cloud provider
- ❌ NOT Vercel (as per assignment requirements)

### Netlify Deployment

1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Or connect your GitHub repository to Netlify for automatic deployments

## 📊 API Integration

The app integrates with the Art Institute of Chicago API:
- **Endpoint**: `https://api.artic.edu/api/v1/artworks?page={page}`
- **Method**: GET
- **Response**: JSON with artwork data and pagination info

## 🔧 Key Implementation Details

### Persistent Selection Strategy

The app implements a smart selection strategy that:
- Tracks selected/deselected row IDs using Sets
- Maintains selection state across page navigation
- Calculates custom selections without fetching other pages
- Uses row ID patterns to determine selection ranges

### Custom Row Selection

The overlay panel allows users to:
- Enter a custom number of rows to select
- Automatically calculates which rows to select based on current data patterns
- Maintains performance by not prefetching data from other pages

## 📁 Project Structure

```
art-gallery-app/
├── src/
│   ├── App.tsx          # Main application component
│   ├── types.ts         # TypeScript interfaces
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles with PrimeReact theme
├── public/              # Static assets
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

## 🎯 Assignment Compliance

This implementation strictly follows all assignment requirements:
- ✅ Uses Vite (not Create React App)
- ✅ TypeScript only (no JavaScript)
- ✅ PrimeReact DataTable
- ✅ Server-side pagination
- ✅ Persistent row selection
- ✅ Custom row selection overlay
- ✅ No prefetching of other pages
- ✅ Strategy-based selection handling

## 🐛 Troubleshooting

If you encounter any issues:

1. **Port already in use**: The dev server will automatically find an available port
2. **API errors**: Check your internet connection and API endpoint availability
3. **Build errors**: Ensure all dependencies are installed with `npm install`

## 📝 License

This project is created for internship assignment purposes.
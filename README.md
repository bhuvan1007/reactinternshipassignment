# Art Institute of Chicago Gallery

A React application for browsing artwork from the Art Institute of Chicago API. This project implements a data table with server-side pagination, persistent selection, and a custom row selection feature.

## Features

- **Data Table**: Displays artwork details including title, artist, origin, and date.
- **Server-Side Pagination**: Efficiently handles large datasets by fetching data page-by-page.
- **Persistent Selection**: Row selections are maintained across page navigation.
- **Custom Row Selection**: Allows selecting a specific number of rows (e.g., the first 50) using a custom logic rule.
- **Responsive Design**: precise styling for desktop and mobile views.

## Technology Stack

- **Framework**: React (Vite)
- **Language**: TypeScript
- **UI Library**: PrimeReact (DataTable, Components)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/bhuvan1007/reactinternshipassignment.git
   ```

2. Navigate to the project directory:
   ```bash
   cd reactinternshipassignment
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

- **Select Rows**: Click checkboxes to select individual rows.
- **Pagination**: Use the horizontal pagination controls to navigate through pages.
- **Custom Selection**: Click "Custom Row Selection", enter a number, and click "Select" to automatically mark rows as selected.

## License

This project is open source and available under the MIT License.

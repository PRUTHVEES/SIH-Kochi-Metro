# Kochi Metro AI-Driven Train Induction Dashboard

A full-stack prototype web application that simulates the nightly fleet optimization process for Kochi Metro Rail Ltd. The system analyzes 25 trainsets for readiness (service, standby, maintenance) using AI-driven optimization algorithms.

## 🚀 Features

- **Real-time Fleet Monitoring**: View status of all 25 trainsets with detailed metrics
- **AI Optimization Engine**: Run nightly optimization to determine optimal train induction status
- **Interactive Dashboard**: Modern UI with cards, tables, and progress indicators
- **Status Management**: Track Ready, Standby, and Maintenance statuses
- **Responsive Design**: Works on desktop and mobile devices
- **API Integration**: RESTful backend with CORS support

## 🛠️ Technology Stack

### Frontend
- **React.js** with TypeScript
- **Tailwind CSS** for styling
- **ShadCN UI** components for consistent design
- **Vite** for fast development environment
- **Axios** for API communication
- **Lucide React** for icons

### Backend
- **Python FastAPI** serving REST API
- **Pydantic** for data validation
- **Uvicorn** ASGI server
- **CORS** enabled for frontend integration

## 📁 Project Structure

```
kochi_metro_dashboard/
├── backend/
│   ├── app.py                 # FastAPI application
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ui/           # ShadCN UI components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── SummaryCard.tsx
│   │   │   └── RakeTable.tsx
│   │   ├── pages/
│   │   │   └── Dashboard.tsx
│   │   ├── services/
│   │   │   └── api.ts        # API service layer
│   │   ├── types/
│   │   │   └── index.ts      # TypeScript type definitions
│   │   ├── lib/
│   │   │   └── utils.ts      # Utility functions
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── tsconfig.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd kochi_metro_dashboard/backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI server:
   ```bash
   uvicorn app:app --reload --host 0.0.0.0 --port 8000
   ```

   The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd kochi_metro_dashboard/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

## 📊 API Endpoints

### Backend API (http://localhost:8000)

- `GET /` - API information
- `GET /trainsets` - Get all 25 trainsets with current status
- `POST /optimize` - Run AI optimization algorithm
- `GET /health` - Health check endpoint

### Example API Response

```json
{
  "id": 1,
  "name": "Rake 01",
  "fitness_status": "Valid",
  "job_cards_open": 2,
  "branding_hours": 180,
  "mileage_km": 84500,
  "cleaning_status": "Complete",
  "stabling_position": 4,
  "status": "Ready"
}
```

## 🧠 AI Optimization Algorithm

The current implementation uses a heuristic scoring system that evaluates:

- **Fitness Status**: Valid (3.0), Pending (1.5), Expired (0.0)
- **Job Cards**: Fewer open jobs = higher score
- **Branding Hours**: More hours = better utilization
- **Mileage**: Optimal range (60,000-100,000 km) preferred
- **Cleaning Status**: Complete (2.0), In Progress (1.0), Pending (0.0)

### Future ML Integration

The system is designed to easily integrate with machine learning models:

```python
# Placeholder for future ML model integration
def calculate_optimization_score(trainset: Trainset) -> float:
    """
    Future ML model would replace this logic with:
    - Supervised learning on historical data
    - Unsupervised clustering for maintenance patterns
    - Time series forecasting for predictive maintenance
    """
    # Current heuristic implementation
    # ML model integration point
```

## 🎨 UI Components

### Dashboard Features

- **Fleet Summary Cards**: Visual overview of Ready/Standby/Maintenance counts
- **Trainsets Table**: Detailed view of all 25 trainsets with status badges
- **Optimization Panel**: Run AI optimization with progress indicators
- **Real-time Updates**: Live status updates after optimization
- **Responsive Design**: Mobile-friendly interface

### Status Badges

- 🟢 **Ready**: Green badge for trainsets ready for service
- 🟡 **Standby**: Yellow badge for standby trainsets
- 🔴 **Maintenance**: Red badge for trainsets under maintenance

## 🔧 Development

### Adding New Features

1. **Backend**: Add new endpoints in `app.py`
2. **Frontend**: Create components in `src/components/`
3. **Types**: Update TypeScript interfaces in `src/types/`
4. **API**: Extend service layer in `src/services/api.ts`

### Code Style

- **Backend**: Follow PEP 8 Python style guide
- **Frontend**: Use TypeScript strict mode
- **Components**: Functional components with hooks
- **Styling**: Tailwind CSS utility classes

## 🚀 Production Deployment

### Backend Deployment

```bash
# Install production dependencies
pip install fastapi uvicorn[standard]

# Run with production settings
uvicorn app:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend Deployment

```bash
# Build for production
npm run build

# Serve static files
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is a prototype for Kochi Metro Rail Ltd. All rights reserved.

## 🆘 Troubleshooting

### Common Issues

1. **Backend not starting**: Check if port 8000 is available
2. **Frontend can't connect**: Ensure backend is running on localhost:8000
3. **CORS errors**: Verify CORS settings in `app.py`
4. **Build errors**: Check Node.js and Python versions

### Support

For technical support or questions, please contact the development team.

---

**Note**: This is a prototype system for demonstration purposes. The optimization algorithm uses dummy data and heuristic scoring. In production, this would be replaced with real ML models trained on historical fleet data.


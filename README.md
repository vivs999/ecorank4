# EcoRank - Environmental Impact Tracking App

EcoRank is a React TypeScript application that helps users track and reduce their environmental impact through various challenges and social features. The app focuses on carbon footprint tracking, sustainable food choices, recycling habits, and water conservation.

## Features

- **Carbon Footprint Tracking**: Track your carbon emissions from transportation
- **Food Impact**: Calculate environmental impact of food choices
- **Recycling Challenges**: Track and improve recycling habits
- **Water Conservation**: Monitor shower duration and water usage
- **Social Features**:
  - Crew system for group challenges
  - Leaderboards for friendly competition
  - Achievement system
  - Progress tracking

## Tech Stack

- **Frontend**: React with TypeScript
- **State Management**: React Context API
- **Backend**: Firebase
  - Authentication
  - Firestore Database
  - Cloud Functions
- **Maps Integration**: Google Maps API
- **Styling**: SCSS with CSS Modules

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- Google Maps API key



## Project Structure

```
src/
├── components/     # Reusable UI components
├── context/       # React Context providers
├── lib/          # Firebase and other library configurations
├── pages/        # Page components
├── services/     # API and service functions
├── styles/       # Global styles and SCSS modules
├── types/        # TypeScript type definitions
└── utils/        # Utility functions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [NHTSA Vehicle API](https://vpic.nhtsa.dot.gov/api/) for vehicle data
- [Google Maps Platform](https://developers.google.com/maps) for location services
- [Firebase](https://firebase.google.com/) for backend services

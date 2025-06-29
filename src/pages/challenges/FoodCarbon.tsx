import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCarrot,
  faPlus,
  faTrash,
  faSave,
  faLeaf,
  faSearch,
  faUtensils,
  faAppleAlt,
  faHamburger,
  faCoffee,
  faSpinner,
  faPizzaSlice,
  faChartBar,
  faMinus
} from '@fortawesome/free-solid-svg-icons';
import { FoodCarbonSubmission, FoodItem } from '../../types';

// Food categories with average emissions
const foodCategories = [
  { id: 'beef', name: 'Beef', footprint: 27.0, icon: '🥩', average: 27.0 },
  { id: 'lamb', name: 'Lamb', footprint: 39.2, icon: '🍖', average: 39.2 },
  { id: 'pork', name: 'Pork', footprint: 12.1, icon: '🥓', average: 12.1 },
  { id: 'chicken', name: 'Chicken', footprint: 6.9, icon: '🍗', average: 6.9 },
  { id: 'fish', name: 'Fish & Seafood', footprint: 6.1, icon: '🐟', average: 6.1 },
  { id: 'dairy', name: 'Dairy', footprint: 6.0, icon: '🧀', average: 6.0 },
  { id: 'eggs', name: 'Eggs', footprint: 4.8, icon: '🥚', average: 4.8 },
  { id: 'rice', name: 'Rice', footprint: 4.0, icon: '🍚', average: 4.0 },
  { id: 'grains', name: 'Other Grains', footprint: 2.7, icon: '🌾', average: 2.7 },
  { id: 'vegetables', name: 'Vegetables', footprint: 2.0, icon: '🥦', average: 2.0 },
  { id: 'fruits', name: 'Fruits', footprint: 1.1, icon: '🍎', average: 1.1 },
  { id: 'nuts', name: 'Nuts & Seeds', footprint: 2.3, icon: '🥜', average: 2.3 },
  { id: 'legumes', name: 'Legumes', footprint: 2.0, icon: '🫘', average: 2.0 },
  { id: 'sweets', name: 'Sweets & Desserts', footprint: 3.5, icon: '🍰', average: 3.5 },
  { id: 'beverages', name: 'Beverages', footprint: 1.8, icon: '🥤', average: 1.8 }
];

// Meal types
const mealTypes = [
  { id: 'breakfast', name: 'Breakfast', icon: faCoffee },
  { id: 'lunch', name: 'Lunch', icon: faHamburger },
  { id: 'dinner', name: 'Dinner', icon: faPizzaSlice },
  { id: 'snack', name: 'Snack', icon: faAppleAlt }
];

// Interface for food items
interface SearchResult {
  id: string;
  name: string;
  carbonFootprint: number;
}

const FoodCarbon: React.FC = () => {
  // Food tracking
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedFood, setSelectedFood] = useState<SearchResult | null>(null);
  const [portion, setPortion] = useState(1);
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  
  // API interaction
  const [searching, setSearching] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // UI state
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewByMeal, setViewByMeal] = useState(false);
  
  const { submitFoodCarbon } = useApp();
  const navigate = useNavigate();
  
  // Search for foods using API
  const searchFoods = useCallback(async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) return;
    
    try {
      setSearching(true);
      setError(null);
      
      // In production, use a real API like:
      // - OpenFoodFacts API
      // - Nutritionix API
      // - Spoonacular API
      // - USDA FoodData Central API
      
      // Simulate API call with predetermined results
      setTimeout(() => {
        const query = searchQuery.toLowerCase();
        let results = [];
        
        // Generate results based on search
        if (query.includes('beef') || query.includes('steak') || query.includes('burger')) {
          results = [
            { id: 'beef-ground', name: 'Ground Beef', footprint: 27.0 },
            { id: 'beef-steak', name: 'Beef Steak', footprint: 29.5 },
            { id: 'burger', name: 'Hamburger', footprint: 25.0 }
          ];
        } else if (query.includes('chicken')) {
          results = [
            { id: 'chicken-breast', name: 'Chicken Breast', footprint: 5.8 },
            { id: 'chicken-thigh', name: 'Chicken Thigh', footprint: 6.2 },
            { id: 'chicken-wing', name: 'Chicken Wings', footprint: 7.1 }
          ];
        } else if (query.includes('salad') || query.includes('vegetable')) {
          results = [
            { id: 'salad-garden', name: 'Garden Salad', footprint: 1.3 },
            { id: 'vegetables-mixed', name: 'Mixed Vegetables', footprint: 1.6 },
            { id: 'salad-caesar', name: 'Caesar Salad', footprint: 2.5 }
          ];
        } else if (query.includes('rice')) {
          results = [
            { id: 'rice-white', name: 'White Rice', footprint: 4.2 },
            { id: 'rice-brown', name: 'Brown Rice', footprint: 3.8 },
            { id: 'rice-fried', name: 'Fried Rice', footprint: 5.4 }
          ];
        } else if (query.includes('fruit') || query.includes('apple') || query.includes('banana')) {
          results = [
            { id: 'apple', name: 'Apple', footprint: 0.8 },
            { id: 'banana', name: 'Banana', footprint: 1.1 },
            { id: 'orange', name: 'Orange', footprint: 0.7 }
          ];
        } else {
          // Generate some random results
          const randomCategory = foodCategories[Math.floor(Math.random() * foodCategories.length)];
          results = [
            { 
              id: `${randomCategory.id}-1`, 
              name: `${searchQuery} (${randomCategory.name})`, 
              footprint: randomCategory.footprint * (0.8 + Math.random() * 0.4) // +/- 20% of average
            }
          ];
        }
        
        setSearchResults(results.map(result => ({
          id: result.id,
          name: result.name,
          carbonFootprint: result.footprint
        })));
        setSearching(false);
      }, 600);
      
      // Example real API call:
      // const response = await axios.get(`https://api.example.com/food-carbon?search=${encodeURIComponent(searchQuery)}`);
      // setSearchResults(response.data.items);
      
    } catch (err) {
      console.error('Error searching foods:', err);
      setError('Failed to search for foods');
      setSearching(false);
    }
  }, [searchQuery]);
  
  // Fetch details for selected food
  const getFoodDetails = async (food: SearchResult) => {
    try {
      setLoadingDetails(true);
      setSelectedFood(food);
      
      // In a real app, you would fetch additional details here
      
      // Simulate API call delay
      setTimeout(() => {
        setLoadingDetails(false);
      }, 300);
      
    } catch (err) {
      console.error('Error fetching food details:', err);
      setError('Failed to load food details');
      setLoadingDetails(false);
    }
  };
  
  // Add food item to log
  const addFoodItem = () => {
    if (!selectedFood) {
      setError('Please select a food item');
      return;
    }
    
    if (portion <= 0) {
      setError('Please enter a valid portion size');
      return;
    }
    
    const mealType = mealTypes.find(m => m.id === selectedMealType);
    const currentDate = new Date();
    
    const newItem: FoodItem = {
      id: selectedFood.id,
      name: `${selectedFood.name} ${mealType?.name || 'Meal'} ${currentDate.toISOString()}`,
      quantity: portion,
      carbonFootprint: selectedFood.carbonFootprint * portion,
      type: 'food'
    };
    
    setFoodItems([...foodItems, newItem]);
    
    // Reset form
    setSelectedFood(null);
    setSearchResults([]);
    setSearchQuery('');
    setPortion(1);
    setSelectedMealType('breakfast');
    setError(null);
  };
  
  // Remove a food item
  const removeFoodItem = (index: number) => {
    setFoodItems(foodItems.filter((_, i) => i !== index));
  };
  
  // Calculate total carbon footprint
  const calculateTotalFootprint = () => {
    return foodItems.reduce((total, item) => total + item.carbonFootprint, 0);
  };
  
  // Calculate scores based on total footprint
  const calculateScore = () => {
    // Higher score for lower footprint (up to 20kg baseline)
    // Score calculation: (20 - footprint) * 5, capped between 0-100
    return Math.min(100, Math.max(0, 20 - calculateTotalFootprint()) * 5);
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get comparison to average for a food item
  const getComparisonToAverage = (item: FoodItem) => {
    const category = foodCategories.find(cat => cat.id === item.name.split(' ')[0]);
    if (!category) return 0;
    
    // Calculate percentage difference from average
    // Normalized by portion size
    const normalizedFootprint = item.carbonFootprint / item.quantity;
    const percentDiff = ((normalizedFootprint - category.average) / category.average) * 100;
    return percentDiff;
  };
  
  // Group food items by meal type
  const groupByMeal = () => {
    const meals: { [key: string]: FoodItem[] } = {};
    
    mealTypes.forEach(meal => {
      meals[meal.id] = foodItems.filter(item => {
        const nameParts = item.name.split(' ');
        return nameParts.includes(meal.name);
      });
    });
    
    return meals;
  };
  
  // Calculate footprint by meal
  const calculateFootprintByMeal = (mealId: string) => {
    const meal = mealTypes.find(m => m.id === mealId);
    if (!meal) return 0;
    
    return foodItems
      .filter(item => {
        const nameParts = item.name.split(' ');
        return nameParts.includes(meal.name);
      })
      .reduce((total, item) => total + item.carbonFootprint, 0);
  };

  // Trigger search on query change
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchFoods();
      }
    }, 500);
    
    return () => clearTimeout(delaySearch);
  }, [searchQuery, searchFoods]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (foodItems.length === 0) {
      return setError('Please add at least one food item');
    }
    
    try {
      setError(null);
      setLoading(true);
      
      const totalFootprint = calculateTotalFootprint();
      
      const submission: FoodCarbonSubmission = {
        id: '',
        userId: '',
        challengeId: '',
        crewId: '',
        date: new Date(),
        foodItems: foodItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          carbonFootprint: item.carbonFootprint,
          type: item.type
        })),
        totalCarbonFootprint: totalFootprint,
        score: calculateScore()
      };
      
      await submitFoodCarbon(submission);
      setSubmitted(true);
      
    } catch (err) {
      setError('Failed to submit food carbon data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (submitted) {
    return (
      <div className="container py-4">
        <div className="card">
          <div className="card-body text-center">
            <FontAwesomeIcon icon={faCarrot} className="text-success" size="4x" />
            <h2 className="mt-3">Challenge Completed!</h2>
            
            <div className="row justify-content-center mt-4">
              <div className="col-md-6">
                <div className="card mb-4">
                  <div className="card-body">
                    <p className="lead mb-0">
                      Carbon Footprint: <strong>{calculateTotalFootprint().toFixed(2)} kg CO₂</strong>
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card mb-4">
                  <div className="card-body">
                    <p className="lead mb-0">
                      Your Score: <strong>{calculateScore()} points</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Food Carbon Footprint by Meal</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {mealTypes.map(meal => {
                    const footprint = calculateFootprintByMeal(meal.id);
                    const mealItems = foodItems.filter(item => {
                      const nameParts = item.name.split(' ');
                      return nameParts.includes(meal.name);
                    });
                    
                    return mealItems.length > 0 ? (
                      <div key={meal.id} className="col-md-6 col-lg-3 mb-3">
                        <div className="card h-100">
                          <div className="card-header">
                            <h6 className="mb-0">
                              <FontAwesomeIcon icon={meal.icon} className="me-2" />
                              {meal.name}
                            </h6>
                          </div>
                          <div className="card-body">
                            <p className="text-center mb-2">
                              <strong>{footprint.toFixed(2)} kg CO₂</strong>
                            </p>
                            <ul className="list-group list-group-flush small">
                              {mealItems.slice(0, 3).map((item, index) => (
                                <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                  <div>
                                    {item.name.split(' ')[0]} 
                                    {item.quantity !== 1 && <small> ({item.quantity}x)</small>}
                                  </div>
                                  <span className={
                                    item.carbonFootprint > 10 ? "badge bg-danger" :
                                    item.carbonFootprint > 5 ? "badge bg-warning text-dark" :
                                    "badge bg-success"
                                  }>
                                    {item.carbonFootprint.toFixed(1)} kg
                                  </span>
                                </li>
                              ))}
                              {mealItems.length > 3 && (
                                <li className="list-group-item text-muted text-center">
                                  + {mealItems.length - 3} more items
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
            
            <div className="alert alert-success mt-3">
              <p className="mb-0">
                {calculateScore() > 80 ? 
                  "Amazing! Your food choices are incredibly sustainable and climate-friendly!" : 
                  calculateScore() > 50 ?
                  "Great job! Your diet has a significantly lower carbon footprint than average!" :
                  calculateScore() > 20 ?
                  "Good start! Consider incorporating more plant-based foods to reduce your footprint further." :
                  "Thanks for participating! Try choosing more plant-based options next time to reduce your footprint."}
              </p>
            </div>
            
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Sustainable Eating Tips</h5>
              </div>
              <div className="card-body text-start">
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex">
                    <div className="me-3 fs-5">🌱</div>
                    <div>Try incorporating more plant-based meals into your diet</div>
                  </li>
                  <li className="list-group-item d-flex">
                    <div className="me-3 fs-5">🥦</div>
                    <div>Choose locally grown, seasonal produce when possible</div>
                  </li>
                  <li className="list-group-item d-flex">
                    <div className="me-3 fs-5">🐄</div>
                    <div>Reduce red meat consumption for the biggest climate impact</div>
                  </li>
                  <li className="list-group-item d-flex">
                    <div className="me-3 fs-5">🥘</div>
                    <div>Plan meals to reduce food waste and save money</div>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="d-grid gap-2 d-md-block mt-4">
              <button 
                className="btn btn-eco btn-lg me-md-2" 
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </button>
              <button 
                className="btn btn-outline-eco btn-lg" 
                onClick={() => navigate('/leaderboard')}
              >
                View Leaderboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-4">
      <div className="card mb-4">
        <div className="card-body">
          <h2>Food Carbon Footprint Challenge</h2>
          <p className="lead">
            Track the environmental impact of each meal you eat. Lower carbon footprint earns more points!
          </p>
          
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Add Food Item
                </h5>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <label className="form-label">Food Search</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FontAwesomeIcon icon={faSearch} />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search for food items (e.g., chicken, apple)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    {searching && (
                      <div className="text-center py-3">
                        <FontAwesomeIcon icon={faSpinner} spin />
                        <span className="ms-2">Searching...</span>
                      </div>
                    )}
                    {searchResults.length > 0 && (
                      <div className="list-group mt-2">
                        {searchResults.map((food, index) => (
                          <button
                            key={index}
                            type="button"
                            className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                              selectedFood && selectedFood.id === food.id ? 'active' : ''
                            }`}
                            onClick={() => getFoodDetails(food)}
                          >
                            <div>
                              <div>{food.name}</div>
                              <div>
                                <small>
                                  {foodCategories.find(cat => cat.id === food.name.split(' ')[0])?.icon || '🍽️'} 
                                  {' '}
                                  {foodCategories.find(cat => cat.id === food.name.split(' ')[0])?.name || 'Food'}
                                </small>
                              </div>
                            </div>
                            <span className={`badge ${
                              food.carbonFootprint > 10 ? 'bg-danger' : 
                              food.carbonFootprint > 5 ? 'bg-warning text-dark' : 
                              'bg-success'
                            }`}>
                              {food.carbonFootprint.toFixed(2)} kg CO₂
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="col-md-6">
                    <div className="card h-100">
                      <div className="card-body">
                        {loadingDetails ? (
                          <div className="text-center py-4">
                            <FontAwesomeIcon icon={faSpinner} spin size="2x" className="mb-3" />
                            <p>Loading food details...</p>
                          </div>
                        ) : selectedFood ? (
                          <>
                            <h5 className="card-title">{selectedFood.name}</h5>
                            <p className="mb-2">
                              <span className="badge bg-info me-2">
                                {foodCategories.find(cat => cat.id === selectedFood.name.split(' ')[0])?.icon || '🍽️'} 
                                {foodCategories.find(cat => cat.id === selectedFood.name.split(' ')[0])?.name || 'Food'}
                              </span>
                              <span className={`badge ${
                                selectedFood.carbonFootprint > 10 ? 'bg-danger' : 
                                selectedFood.carbonFootprint > 5 ? 'bg-warning text-dark' : 
                                'bg-success'
                              }`}>
                                {selectedFood.carbonFootprint.toFixed(2)} kg CO₂
                              </span>
                            </p>
                            
                            <div className="row mb-3">
                              <div className="col-6">
                                <label className="form-label">Meal Type</label>
                                <select
                                  className="form-select"
                                  value={selectedMealType}
                                  onChange={(e) => {
                                    setSelectedMealType(e.target.value);
                                  }}
                                >
                                  {mealTypes.map(meal => (
                                    <option key={meal.id} value={meal.id}>
                                      {meal.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-6">
                                <label className="form-label">Portion Size</label>
                                <div className="input-group">
                                  <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => {
                                      setPortion(prev => Math.max(0.5, prev - 0.5));
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faMinus} />
                                  </button>
                                  <input
                                    type="number"
                                    className="form-control text-center"
                                    value={portion}
                                    onChange={(e) => {
                                      setPortion(parseFloat(e.target.value) || 1);
                                    }}
                                    min="0.5"
                                    step="0.5"
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => {
                                      setPortion(prev => Math.min(10, prev + 0.5));
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faPlus} />
                                  </button>
                                </div>
                                <small className="text-muted d-block mt-1">
                                  Total: {(selectedFood.carbonFootprint * portion).toFixed(2)} kg CO₂
                                </small>
                              </div>
                            </div>
                            
                            <div className="d-grid mt-3">
                              <button
                                type="button"
                                className="btn btn-eco"
                                onClick={addFoodItem}
                              >
                                <FontAwesomeIcon icon={faPlus} className="me-2" />
                                Add to Food Log
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-4">
                            <FontAwesomeIcon icon={faUtensils} size="2x" className="text-muted mb-3" />
                            <p>Search for and select a food item to add to your log.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {foodItems.length > 0 && (
              <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <FontAwesomeIcon icon={faLeaf} className="me-2" />
                    Your Food Log
                  </h5>
                  
                  <div className="btn-group">
                    <button
                      type="button"
                      className={`btn btn-sm ${!viewByMeal ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setViewByMeal(false)}
                    >
                      <FontAwesomeIcon icon={faUtensils} className="me-1" />
                      All Items
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${viewByMeal ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setViewByMeal(true)}
                    >
                      <FontAwesomeIcon icon={faChartBar} className="me-1" />
                      By Meal
                    </button>
                  </div>
                </div>
                
                {viewByMeal ? (
                  <div className="card-body">
                    <div className="row">
                      {Object.entries(groupByMeal()).map(([mealId, items]) => {
                        const meal = mealTypes.find(m => m.name === mealId)!;
                        
                        return items.length > 0 ? (
                          <div key={mealId} className="col-md-6 mb-4">
                            <div className="card h-100">
                              <div className="card-header bg-light">
                                <h6 className="mb-0">
                                  <FontAwesomeIcon icon={meal.icon} className="me-2" />
                                  {meal.name}
                                  <span className="badge bg-info ms-2">
                                    {calculateFootprintByMeal(mealId).toFixed(2)} kg CO₂
                                  </span>
                                </h6>
                              </div>
                              <div className="card-body p-0">
                                <ul className="list-group list-group-flush">
                                  {items.map((item, index) => (
                                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                      <div>
                                        <div>
                                          {item.name.split(' ')[0]}
                                          {item.quantity !== 1 && <small> ({item.quantity}x)</small>}
                                        </div>
                                        <div>
                                          <small className="text-muted">
                                            {formatDate(new Date(item.name.split(' ')[item.name.split(' ').length - 1]))}
                                          </small>
                                        </div>
                                      </div>
                                      <div className="d-flex align-items-center">
                                        <span className={`badge ${
                                          item.carbonFootprint > 10 ? 'bg-danger' : 
                                          item.carbonFootprint > 5 ? 'bg-warning text-dark' : 
                                          'bg-success'
                                        } me-2`}>
                                          {item.carbonFootprint.toFixed(1)} kg
                                        </span>
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-outline-danger"
                                          onClick={() => removeFoodItem(index)}
                                        >
                                          <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table mb-0">
                        <thead>
                          <tr>
                            <th>Food Item</th>
                            <th>Meal</th>
                            <th>Comparison</th>
                            <th>Carbon Footprint</th>
                            <th className="text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {foodItems.map((item, index) => {
                            const comparison = getComparisonToAverage(item);
                            const nameParts = item.name.split(' ');
                            const mealName = nameParts.find(part => 
                              mealTypes.some(meal => meal.name === part)
                            ) || 'Meal';
                            const meal = mealTypes.find(m => m.name === mealName) || mealTypes[0];
                            const dateString = nameParts[nameParts.length - 1];
                            
                            return (
                              <tr key={index}>
                                <td>
                                  <div>
                                    {foodCategories.find(cat => cat.id === nameParts[0])?.icon} {nameParts[0]}
                                  </div>
                                  <small className="text-muted">
                                    {formatDate(new Date(dateString))}
                                  </small>
                                </td>
                                <td>
                                  <FontAwesomeIcon icon={meal.icon} className="me-1" />{' '}
                                  {meal.name}
                                  {item.quantity !== 1 && <small> ({item.quantity}x)</small>}
                                </td>
                                <td>
                                  <span className={`badge ${
                                    comparison > 10 ? 'bg-danger' : 
                                    comparison > 0 ? 'bg-warning text-dark' : 
                                    'bg-success'
                                  }`}>
                                    {comparison > 0 
                                      ? `+${Math.round(comparison)}% avg` 
                                      : `${Math.round(comparison)}% avg`}
                                  </span>
                                </td>
                                <td>
                                  <span className={
                                    item.carbonFootprint > 10 ? "text-danger" : 
                                    item.carbonFootprint > 5 ? "text-warning" : 
                                    "text-success"
                                  }>
                                    {item.carbonFootprint.toFixed(1)} kg
                                  </span>
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => removeFoodItem(index)}
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="row">
              <div className="col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Total Carbon Footprint</h5>
                    <p className="display-4 text-center">
                      {calculateTotalFootprint().toFixed(2)} <small className="fs-6">kg CO₂</small>
                    </p>
                    <div className="progress">
                      <div 
                        className="progress-bar" 
                        role="progressbar" 
                        style={{ 
                          width: `${Math.min(100, calculateTotalFootprint() * 5)}%`,
                          backgroundColor: calculateTotalFootprint() > 15 ? '#dc3545' : 
                                          calculateTotalFootprint() > 10 ? '#ffc107' : '#198754'
                        }}
                        aria-valuenow={calculateTotalFootprint()}
                        aria-valuemin={0}
                        aria-valuemax={20}
                      ></div>
                    </div>
                    <p className="text-center mt-2">
                      <small className="text-muted">
                        {calculateTotalFootprint() < 5 
                          ? "Excellent low-carbon diet!" 
                          : calculateTotalFootprint() < 10 
                            ? "Good sustainable food choices!"
                            : calculateTotalFootprint() < 15
                              ? "Consider reducing high-impact foods."
                              : "High carbon impact - try more plant-based options."}
                      </small>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Your Score</h5>
                    <p className="display-4 text-center">
                      {calculateScore()} <small className="fs-6">points</small>
                    </p>
                    <div className="progress">
                      <div 
                        className="progress-bar bg-success" 
                        role="progressbar" 
                        style={{ 
                          width: `${Math.min(100, calculateScore())}%`
                        }}
                        aria-valuenow={calculateScore()}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      ></div>
                    </div>
                    <p className="text-center mt-2">
                      <small className="text-muted">
                        {calculateScore() > 80 
                          ? "Climate-friendly diet champion!" 
                          : calculateScore() > 40 
                            ? "Good sustainable eating habits!"
                            : foodItems.length > 0
                              ? "Add more plant-based foods for higher score"
                              : "Start logging your food choices"}
                      </small>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="d-grid gap-2">
              <button 
                type="submit" 
                className="btn btn-eco btn-lg"
                disabled={loading || foodItems.length === 0}
              >
                <FontAwesomeIcon icon={faSave} className="me-2" />
                {loading ? 'Submitting...' : 'Submit Food Log'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FoodCarbon; 
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRecycle,
  faPlus,
  faMinus,
  faSave,
  faTrash,
  faCalendar,
  faUpload,
  faHistory,
  faCamera
} from '@fortawesome/free-solid-svg-icons';
import { RecyclingSubmission } from '../../types';

const recyclingCategories = [
  { id: 'plastic', name: 'Plastic', icon: '🥤', points: 5 },
  { id: 'paper', name: 'Paper', icon: '📄', points: 3 },
  { id: 'glass', name: 'Glass', icon: '🍶', points: 4 },
  { id: 'metal', name: 'Metal', icon: '🥫', points: 6 },
  { id: 'other', name: 'Other', icon: '♻️', points: 2 }
];

interface RecyclingItem {
  type: 'plastic' | 'paper' | 'glass' | 'metal' | 'other';
  count: number;
  date: Date;
  receiptImage?: string;
  note?: string;
}

const RecyclingChallenge: React.FC = () => {
  // State for tracking all recycling entries over the week
  const [recyclingEntries, setRecyclingEntries] = useState<RecyclingItem[]>([]);
  
  // State for the current recycling entry being added
  const [currentEntry, setCurrentEntry] = useState<{
    type: 'plastic' | 'paper' | 'glass' | 'metal' | 'other';
    count: number;
    note: string;
  }>({
    type: 'plastic',
    count: 1,
    note: ''
  });
  
  // Receipt upload handling
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // UI state
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'add' | 'history'>('add');
  
  const { submitRecycling } = useApp();
  const navigate = useNavigate();
  
  // Add a new recycling entry
  const addEntry = () => {
    if (currentEntry.count <= 0) {
      setError('Please add at least one item');
      return;
    }
    
    const newEntry: RecyclingItem = {
      type: currentEntry.type,
      count: currentEntry.count,
      date: new Date(),
      receiptImage: receiptImage || undefined,
      note: currentEntry.note || undefined
    };
    
    setRecyclingEntries([...recyclingEntries, newEntry]);
    
    // Reset form
    setCurrentEntry({
      type: 'plastic',
      count: 1,
      note: ''
    });
    setReceiptImage(null);
    setError(null);
  };
  
  // Remove an entry
  const removeEntry = (index: number) => {
    setRecyclingEntries(recyclingEntries.filter((_, i) => i !== index));
  };
  
  // Update current entry
  const updateCurrentEntry = (field: string, value: any) => {
    setCurrentEntry({
      ...currentEntry,
      [field]: value
    });
  };
  
  // Handle receipt image upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      return;
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Receipt image must be less than 5MB');
      return;
    }
    
    setUploading(true);
    
    // Read the file and convert to data URL
    const reader = new FileReader();
    reader.onload = () => {
      setReceiptImage(reader.result as string);
      setUploading(false);
    };
    reader.onerror = () => {
      setError('Failed to upload receipt image');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };
  
  // Trigger file input click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Take photo (on mobile devices)
  const handleTakePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.capture = 'environment';
      fileInputRef.current.click();
    }
  };
  
  // Calculate total items recycled
  const calculateTotalItems = () => {
    return recyclingEntries.reduce((total, entry) => total + entry.count, 0);
  };
  
  // Calculate weighted score
  const calculateScore = () => {
    let score = 0;
    
    recyclingEntries.forEach(entry => {
      const category = recyclingCategories.find(cat => cat.id === entry.type);
      if (category) {
        score += entry.count * category.points;
      }
    });
    
    // Cap at 100 points
    return Math.min(100, score);
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
  
  // Count items by type
  const countByType = (type: string) => {
    return recyclingEntries
      .filter(entry => entry.type === type)
      .reduce((total, entry) => total + entry.count, 0);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (recyclingEntries.length === 0) {
      return setError('Please add at least one recycling entry');
    }
    
    try {
      setError(null);
      setLoading(true);
      
      const totalItems = calculateTotalItems();
      
      // Convert entries to the format expected by the API
      const items = recyclingCategories.map(category => ({
        type: category.id as 'plastic' | 'paper' | 'glass' | 'metal' | 'other',
        count: countByType(category.id)
      })).filter(item => item.count > 0);
      
      const submission: RecyclingSubmission = {
        id: '',
        userId: '',
        challengeId: '',
        crewId: '',
        date: new Date(),
        category: items.map(item => item.type).join(', '),
        quantity: totalItems,
        score: calculateScore()
      };
      
      await submitRecycling(submission);
      setSubmitted(true);
      
    } catch (err) {
      setError('Failed to submit challenge data');
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
            <FontAwesomeIcon icon={faRecycle} className="text-success" size="4x" />
            <h2 className="mt-3">Challenge Completed!</h2>
            
            <div className="row justify-content-center mt-4">
              <div className="col-md-6">
                <div className="card mb-4">
                  <div className="card-body">
                    <p className="lead mb-0">
                      Total Items: <strong>{calculateTotalItems()} items</strong>
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
            
            <div className="row justify-content-center mt-2">
              {recyclingCategories.filter(cat => countByType(cat.id) > 0).map((category, index) => (
                <div key={index} className="col-md-4 mb-3">
                  <div className="card h-100">
                    <div className="card-body text-center">
                      <div className="display-4 mb-2">
                        {category.icon}
                      </div>
                      <h5>{category.name}</h5>
                      <p className="mb-0">
                        <strong>{countByType(category.id)}</strong> items
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="alert alert-success mt-4">
              <p className="mb-0">
                {calculateScore() > 80 ? 
                  "Amazing! You're a recycling champion making a huge environmental impact!" : 
                  calculateScore() > 50 ?
                  "Great job! Your recycling efforts are making a real difference!" :
                  calculateScore() > 20 ?
                  "Good start! Keep up your recycling habits to increase your impact!" :
                  "Thanks for participating! Try to recycle more items next time."}
              </p>
            </div>
            
            <p className="mt-3">
              By recycling this much, you've helped save resources and reduce landfill waste!
            </p>
            
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
          <h2>Recycling Challenge</h2>
          <p className="lead">
            Log the items you've recycled throughout the week. Upload receipts for verification.
          </p>
          
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          <div className="nav nav-pills mb-4">
            <button 
              className={`nav-link ${viewMode === 'add' ? 'active' : ''}`} 
              onClick={() => setViewMode('add')}
            >
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Add Recycling
            </button>
            <button 
              className={`nav-link ${viewMode === 'history' ? 'active' : ''}`} 
              onClick={() => setViewMode('history')}
              disabled={recyclingEntries.length === 0}
            >
              <FontAwesomeIcon icon={faHistory} className="me-2" />
              View History ({recyclingEntries.length})
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            {viewMode === 'add' ? (
              <>
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <FontAwesomeIcon icon={faPlus} className="me-2" />
                      Add Recycling Entry
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-md-6 mb-3 mb-md-0">
                        <label htmlFor="recyclingType" className="form-label">Type of Recycling</label>
                        <select
                          className="form-select"
                          id="recyclingType"
                          value={currentEntry.type}
                          onChange={(e) => updateCurrentEntry('type', e.target.value)}
                        >
                          {recyclingCategories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.icon} {category.name} ({category.points} pts/item)
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="col-md-6">
                        <label htmlFor="itemCount" className="form-label">Number of Items</label>
                        <div className="input-group">
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => updateCurrentEntry('count', Math.max(1, currentEntry.count - 1))}
                          >
                            <FontAwesomeIcon icon={faMinus} />
                          </button>
                          
                          <input
                            type="number"
                            className="form-control text-center"
                            id="itemCount"
                            value={currentEntry.count}
                            onChange={(e) => updateCurrentEntry('count', parseInt(e.target.value) || 1)}
                            min="1"
                          />
                          
                          <button
                            type="button"
                            className="btn btn-outline-success"
                            onClick={() => updateCurrentEntry('count', currentEntry.count + 1)}
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="note" className="form-label">Note (Optional)</label>
                      <textarea
                        className="form-control"
                        id="note"
                        rows={2}
                        placeholder="Add details about your recycling"
                        value={currentEntry.note}
                        onChange={(e) => updateCurrentEntry('note', e.target.value)}
                      ></textarea>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label d-block">Receipt (Optional)</label>
                      
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="d-none"
                        onChange={handleFileChange}
                      />
                      
                      <div className="d-flex gap-2 mb-3">
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={handleUploadClick}
                          disabled={uploading}
                        >
                          <FontAwesomeIcon icon={faUpload} className="me-2" />
                          Upload Receipt
                        </button>
                        
                        <button
                          type="button"
                          className="btn btn-outline-info"
                          onClick={handleTakePhoto}
                          disabled={uploading}
                        >
                          <FontAwesomeIcon icon={faCamera} className="me-2" />
                          Take Photo
                        </button>
                      </div>
                      
                      {uploading && (
                        <div className="text-center mb-3">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-2 mb-0">Uploading image...</p>
                        </div>
                      )}
                      
                      {receiptImage && (
                        <div className="mb-3">
                          <div className="d-flex justify-content-center">
                            <img 
                              src={receiptImage} 
                              alt="Receipt" 
                              className="img-fluid border rounded"
                              style={{ maxHeight: '200px' }}
                            />
                          </div>
                          <div className="text-center mt-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => setReceiptImage(null)}
                            >
                              Remove Image
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="d-grid">
                      <button
                        type="button"
                        className="btn btn-eco"
                        onClick={addEntry}
                        disabled={uploading || currentEntry.count < 1}
                      >
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        Add to Log
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6 mb-4">
                    <div className="card h-100">
                      <div className="card-body">
                        <h5 className="card-title">Total Items</h5>
                        <p className="display-4 text-center">
                          {calculateTotalItems()} <small className="fs-6">items</small>
                        </p>
                        <p className="text-center mt-2">
                          <small className="text-muted">
                            {calculateTotalItems() > 15 
                              ? "Great job recycling so many items!" 
                              : calculateTotalItems() > 5 
                                ? "Good recycling progress!"
                                : calculateTotalItems() > 0
                                  ? "Keep adding more recycled items!"
                                  : "Add some recycled items to start"}
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
                              ? "Recycling champion!" 
                              : calculateScore() > 40 
                                ? "Great recycling effort!"
                                : calculateScore() > 0
                                  ? "Good start, add more items!"
                                  : "Start adding recycled items"}
                          </small>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">
                    <FontAwesomeIcon icon={faCalendar} className="me-2" />
                    Your Recycling History
                  </h5>
                </div>
                <div className="card-body p-0">
                  {recyclingEntries.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="mb-0">No recycling entries yet. Add some to get started!</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table mb-0">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Count</th>
                            <th>Receipt</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recyclingEntries.map((entry, index) => {
                            const category = recyclingCategories.find(cat => cat.id === entry.type);
                            
                            return (
                              <tr key={index}>
                                <td>{formatDate(entry.date)}</td>
                                <td>
                                  <span className="me-2">{category?.icon}</span>
                                  {category?.name}
                                </td>
                                <td>
                                  <span className="badge bg-info">{entry.count} items</span>
                                </td>
                                <td>
                                  {entry.receiptImage ? (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-info"
                                      onClick={() => window.open(entry.receiptImage, '_blank')}
                                    >
                                      <FontAwesomeIcon icon={faUpload} className="me-1" />
                                      View
                                    </button>
                                  ) : (
                                    <span className="text-muted">None</span>
                                  )}
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => removeEntry(index)}
                                  >
                                    <FontAwesomeIcon icon={faTrash} className="me-1" />
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="d-grid gap-2">
              <button 
                type="submit" 
                className="btn btn-eco btn-lg"
                disabled={loading || calculateTotalItems() === 0}
              >
                <FontAwesomeIcon icon={faSave} className="me-2" />
                {loading ? 'Submitting...' : 'Submit Recycling Log'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecyclingChallenge; 
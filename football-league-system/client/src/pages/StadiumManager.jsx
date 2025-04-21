import { useState, useEffect } from 'react';
import { getManagedStadiums, updateStadium } from '../services/api';

function StadiumManager() {
  const [stadiums, setStadiums] = useState([]);
  const [selectedStadium, setSelectedStadium] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchStadiums = async () => {
      try {
        setLoading(true);
        const data = await getManagedStadiums();
        setStadiums(data);
        
        if (data.length > 0) {
          setSelectedStadium(data[0]);
          setFormData({
            name: data[0].name || '',
            location: data[0].location || '',
            capacity: data[0].capacity || ''
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stadiums:', error);
        setError('Failed to load stadium data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchStadiums();
  }, []);

  const handleStadiumSelect = (stadium) => {
    setSelectedStadium(stadium);
    setFormData({
      name: stadium.name || '',
      location: stadium.location || '',
      capacity: stadium.capacity || ''
    });
    setSuccess(null);
    setError(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccess(null);
    
    try {
      const updatedStadium = await updateStadium(selectedStadium.id, formData);
      
      // Update stadiums list
      setStadiums(stadiums.map(stadium => 
        stadium.id === updatedStadium.id ? updatedStadium : stadium
      ));
      
      setSelectedStadium(updatedStadium);
      setSuccess('Stadium updated successfully!');
    } catch (error) {
      console.error('Error updating stadium:', error);
      setError('Failed to update stadium. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border"></div></div>;
  }

  if (stadiums.length === 0) {
    return (
      <div className="alert alert-warning">
        You are not managing any stadiums. Please contact a league administrator to be assigned as a stadium manager.
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">Stadium Management</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="row">
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Your Stadiums</h5>
            </div>
            <div className="card-body">
              <div className="list-group">
                {stadiums.map(stadium => (
                  <button
                    key={stadium.id}
                    className={`list-group-item list-group-item-action ${selectedStadium && selectedStadium.id === stadium.id ? 'active' : ''}`}
                    onClick={() => handleStadiumSelect(stadium)}
                  >
                    {stadium.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Stadium Details</h5>
            </div>
            <div className="card-body">
              {selectedStadium ? (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Stadium Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="location" className="form-label">Location</label>
                    <input
                      type="text"
                      className="form-control"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="capacity" className="form-label">Capacity</label>
                    <input
                      type="number"
                      className="form-control"
                      id="capacity"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      min="1000"
                      required
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={updating}
                  >
                    {updating ? (
                      <span>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Updating...
                      </span>
                    ) : 'Update Stadium'}
                  </button>
                </form>
              ) : (
                <p>Select a stadium to view details</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StadiumManager;

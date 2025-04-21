import { useState, useEffect } from 'react';
import { getPlayerProfile, updatePlayer } from '../services/api';

function PlayerProfile() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    position: '',
    age: '',
    height: '',
    weight: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getPlayerProfile();
        setProfile(data);
        setFormData({
          position: data.position || '',
          age: data.age || '',
          height: data.height || '',
          weight: data.weight || ''
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

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
      const updatedProfile = await updatePlayer(profile.id, formData);
      setProfile(updatedProfile);
      setSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border"></div></div>;
  }

  if (!profile) {
    return (
      <div className="alert alert-warning">
        Player profile not found. Please contact an administrator to set up your player profile.
      </div>
    );
  }

  return (
    <div className="row">
      <div className="col-md-8 mx-auto">
        <div className="card">
          <div className="card-header">
            <h4 className="mb-0">Player Profile</h4>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            
            <div className="mb-4">
              <h5>Team Information</h5>
              <p>
                <strong>Team:</strong> {profile.team_name || 'Not assigned to a team'}
              </p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <h5>Personal Details</h5>
              
              <div className="mb-3">
                <label htmlFor="position" className="form-label">Position</label>
                <select
                  className="form-select"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                >
                  <option value="">Select position</option>
                  <option value="Goalkeeper">Goalkeeper</option>
                  <option value="Defender">Defender</option>
                  <option value="Midfielder">Midfielder</option>
                  <option value="Forward">Forward</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label htmlFor="age" className="form-label">Age</label>
                <input
                  type="number"
                  className="form-control"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="15"
                  max="50"
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="height" className="form-label">Height (cm)</label>
                <input
                  type="number"
                  className="form-control"
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  step="0.1"
                  min="150"
                  max="220"
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="weight" className="form-label">Weight (kg)</label>
                <input
                  type="number"
                  className="form-control"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  step="0.1"
                  min="40"
                  max="150"
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
                ) : 'Update Profile'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerProfile;

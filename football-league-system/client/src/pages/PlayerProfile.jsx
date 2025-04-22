import { useState, useEffect } from 'react';
import { getPlayerProfile, updatePlayer, getMyPlayerStatistics } from '../services/api';
import PlayerStatistics from '../components/PlayerStatistics';

function PlayerProfile() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    age: '',
    height: '',
    weight: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [activeSection, setActiveSection] = useState('profile');

  useEffect(() => {
    document.title = "Player | Football League Management System";
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch profile and statistics in parallel
        const [profileData, statsData] = await Promise.all([
          getPlayerProfile(),
          getMyPlayerStatistics()
        ]);
        
        setProfile(profileData);
        setStatistics(statsData);
        
        setFormData({
          name: profileData.name || '',
          position: profileData.position || '',
          age: profileData.age || '',
          height: profileData.height || '',
          weight: profileData.weight || ''
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load profile data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
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

  // Function to refresh statistics
  const refreshStatistics = async () => {
    try {
      const statsData = await getMyPlayerStatistics();
      setStatistics(statsData);
    } catch (error) {
      console.error('Error refreshing statistics:', error);
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
    <div>
      <h2 className="mb-4">Player Dashboard</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveSection('profile')}
          >
            My Profile
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeSection === 'statistics' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('statistics');
              refreshStatistics();
            }}
          >
            My Statistics
          </button>
        </li>
      </ul>
      
      {activeSection === 'profile' && (
        <div className="row">
          <div className="col-md-8 mx-auto">
            <div className="card">
              <div className="card-header">
                <h4 className="mb-0">Player Profile</h4>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <h5>Team Information</h5>
                  <p>
                    <strong>Team:</strong> {profile.team_name || 'Not assigned to a team'}
                  </p>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <h5>Personal Details</h5>

                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Full Name</label>
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
      )}
      
      {activeSection === 'statistics' && (
        <PlayerStatistics statistics={statistics} />
      )}
    </div>
  );
}

export default PlayerProfile;

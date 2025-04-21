import { Link } from 'react-router-dom';

function Navbar({ user, handleLogout }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">Football League</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            {user && (
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">Dashboard</Link>
              </li>
            )}
            {user && user.role === 'player' && (
              <li className="nav-item">
                <Link className="nav-link" to="/player-profile">My Profile</Link>
              </li>
            )}
            {user && user.role === 'team_manager' && (
              <li className="nav-item">
                <Link className="nav-link" to="/team-manager">Manage Team</Link>
              </li>
            )}
            {user && user.role === 'referee' && (
              <li className="nav-item">
                <Link className="nav-link" to="/referee-schedule">My Schedule</Link>
              </li>
            )}
            {user && user.role === 'stadium_manager' && (
              <li className="nav-item">
                <Link className="nav-link" to="/stadium-manager">Manage Stadium</Link>
              </li>
            )}
            {user && user.role === 'league_admin' && (
              <li className="nav-item">
                <Link className="nav-link" to="/league-admin">Admin Panel</Link>
              </li>
            )}
          </ul>
          <ul className="navbar-nav">
            {!user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Register</Link>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <button className="nav-link btn btn-link" onClick={handleLogout}>Logout</button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

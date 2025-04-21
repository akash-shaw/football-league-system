function MatchCard({ match }) {
    const matchDate = new Date(match.match_date);
    const isPast = matchDate < new Date();
    
    return (
      <div className="card mb-3">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>{matchDate.toLocaleDateString()} - {matchDate.toLocaleTimeString()}</span>
          <span className={`badge ${isPast ? 'bg-secondary' : 'bg-success'}`}>
            {isPast ? 'Completed' : 'Upcoming'}
          </span>
        </div>
        <div className="card-body">
          <div className="row align-items-center text-center">
            <div className="col-5">
              <h5>{match.home_team}</h5>
            </div>
            <div className="col-2">
              {isPast ? (
                <h4>{match.home_score} - {match.away_score}</h4>
              ) : (
                <h4>VS</h4>
              )}
            </div>
            <div className="col-5">
              <h5>{match.away_team}</h5>
            </div>
          </div>
        </div>
        <div className="card-footer text-muted">
          Stadium: {match.stadium} | Referee: {match.referee || 'TBA'}
        </div>
      </div>
    );
  }
  
  export default MatchCard;
  
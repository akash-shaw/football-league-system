function PointsTable({ data }) {
    return (
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>#</th>
              <th>Team</th>
              <th>P</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GF</th>
              <th>GA</th>
              <th>GD</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {data.map((team, index) => (
              <tr key={team.team_id}>
                <td>{index + 1}</td>
                <td>{team.team_name}</td>
                <td>{team.played}</td>
                <td>{team.wins}</td>
                <td>{team.draws}</td>
                <td>{team.losses}</td>
                <td>{team.goals_for}</td>
                <td>{team.goals_against}</td>
                <td>{team.goal_difference}</td>
                <td><strong>{team.points}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  
  export default PointsTable;
  
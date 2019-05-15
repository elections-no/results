import React from 'react';
import './App.css';

class ElectionTypes extends React.Component {
  state = {
    election_types: []
  }

  handleError(res, message) {
    console.log("ERROR (" + res.status + "): " + message);
  }

  getElectionTypes() {
    fetch('https://sleepy-retreat-45150.herokuapp.com/api/election_types')
      .then(response => {
        if (!response.ok) {
          this.handleError(response, "Failed to get election types");
        }
        return response.json();
      })
      .then(data => {
        this.setState({election_types: data.election_types});
      });
  }

  componentDidMount() {
    this.getElectionTypes();
  }

  render() {
    return (
      <ul>
         {this.state.election_types.map(function(item) {
          return <li key={item.id}>{item.name}</li>;
        })}
      </ul>
    );
  }
}

class ElectionEvents extends React.Component {
  state = {
    election_events: []
  }

  handleError(res, message) {
    console.log("ERROR (" + res.status + "): " + message);
  }

  getElectionEvents() {
    fetch('https://sleepy-retreat-45150.herokuapp.com/api/election_events')
      .then(response => {
        if (!response.ok) {
          this.handleError(response, "Failed to get election events");
        }
        return response.json();
      })
      .then(data => {
        this.setState({election_events: data.election_events});
      });
  }

  componentDidMount() {
    this.getElectionEvents();
  }

  render() {
    return (
      <ul>
        {this.state.election_events.map(function(item) {
          return <li key={item.id}>{item.name}</li>;
        })}
      </ul>
    );
  }
}

class Elections extends React.Component {
  state = {
    elections: []
  }

  handleError(res, message) {
    console.log("ERROR (" + res.status + "): " + message);
  }

  getElections() {
    fetch('https://sleepy-retreat-45150.herokuapp.com/api/elections')
      .then(response => {
        if (!response.ok) {
          this.handleError(response, "Failed to get elections");
        }
        return response.json();
      })
      .then(data => {
        this.setState({elections: data.elections});
      });
  }

  componentDidMount() {
    this.getElections();
  }

  render() {
    return (
      <ul>
        {this.state.elections.map(function(item) {
          return <li key={item.id}>{item.election_event} {item.election_type}</li>;
        })}
      </ul>
    );
  }
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Election Results for 2019
        </p>
        <ElectionTypes/>
        <ElectionEvents/>
        <Elections/>
      </header>
    </div>
  );
}

export default App;

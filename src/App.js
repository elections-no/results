import React from 'react';
import logo from './logo.svg';
import './App.css';

class Feed extends React.Component {
  state = {
    election_types: []
  }

  getElectionTypes() {
    fetch('https://sleepy-retreat-45150.herokuapp.com/api/election_types')
      .then(response => {
        if (!response.ok) {
          console.log("Response is not ok");
        }
        else {
          console.log("Response is OK!");
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

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Election Results for 2019
        </p>
        <Feed/>
      </header>
    </div>
  );
}

export default App;

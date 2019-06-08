import React from "react";
import ReactDOM from "react-dom";
import "./App.css";
import * as d3 from "d3";
import Norway from "./Norway";

class ElectionTypes extends React.Component {
  state = {
    election_types: []
  };

  handleError(res, message) {
    console.log("ERROR (" + res.status + "): " + message);
  }

  getElectionTypes() {
    fetch("https://sleepy-retreat-45150.herokuapp.com/api/election_types")
      .then(response => {
        if (!response.ok) {
          this.handleError(response, "Failed to get election types");
        }
        return response.json();
      })
      .then(data => {
        this.setState({ election_types: data.election_types });
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
  };

  handleError(res, message) {
    console.log("ERROR (" + res.status + "): " + message);
  }

  getElectionEvents() {
    fetch("https://sleepy-retreat-45150.herokuapp.com/api/election_events")
      .then(response => {
        if (!response.ok) {
          this.handleError(response, "Failed to get election events");
        }
        return response.json();
      })
      .then(data => {
        this.setState({ election_events: data.election_events });
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
  };

  handleError(res, message) {
    console.log("ERROR (" + res.status + "): " + message);
  }

  getElections() {
    fetch("https://sleepy-retreat-45150.herokuapp.com/api/elections")
      .then(response => {
        if (!response.ok) {
          this.handleError(response, "Failed to get elections");
        }
        return response.json();
      })
      .then(data => {
        this.setState({ elections: data.elections });
      });
  }

  componentDidMount() {
    this.getElections();
  }

  render() {
    return (
      <ul>
        {this.state.elections.map(function(item) {
          return (
            <li key={item.id}>
              {item.election_event} {item.election_type}
            </li>
          );
        })}
      </ul>
    );
  }
}

class BarChart extends React.Component {
  componentDidMount() {
    this.svg = ReactDOM.findDOMNode(this);
    this.drawChart();
  }

  componentDidUpdate() {
    const { width, height } = this.props;
    if (width !== 0 && height !== 0) {
      this.drawChart();
    }
  }

  drawChart() {
    const { data, height } = this.props;

    this.svg.innerHTML = "";

    const svg = d3.select(this.svg);

    svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * 90) // space between columns
      .attr("y", (d, i) => height - 10 * d)
      .attr("width", 65)
      .attr("height", (d, i) => d * 10)
      .attr("fill", "gray");
  }

  render() {
    const { width, height } = this.props;
    return <svg width={width} height={height} />;
  }
}

class App extends React.Component {
  state = {
    data: [12, 5, 6, 6, 9, 10],
    map_data: [12, 5, 6, 6, 9, 10],
    width: 700,
    height: 200,
    map_width: 800,
    map_height: 450
  };

  handleClick = (e, result) => {
    const { countyName, countyNumber, municipalityName, municipalityNumber } = result;
    if (municipalityName) {
      console.log("Click happened : " + countyName + " (" + countyNumber + "), " + municipalityName + " (" + municipalityNumber + ")");
    } else {
      console.log("Click happened : " + countyName + " (" + countyNumber + ")");
    }
  };

  handleMouseOver = (e, text) => {
    console.log("MouseOver happened :", text);
  };

  handleMouseOut = e => {
    console.log("MouseOut happened");
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <p>Election Results for 2019</p>
          <Norway
            id="simple"
            width={2 * this.state.map_width}
            height={2 * this.state.map_height}
            onClick={this.handleClick}
            onMouseOver={this.handleMouseOver}
            onMouseOut={this.handleMouseOut}
          />
          <BarChart data={this.state.data} width={this.state.width} height={this.state.height} />
          <ElectionTypes />
          <ElectionEvents />
          <Elections />
        </header>
      </div>
    );
  }
}

export default App;

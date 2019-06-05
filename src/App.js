import React from "react";
import ReactDOM from "react-dom";
import "./App.css";
import * as d3 from "d3";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import counties from "./json/norway-counties.json";
import municipalities from "./json/norway-municipalities.json";

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

class Norway extends React.Component {
  constructor() {
    super();
    this.state = {
      countiesCollection: [],
      municipalitiesCollection: [],
      counties: [],
      municipalities: [],
      hovered: -1
    };

    this.handleCountyClick = this.handleCountyClick.bind(this);
    this.handleMunicipalityClick = this.handleMunicipalityClick.bind(this);
    this.countyHoverEnter = this.countyHoverEnter.bind(this);
    this.countyHoverLeave = this.countyHoverLeave.bind(this);
  }
  projection() {
    const { width, height } = this.props;
    return geoMercator().fitSize(
      [width, height],
      this.state.countiesCollection
    );
  }

  countyHoverEnter(countyIndex) {
    console.log(
      "Hover enter on county: ",
      this.state.counties[countyIndex].properties.NAME_1
    );
    this.setState({
      hovered: countyIndex
    });
  }

  countyHoverLeave(countyIndex) {
    console.log(
      "Hover leave on county: ",
      this.state.counties[countyIndex].properties.NAME_1
    );
    this.setState({
      hovered: -1
    });
  }

  handleCountyClick(countyIndex) {
    console.log(
      "Clicked on county: ",
      this.state.counties[countyIndex].properties.NAME_1
    );
  }

  handleMunicipalityClick(municipalityIndex) {
    console.log(
      "Clicked on municipality: ",
      this.state.municipalities[municipalityIndex].properties.NAME_1
    );
  }

  componentDidMount() {
    this.setState({
      countiesCollection: feature(counties, counties.objects.NOR_adm1),
      municipalitiesCollection: feature(
        municipalities,
        municipalities.objects.NOR_adm2
      ),
      counties: feature(counties, counties.objects.NOR_adm1).features,
      municipalities: feature(municipalities, municipalities.objects.NOR_adm2)
        .features
    });
  }

  render() {
    const { width, height } = this.props;
    return (
      <svg
        width={width}
        height={height}
        viewBox={"0 0 " + width + " " + height}
      >
        <g className="counties">
          {this.state.counties.map((d, i) => (
            <path
              key={`path-${i}`}
              d={geoPath().projection(this.projection())(d)}
              className="county"
              onClick={() => this.handleCountyClick(i)}
            />
          ))}
        </g>
        <g className="municipalities">
          {this.state.municipalities.map((d, i) => (
            <path
              key={`path-${i}`}
              d={geoPath().projection(this.projection())(d)}
              className="municipality"
              onClick={() => this.handleMunicipalityClick(i)}
            />
          ))}
        </g>
      </svg>
    );
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
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <p>Election Results for 2019</p>
          <Norway
            width={2 * this.state.map_width}
            height={2 * this.state.map_height}
          />
          <BarChart
            data={this.state.data}
            width={this.state.width}
            height={this.state.height}
          />
          <ElectionTypes />
          <ElectionEvents />
          <Elections />
        </header>
      </div>
    );
  }
}

export default App;

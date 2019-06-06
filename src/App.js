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
      municipalities: []
    };

    this.handleCountyClick = this.handleCountyClick.bind(this);
    this.getBoundingBox = this.getBoundingBox.bind(this);
    this.getBoundingBoxCenter = this.getBoundingBoxCenter.bind(this);
  }
  projection() {
    const { width, height } = this.props;
    return geoMercator().fitSize(
      [width, height],
      this.state.countiesCollection
    );
  }

  getBoundingBoxCenter(bbox) {
    return [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2];
  }

  getBoundingBox(selection) {
    const element = selection.node();
    return element.getBBox();
  }

  makeViewBoxString(x, y, width, height) {
    return "" + x + " " + y + " " + width + " " + height;
  }

  handleCountyClick(countyIndex) {
    const key = "#" + this.makeId("county", countyIndex);
    const selection = d3.select(key);
    const was_selected = selection.classed("active");

    d3.selectAll("path").classed("active", (d, i, nodes) => {
      const node = d3.select(nodes[i]);
      node.classed("active", false);
    });

    if (!was_selected) {
      selection.classed("active", true);
      const { x, y, width, height } = this.getBoundingBox(selection);
      let view = this.makeViewBoxString(x, y, width, height);
      d3.select("svg").attr("viewBox", view);
    } else {
      const { width, height } = this.props;
      let view = this.makeViewBoxString(0, 0, width, height);
      d3.select("svg").attr("viewBox", view);
    }

    console.log(
      "Clicked on county: ",
      this.state.counties[countyIndex].properties.NAME_1
    );

    console.log(
      "Clicked on county number: ",
      this.state.counties[countyIndex].properties.ID_1
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

  makeId(kind, enumerator) {
    const { id } = this.props;
    return "" + id + "-" + kind + "-" + enumerator;
  }

  render() {
    const { id, width, height } = this.props;
    return (
      <svg
        id={id}
        width={width}
        height={height}
        viewBox={"0 0 " + width + " " + height}
      >
        <g className="counties">
          {this.state.counties.map((d, i) => (
            <path
              id={this.makeId("county", i)}
              key={`county-${i}`}
              d={geoPath().projection(this.projection())(d)}
              className="county"
              onClick={() => this.handleCountyClick(i)}
            />
          ))}
        </g>
        <g className="municipalities">
          {this.state.municipalities.map((d, i) => (
            <path
              key={`municipality-${i}`}
              d={geoPath().projection(this.projection())(d)}
              className="municipality"
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
            id="simple"
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

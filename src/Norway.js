import React from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";
import {geoIdentity, geoPath} from "d3-geo";
import {feature} from "topojson-client";
import counties from "./topojson/norway-counties-simple.json";
import municipalities from "./topojson/norway-municipalities-simple.json";
import polling_districts from "./topojson/norway-polling-districts-simple.json";

class Norway extends React.Component {
  constructor() {
    super();
    this.state = {
      counties: [],
      countiesCollection: [],
      municipalities: [],
      municipalitiesCollection: [],
      polling_districts: [],
      pollingDistrictsCollection: []
    };
  }

  projection() {
    const { width, height } = this.props;
    return geoIdentity().reflectY(true).fitSize([width,height],this.state.countiesCollection);
  }
  
  municipality_projection() {
    const { width, height } = this.props;
    return geoIdentity().reflectY(true).fitSize([width,height],this.state.municipalitiesCollection);
  }

  polling_projection() {
    const { width, height } = this.props;
    return geoIdentity().reflectY(true).fitSize([width,height],this.state.pollingDistrictsCollection);
  }

  getBoundingBoxCenter(bbox) {
    return [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2];
  }

  getBoundingBox(selection) {
    const element = selection.node();
    return element.getBBox();
  }

  makeViewBoxString(x, y, width, height) {
    return [x, y, width, height].join(" ");
  }

  getCountyNumber(countyIndex) {
    return this.state.counties[countyIndex].properties.fylkesnummer;
  }

  getCountyName(countyIndex) {
    return this.state.counties[countyIndex].properties.navn[0].navn;
  }

  isCountySelected(countyIndex) {
    const selection = this.getCounty(countyIndex);
    return selection.classed("active");
  }

  getCounty(countyIndex) {
    const key = "#" + this.makeId("county", countyIndex);
    return d3.select(key);
  }

  selectCounty(selection) {
    selection.classed("active", true);
  }

  handleCountyClick = (countyIndex, event) => {
    this.setClickHandled();

    const was_selected = this.isCountySelected(countyIndex);
    this.deselectAllCounties();

    if (!was_selected) {
      const selection = this.getCounty(countyIndex);
      this.selectCounty(selection);
      const { x, y, width, height } = this.getBoundingBox(selection);
      this.zoomIn(this.makeViewBoxString(x, y, width, height));
    }

    const { onClick } = this.props;
    onClick(event, {
      pollingStationName: "",
      pollingStationNumber: "",
      countyName: this.getCountyName(countyIndex),
      countyNumber: this.getCountyNumber(countyIndex),
      municipalityName: "",
      municipalityNumber: ""
    });
  };

  deselectAllCounties() {
    d3.selectAll("path").classed("active", (d, i, nodes) => {
      const node = d3.select(nodes[i]);
      node.classed("active", false);
    });
  }

  getSVG() {
    return d3.select("#" + this.props.id);
  }

  zoomIn(view) {
    const svg = this.getSVG();
    svg.classed("county_zoomed", true);
    svg.attr("viewBox", view);
    svg.selectAll(".municipality").style("pointer-events", "all");
    svg.selectAll(".county").style("pointer-events", "none");

    svg.selectAll(".municipality").classed("county_zoomed", true);
    svg.selectAll(".county").classed("county_zoomed", true);
  }

  zoomOut() {
    const { width, height } = this.props;
    let view = this.makeViewBoxString(0, 0, width, height);
    const svg = this.getSVG();
    svg.classed("county_zoomed", false);
    svg.attr("viewBox", view);
    svg.selectAll(".municipality").style("pointer-events", "none");
    svg.selectAll(".county").style("pointer-events", "all");

    svg.selectAll(".municipality").classed("county_zoomed", false);
    svg.selectAll(".county").classed("county_zoomed", false);
  }

  setClickHandled() {
    this.getSVG().classed("clicked", true);
  }

  resetClickHandled() {
    this.getSVG().classed("clicked", false);
  }

  isClickHandled() {
    return this.getSVG().classed("clicked");
  }

  componentDidMount() {
    this.setState({
      countiesCollection: feature(counties, counties.objects.feature02),
      counties: feature(counties, counties.objects.feature02).features,
      municipalitiesCollection: feature(municipalities, municipalities.objects.feature04),
      municipalities: feature(municipalities, municipalities.objects.feature04).features,
      pollingDistrictsCollection: feature(polling_districts, polling_districts.objects.feature06),
      polling_districts: feature(polling_districts, polling_districts.objects.feature06).features
    });
  }

  makeId(kind, enumerator) {
    const { id } = this.props;
    return "" + id + "-" + kind + "-" + enumerator;
  }

  handleClick = event => {
    if (this.isClickHandled()) {
      this.resetClickHandled();
    } else {
      this.deselectAllCounties();
      this.deselectAllMunicipalities();
      this.zoomOut();
    }
  };

  getCenter(selection) {
    const box = this.getBoundingBox(selection);
    const point = this.getBoundingBoxCenter(box);

    const parentRect = ReactDOM.findDOMNode(this).getBoundingClientRect();

    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;

    return {
      x: parentRect.x + point[0] + scrollLeft,
      y: parentRect.y + point[1] + scrollTop
    };
  }

  getCountyCenter(countyIndex) {
    const selection = this.getCounty(countyIndex);
    return this.getCenter(selection);
  }

  fadeInTooltip() {
    d3.select(".tooltip")
      .transition()
      .duration(200)
      .style("opacity", 0.9);
  }

  positionTooltip(text, x, y) {
    d3.select(".tooltip")
      .html(text)
      .style("left", x + "px")
      .style("top", y + "px");
  }

  showCountyTooltip = (countyIndex, event) => {
    this.fadeInTooltip();

    const { x, y } = this.getCountyCenter(countyIndex);
    const text = this.getCountyName(countyIndex);

    this.positionTooltip(text, x, y);

    // Propagate event
    const { onMouseOver } = this.props;
    onMouseOver(event, this.getCountyName(countyIndex));
  };

  hideTooltip(event) {
    d3.select(".tooltip")
      .transition()
      .duration(500)
      .style("opacity", 0);
    // Propagate event
    const { onMouseOut } = this.props;
    onMouseOut(event);
  }

  hideCountyTooltip = (countyIndex, event) => {
    this.hideTooltip(event);
    console.log("Hide Tooltip : " + this.getCountyName(countyIndex));
  };

  /**
   *  Municipality
   */
  getMunicipalityCenter(municipalityIndex) {
    const selection = this.getMunicipality(municipalityIndex);
    return this.getCenter(selection);
  }

  getMunicipality(municipalityIndex) {
    const key = "#" + this.makeId("municipality", municipalityIndex);
    return d3.select(key);
  }

  isMunicipalitySelected(index) {
    const selection = this.getMunicipality(index);
    return selection.classed("municipality_active");
  }

  selectMunicipality(selection) {
    selection.classed("municipality_active", true);
  }

  deselectAllMunicipalities() {
    d3.selectAll("path").classed("municipality_active", (d, i, nodes) => {
      const node = d3.select(nodes[i]);
      node.classed("municipality_active", false);
    });
  }

  getMunicipalityCountyNumber(municipalityIndex) {
    const municipality_number = this.state.municipalities[municipalityIndex].properties.kommunenummer;
    return municipality_number.substring(0, 2);
  }

  getMunicipalityNumber(municipalityIndex) {
    return this.state.municipalities[municipalityIndex].properties.kommunenummer;
  }

  getMunicipalityName(municipalityIndex) {
    return this.state.municipalities[municipalityIndex].properties.navn[0].navn;
  }

  getCountyIndexFromCountyNumber(countyNumber) {
    let countyIndex = -1;
    this.state.counties.filter((c, i) => {
      if (c.properties.fylkesnummer === countyNumber) {
        countyIndex = i;
        return true;
      }
      return false;
    });
    return countyIndex;
  }

  getMunicipalityIndexFromMunicipalityNumber(number) {
    let index = -1;
    this.state.municipalities.filter((c, i) => {
      if (c.properties.kommunenummer === number) {
        index = i;
        return true;
      }
      return false;
    });
    return index;
  }

  handleMunicipalityClick = (municipalityIndex, event) => {
    const countyNumber = this.getMunicipalityCountyNumber(municipalityIndex);
    const countyIndex = this.getCountyIndexFromCountyNumber(countyNumber);
    
    if (countyIndex < 0) {
      // Do not mark click as handled, let it propagate, we have nothing sensible to do here
      console.error("ERROR: No such county Found : ", this.getMunicipalityCountyNumber(municipalityIndex));
      return;
    }

    if (this.isCountySelected(countyIndex)) {
      this.setClickHandled();

      const was_selected = this.isMunicipalitySelected(municipalityIndex);
      this.deselectAllMunicipalities();

      if (!was_selected) {
        const selection = this.getMunicipality(municipalityIndex);
        this.selectMunicipality(selection);
        const { x, y, width, height } = this.getBoundingBox(selection);
        this.zoomIn(this.makeViewBoxString(x, y, width, height));
      }

      const { onClick } = this.props;
      onClick(event, {
        pollingStationName: "",
        pollingStationNumber: "",
        countyName: this.getCountyName(countyIndex),
        countyNumber: this.getCountyNumber(countyIndex),
        municipalityName: this.getMunicipalityName(municipalityIndex),
        municipalityNumber: this.getMunicipalityNumber(municipalityIndex)
      });
    } else {
      this.handleCountyClick(countyIndex, event);
    }
  };

  showMunicipalityTooltip = (municipalityIndex, event) => {
    this.fadeInTooltip();

    const { x, y } = this.getMunicipalityCenter(municipalityIndex);
    const text = this.getMunicipalityName(municipalityIndex);

    this.positionTooltip(text, x, y);

    // Propagate event
    const { onMouseOver } = this.props;
    onMouseOver(event, this.getMunicipalityName(municipalityIndex));

    console.log("Show Tooltip : " + this.getMunicipalityName(municipalityIndex));
  };

  hideMunicipalityTooltip = (municipalityIndex, event) => {
    this.hideTooltip(event);
    console.log("Hide Tooltip : " + this.getMunicipalityName(municipalityIndex));
  };

  /**
   *  Polling station
   */
  getPollingStationCenter(index) {
    const selection = this.getPollingStation(index);
    return this.getCenter(selection);
  }

  getPollingStation(index) {
    const key = "#" + this.makeId("polling_district", index);
    return d3.select(key);
  }
  getPollingStationNumber(index) {
    return this.state.polling_districts[index].properties.valgkretsnummer;
  }

  getPollingStationName(index) {
    return this.state.polling_districts[index].properties.valgkretsnavn;
  }

  handlePollingStationClick = (index, event) => {
    console.log("handlePollingStationClick name ", this.getPollingStationName(index));
    console.log("handlePollingStationClick number ", this.getPollingStationNumber(index));
    let oldMunicipalityNumber = this.state.polling_districts[index].properties.kommunenummer;
    console.log("handlePollingStationClick kommunenummer", oldMunicipalityNumber);
    const municipalityNumber = this.state.polling_districts[index].properties.nyttkommunenummer;
    console.log("handlePollingStationClick nyttkommunenummer", municipalityNumber);

    const municipalityIndex = this.getMunicipalityIndexFromMunicipalityNumber(oldMunicipalityNumber);

    if (municipalityIndex < 0) {
      // Do not mark click as handled, let it propagate, we have nothing sensible to do here
      console.error("ERROR: No such municipality Found : ", municipalityNumber);
      return;
    }

    const countyNumber = this.getMunicipalityCountyNumber(municipalityIndex);
    const countyIndex = this.getCountyIndexFromCountyNumber(countyNumber);

    if (countyIndex < 0) {
      // Do not mark click as handled, let it propagate, we have nothing sensible to do here
      console.error("ERROR: No such county Found : ", this.getMunicipalityCountyNumber(municipalityIndex));
      return;
    }

    if (this.isMunicipalitySelected(municipalityIndex)) {
      this.setClickHandled();
      const { onClick } = this.props;
      onClick(event, {
        pollingStationName: this.getPollingStationName(index),
        pollingStationNumber: this.getPollingStationNumber(index),
        countyName: this.getCountyName(countyIndex),
        countyNumber: this.getCountyNumber(countyIndex),
        municipalityName: this.getMunicipalityName(municipalityIndex),
        municipalityNumber: this.getMunicipalityNumber(municipalityIndex)
      });
    } else {
      this.handleMunicipalityClick(municipalityIndex, event);
    }
  };

  showPollingStationTooltip = (index, event) => {
    this.fadeInTooltip();

    const { x, y } = this.getPollingStationCenter(index);
    const text = this.getPollingStationName(index);

    this.positionTooltip(text, x, y);

    // Propagate event
    const { onMouseOver } = this.props;
    onMouseOver(event, this.getPollingStationName(index));

    console.log("Show Tooltip : " + this.getPollingStationName(index));
  };

  hidePollingStationTooltip = (index, event) => {
    this.hideTooltip(event);
    console.log("Hide Tooltip : " + this.getPollingStationName(index));
  };

  render() {
    const { id, width, height } = this.props;
    return (
      <div>
        <svg id={id} width={width} height={height} viewBox={"0 0 " + width + " " + height} onClick={e => this.handleClick(e)}>
          <g className="counties">
            {this.state.counties.map((d, i) => (
              <path
                id={this.makeId("county", i)}
                key={`county-${i}`}
                d={geoPath().projection(this.projection())(d)}
                className="county"
                onDoubleClick={e => this.handleCountyClick(i, e)}
                onMouseOver={e => this.showCountyTooltip(i, e)}
                onMouseOut={e => this.hideCountyTooltip(i, e)}
              />
            ))}
          </g>
          <g className="municipalities">
            {this.state.municipalities.map((d, i) => (
              <path
                id={this.makeId("municipality", i)}
                key={`municipality-${i}`}
                d={geoPath().projection(this.projection())(d)}
                className="municipality"
                onClick={e => this.handleMunicipalityClick(i, e)}
                onMouseOver={e => this.showMunicipalityTooltip(i, e)}
                onMouseOut={e => this.hideMunicipalityTooltip(i, e)}
              />
            ))}
          </g>
           <g className="polling_districts">
            {this.state.polling_districts.map((d, i) => (
              <path
                id={this.makeId("polling_district", i)}
                key={`polling_district-${i}`}
                d={geoPath().projection(this.polling_projection())(d)}
                className="polling_district"
                onClick={e => this.handlePollingStationClick(i, e)}
                onMouseOver={e => this.showPollingStationTooltip(i, e)}
                onMouseOut={e => this.hidePollingStationTooltip(i, e)}
              />
            ))}
          </g>
        </svg>
        <div className="tooltip" />
      </div>
    );
  }
}

export default Norway;

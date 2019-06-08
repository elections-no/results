import React from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import counties from "./json/norway-counties.json";
import municipalities from "./json/norway-municipalities.json";

class Norway extends React.Component {
  constructor() {
    super();
    this.state = {
      countiesCollection: [],
      municipalitiesCollection: [],
      counties: [],
      municipalities: []
    };
  }

  projection() {
    const { width, height } = this.props;
    return geoMercator().fitSize([width, height], this.state.countiesCollection);
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
    return this.state.counties[countyIndex].properties.ID_1;
  }

  getCountyName(countyIndex) {
    return this.state.counties[countyIndex].properties.NAME_1;
  }

  isCountySelected(countyIndex) {
    const key = "#" + this.makeId("county", countyIndex);
    const selection = d3.select(key);
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
    onClick(event, this.getCountyNumber(countyIndex), this.getCountyName(countyIndex));
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
      countiesCollection: feature(counties, counties.objects.NOR_adm1),
      municipalitiesCollection: feature(municipalities, municipalities.objects.NOR_adm2),
      counties: feature(counties, counties.objects.NOR_adm1).features,
      municipalities: feature(municipalities, municipalities.objects.NOR_adm2).features
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

  getMunicipalityCountyNumber(municipalityIndex) {
    return this.state.municipalities[municipalityIndex].properties.ID_1;
  }

  getMunicipalityNumber(municipalityIndex) {
    return this.state.municipalities[municipalityIndex].properties.ID_2;
  }

  getMunicipalityName(municipalityIndex) {
    return this.state.municipalities[municipalityIndex].properties.NAME_2;
  }

  getCountyByNumber(countyNumber) {
    const countyIndex = this.getCountyIndexFromCountyNumber(countyNumber);
    return countyIndex >= 0 ? this.getCounty(countyIndex) : undefined;
  }

  getCountyIndexFromCountyNumber(countyNumber) {
    let countyIndex = -1;
    this.state.counties.filter((c, i) => {
      if (c.properties.ID_1 === countyNumber) {
        countyIndex = i;
        return true;
      }
      return false;
    });
    return countyIndex;
  }

  getSelectedCountyFromMunicipalityIndex(municipalityIndex) {
    const countyNumber = this.getMunicipalityCountyNumber(municipalityIndex);
    return this.getCountyByNumber(countyNumber);
  }

  handleMunicipalityClick = (municipalityIndex, event) => {
    const county = this.getSelectedCountyFromMunicipalityIndex(municipalityIndex);

    if (county === undefined) {
      console.error("ERROR: No such county Found : ", this.getMunicipalityCountyNumber(municipalityIndex));
    } else if (county.classed("active")) {
      this.setClickHandled();
      const { onClick } = this.props;
      onClick(event, this.getMunicipalityCountyNumber(municipalityIndex), this.getMunicipalityName(municipalityIndex));
    } else {
      const countyNumber = this.getMunicipalityCountyNumber(municipalityIndex);
      const countyIndex = this.getCountyIndexFromCountyNumber(countyNumber);
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
                onClick={e => this.handleCountyClick(i, e)}
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
        </svg>
        <div className="tooltip" />
      </div>
    );
  }
}

export default Norway;

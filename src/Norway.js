import React from "react";
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

    this.handleCountyClick = this.handleCountyClick.bind(this);
    this.handleClick = this.handleClick.bind(this);
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
    return "" + x + " " + y + " " + width + " " + height;
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

  handleCountyClick(countyIndex) {
    this.setClickHandled();

    const was_selected = this.isCountySelected(countyIndex);
    this.deselectAllCounties();

    if (!was_selected) {
      const selection = this.getCounty(countyIndex);
      this.selectCounty(selection);
      const { x, y, width, height } = this.getBoundingBox(selection);
      this.zoomIn(this.makeViewBoxString(x, y, width, height));
    } else {
      this.zoomOut();
    }

    console.log("Clicked on county: ", this.getCountyName(countyIndex));
    console.log("Clicked on county number: ", this.getCountyNumber(countyIndex));
  }

  zoomIn(view) {
    d3.select("svg").attr("viewBox", view);
  }

  zoomOut() {
    const { width, height } = this.props;
    let view = this.makeViewBoxString(0, 0, width, height);
    d3.select("svg").attr("viewBox", view);
  }

  getCountyNumber(countyIndex) {
    return this.state.counties[countyIndex].properties.ID_1;
  }

  getCountyName(countyIndex) {
    return this.state.counties[countyIndex].properties.NAME_1;
  }

  setClickHandled() {
    d3.select("#" + this.props.id).classed("clicked", true);
  }

  resetClickHandled() {
    d3.select("#" + this.props.id).classed("clicked", false);
  }

  isClickHandled() {
    return d3.select("#" + this.props.id).classed("clicked");
  }

  deselectAllCounties() {
    d3.selectAll("path").classed("active", (d, i, nodes) => {
      const node = d3.select(nodes[i]);
      node.classed("active", false);
    });
  }

  handleClick() {
    if (this.isClickHandled()) {
      this.resetClickHandled();
    } else {
      console.log("Clicked!");
      this.deselectAllCounties();
      this.zoomOut();
    }
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

  render() {
    const { id, width, height } = this.props;
    return (
      <svg id={id} width={width} height={height} viewBox={"0 0 " + width + " " + height} onClick={() => this.handleClick()}>
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
            <path key={`municipality-${i}`} d={geoPath().projection(this.projection())(d)} className="municipality" />
          ))}
        </g>
      </svg>
    );
  }
}

export default Norway;

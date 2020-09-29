import React from "react";
import "./App.css";
import Norway from "./Norway";

class App extends React.Component {

  handleClick = (e, result) => {
    const { pollingStationName, pollingStationNumber, countyName, countyNumber, municipalityName, municipalityNumber } = result;
    if (pollingStationName) {
      console.log("Click happened : " + pollingStationName + " (" + pollingStationNumber + "), " + countyName + " (" + countyNumber + "), " + municipalityName + " (" + municipalityNumber + ")");
    } else if (municipalityName) {
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
        <div className="App-header">
          <p>Election Results for 2019</p>
          <Norway
            id="simple"
            width={1600}
            height={900}
            onClick={this.handleClick}
            onMouseOver={this.handleMouseOver}
            onMouseOut={this.handleMouseOut}
          />
        </div>
      </div>
    );
  }
}

export default App;

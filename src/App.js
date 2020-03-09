import React, { Component } from "react";
import "./App.css";
import fx from "money";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.testInput = React.createRef();
    this.state = {
      currencyList: {},
      inputCountry: "USD",
      outputCountry: "USD",
      inputValue: "$ 0.00",
      outputValue: "$ 0.00"
    };
  }

  componentDidMount() {
    const currencyApi =
      "https://gist.githubusercontent.com/mddenton/062fa4caf150bdf845994fc7a3533f74/raw/27beff3509eff0d2690e593336179d4ccda530c2/Common-Currency.json";
    fetch(currencyApi)
      .then(res => res.json())
      .then(res => this.setState({ currencyList: res }));

    const moneyApi = "https://api.exchangeratesapi.io/latest?base=USD";
    fetch(moneyApi)
      .then(res => res.json())
      .then(data => {
        if (typeof fx !== "undefined" && fx.rates) {
          fx.rates = data.rates;
          fx.base = data.base;
        } else {
          var fxSetup = {
            rates: data.rates,
            base: data.base
          };
        }
      });
  }

  createLabel = props => {
    const { currencyList } = this.state;
    const { handleChange, country } = this.props;
    const list = Object.keys(currencyList).map((element, index) => {
      return (
        <option key={index} value={element}>
          {element}
        </option>
      );
    });
    return list;
  };

  handleInputCountry = e => {
    const { currencyList, inputValue, outputCountry } = this.state;
    const inputCountry = e.target.value;
    if (!fx.rates[inputCountry]) {
      alert("Sorry, selected country is not available");
    } else {
      const symbol = currencyList[inputCountry].symbol;
      const value = inputValue.replace(/\D+/g, "");
      const newValue = symbol + " " + value;
      const outputSymbol = currencyList[outputCountry].symbol;
      const outputValue = outputSymbol + " " + this.convertRate(value);
      this.setState({
        inputCountry: inputCountry,
        inputValue: newValue,
        outputValue: outputValue
      });
    }
  };

  handleOutputCountry = e => {
    const { currencyList, inputValue } = this.state;
    const outputCountry = e.target.value;
    const outputSymbol = currencyList[outputCountry].symbol;
    if (!fx.rates[outputCountry]) {
      alert("Sorry, selected country is not available");
    } else {
      const value = inputValue.replace(/\D+/g, "");
      const outputValue = outputSymbol + " " + this.convertRate(value);
      this.setState({
        outputCountry: e.target.value,
        outputValue: outputValue
      });
    }
  };

  handleInputChange = e => {
    const { currencyList, inputCountry, outputCountry } = this.state;
    const value = e.target.value.replace(/\D+/g, "");
    const inputSymbol = currencyList[inputCountry].symbol;

    const outputSymbol = currencyList[outputCountry].symbol;
    const outputValue = outputSymbol + " " + this.convertRate(value);
    const newValue = inputSymbol + " " + value;
    this.setState({ inputValue: newValue, outputValue: outputValue });
  };

  convertRate = value => {
    const { inputCountry, outputCountry } = this.state;
    fx.settings = { from: inputCountry, to: outputCountry };
    const outputValue = fx.convert(value).toFixed(2);
    return outputValue;
  };

  render() {
    return (
      <div>
        <label>
          From
          <select
            value={this.state.inputCountry}
            onChange={this.handleInputCountry}
          >
            <this.createLabel />
          </select>
          <span className="dollar">
            <input
              ref={this.testInput}
              value={this.state.inputValue}
              onChange={this.handleInputChange}
            />
          </span>
        </label>

        <label>
          To
          <select
            value={this.state.outputCountry}
            onChange={this.handleOutputCountry}
          >
            <this.createLabel />
          </select>
          <input value={this.state.outputValue} readOnly />
        </label>
      </div>
    );
  }
}

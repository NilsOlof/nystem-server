import React from "react";
import app from "nystem";
import { SelectInput } from "nystem-components";

class DateExposedYearMonth extends React.Component {
  constructor(props) {
    super(props);
    this.model = props.model;
    this.props.view.searchProp.onUpdate(this.update);
    this.classNameBase = this.model.className ? this.model.className : [];
    this.updateCounter = 0;
    this.years = [];
    const thisYear = new Date().getFullYear();
    for (
      let i = this.model.fromYear ? this.model.fromYear : 2012;
      i <= thisYear;
      i++
    )
      this.years.push(i.toString());
    this.months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Oct",
      "Nov",
      "Dec"
    ];
  }
  update(data) {
    if (this.id) {
      const state = {};
      const modelId = this.model.id;

      state.from = this.props.view.searchProp.filter.get(`${this.id}_from`);
      if (typeof state.from !== "undefined" && state.from[modelId])
        state.from = state.from[modelId].substring(1);
      else delete state.from;

      state.to = this.props.view.searchProp.filter.get(`${this.id}_to`);
      if (typeof state.to !== "undefined" && state.to[modelId])
        state.to = state.to[modelId].substring(1);
      else delete state.to;
      if (typeof state.from !== "undefined" || typeof state.to !== "undefined")
        this.setState(state);
    }
    const self = this;
    if (this.updateCounter > 0) this.updateCounter--;
    if (this.state.className === "" || this.updateCounter > 0) return;
    this.setState({
      className: "has-success"
    });
    this.delayTimer = setTimeout(() => {
      if (self.isMounted())
        self.setState({
          className: ""
        });
    }, 1000);
  }
  search(id, value) {
    const self = this;
    function daysInMonth(year, month) {
      return new Date(year, month, 0).getDate();
    }
    clearTimeout(this.delayTimer);
    let state = {
      className: "has-warning"
    };
    self.updateCounter++;
    state = app().utils.clone(self.state);
    if (id === "year") {
      if (!value) {
        state.from = undefined;
        state.to = undefined;
      } else {
        state.from = `>${new Date(`${value}-01-01`).getTime()}`;
        state.to = `<${new Date(`${value}-12-31`).getTime()}`;
      }
    }
    if (id === "month") {
      const year = app()
        .utils.moment(parseInt(state.from, 10))
        .format("YYYY");
      if (!value) {
        state.from = `>${new Date(`${year}-01-01`).getTime()}`;
        state.to = `>${new Date(`${year}-12-31`).getTime()}`;
      } else {
        const month = this.months.indexOf(value) + 1;
        state.from = `>${new Date(`${year}-${month}-01`).getTime()}`;
        state.to = `<${new Date(
          `${year}-${month}-${daysInMonth(year, month)}`
        ).getTime()}`;
      }
    }
    if (self.state.from !== state.from)
      self.props.view.searchProp.filter.add(
        self.model.id,
        state.from,
        `${self.id}_from`
      );
    if (self.state.to !== state.to)
      self.props.view.searchProp.filter.add(
        self.model.id,
        state.to,
        `${self.id}_to`
      );
    if (state.from) state.from = state.from.substring(1);
    if (state.to) state.to = state.to.substring(1);
    this.setState(state);
  }
  componentDidMount() {}
  componentWillUnmount() {
    this.props.view.searchProp.offUpdate(this.update);
    clearTimeout(this.delayTimer);
  }
  render() {
    const { state } = this;
    const { model } = this.props;
    const self = this;
    const className =
      model.className && !this.props.wrapper ? model.className.join(" ") : "";
    const modelYear = {
      id: "year",
      option: this.years,
      render: "button",
      limit: 1,
      text: "Year"
    };
    const modelMonth = {
      id: "month",
      option: this.months,
      render: "button",
      limit: 1,
      text: "Month",
      inputWidth: "col-sm-11",
      labelWidth: "col-sm-1"
    };
    const style = {
      width: "150px"
    };
    const year = state.from
      ? app()
          .utils.moment(parseInt(state.from, 10))
          .format("YYYY")
      : undefined;
    let month = null;
    function monthSelector() {
      if (!year) return null;
      const from = app()
        .utils.moment(parseInt(state.from, 10))
        .format("MM");
      const to = app()
        .utils.moment(parseInt(state.to, 10))
        .format("MM");
      if (from === to) month = self.months[parseInt(from, 10) - 1];

      return (
        <SelectInput
          style={style}
          model={modelMonth}
          value={month}
          setValue={self.search}
        />
      );
    }
    return (
      <div className={`${className} form-group row form-inline`}>
        <SelectInput
          style={style}
          model={modelYear}
          value={year}
          setValue={this.search}
        />
        {monthSelector()}
      </div>
    );
  }
}
export default DateExposedYearMonth;

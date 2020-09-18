import React from "react";

class MultigroupSortBy extends React.Component {
  constructor(props) {
    super(props);
    this.model = props.model;
    this.props.view.searchProp.onUpdate(this.update);
    return {
      isSortBy: props.view.searchProp.isSortBy
        ? props.view.searchProp.isSortBy(this.model.id)
        : false
    };
  }
  update(data) {
    const isSortBy = this.props.view.searchProp.isSortBy(this.model.id);
    if (isSortBy !== this.state.isSortBy)
      this.setState({
        isSortBy: isSortBy
      });
  }
  handleSort(event) {
    let href = event.target.getAttribute("href");
    if (!href && event.target)
      href = event.target.parentNode.getAttribute("href");
    this.props.view.searchProp.sortBy(href);
    return false;
  }
  componentWillUnmount() {
    this.props.view.searchProp.offUpdate(this.update);
  }
  render() {
    const { model } = this;
    const className = model.className ? model.className.join(" ") : "";
    if (this.state.isSortBy)
      return (
        <div className={className}>
          {model.text} <span className={`fa fa-arrow-${this.state.isSortBy}`} />
        </div>
      );
    return <div className={className}>{model.text}</div>;
  }
}
export default MultigroupSortBy;

import { Component } from "react";
import { Button } from "nystem-components";

class BootstrapDropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: this.props.expanded,
    };
  }
  toggleExpand() {
    this.setState({
      expanded: !this.state.expanded,
    });
  }
  render() {
    function headerContent() {
      return <div />;
    }
    const self = this;
    const headerProps = this.props.children[0].props;
    const headerChildren =
      headerProps.children instanceof Array
        ? headerProps.children.map(headerContent)
        : headerProps.children;
    let typeClass = this.props.type ? this.props.type : "";
    if (!headerProps) return null;
    function menuItem(item) {
      return <li>{item}</li>;
    }
    function bodyContent() {
      if (self.state.expanded)
        return (
          <ul className="dropdown-menu" role="menu">
            {self.props.children.slice(1).map(menuItem)}
          </ul>
        );
      return "";
    }
    if (this.props.className) typeClass += ` ${this.props.className}`;
    if (this.state.expanded) typeClass += " open";
    return (
      <div className={`btn-group${typeClass}`}>
        <Button type="secondary" onClick={this.toggleExpand}>
          {headerChildren} <span className="caret" />
        </Button>
        {bodyContent()}
      </div>
    );
  }
}
export default BootstrapDropdown;

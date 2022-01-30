import React from "react";
import { Wrapper } from "nystem-components";

class OverlayOverlay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
    };
  }
  findPosition(obj) {
    const pos = { x: 0, y: 0 };
    while (1) {
      pos.x += obj.offsetLeft;
      pos.y += obj.offsetTop;
      if (!obj.offsetParent) return pos;
      obj = obj.offsetParent;
    }
  }
  getScroll() {
    if (window.pageYOffset !== undefined)
      return { x: window.pageXOffset, y: window.pageYOffset };

    const r = document.documentElement;
    const b = document.body;
    const sx = r.scrollLeft || b.scrollLeft || 0;
    const sy = r.scrollTop || b.scrollTop || 0;
    return { x: sx, y: sy };
  }
  onMouseDown(event) {
    // eslint-disable-next-line react/no-string-refs
    const { modal } = this.refs;
    this.at = {
      start: {
        x: event.clientX,
        y: event.clientY,
      },
      obj: this.findPosition(modal),
      pos: {
        x: event.clientX,
        y: event.clientY,
      },
    };
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (nextState === this.state) return false;
    return true;
  }
  componentDidMount() {
    this.setState({ mounted: true });
  }
  render() {
    const add = this.state.mounted ? "--active" : "";
    return (
      <Wrapper className={`overlay-background overlay-background${add}`}>
        <Wrapper className={`overlay-contents overlay-contents${add}`}>
          {this.props.children}
        </Wrapper>
      </Wrapper>
    );
  }
}
export default OverlayOverlay;

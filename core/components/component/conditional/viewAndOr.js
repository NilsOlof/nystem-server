import React from "react";
import { Wrapper } from "nystem-components";

class ConditionalViewAndOr extends React.Component {
  constructor(props) {
    super(props);
    this.model = props.model;
    this.view = props.view;
    const state = {
      value: this.view.value,
    };
    if (!state.value) state.value = {};
    state.visible = this.testCondition(state.value);
    this.view.on("change", this.onChange);
    this.tempValue = {};
    this.state = state;
  }
  setValue(id, value) {
    return this.view.setValue(id, value);
  }
  onChange() {
    if (this.changeTimer) clearTimeout(this.changeTimer);
    this.changeTimer = setTimeout(this.setValueView, 0);
  }
  setValueView() {
    this.changeTimer = false;
    if (this.inThis) return;
    this.inThis = true;
    const { value } = this.view;
    const visible = this.testCondition(value);
    /* if (!visible && this.state.visible)
      for (let i=0;i<this.model.item.length;i++){
        if (this.model.item[i].id){
          this.tempValue[this.model.item[i].id] = value[this.model.item[i].id];
          this.setValue(this.model.item[i].id);
        } else
        if (this.model.item[i].item){
          for (let j=0;j<this.model.item[i].item.length;j++)
            if (this.model.item[i].item[j].id)
              this.setValue(this.model.item[i].item[j].id);
        } else
        if (this.refs['component'+i].clear)
          this.refs['component'+i].clear();
      } else
      if (visible && !this.state.visible)
        for (let i=0;i<this.model.item.length;i++)
          if (this.model.item[i].id && typeof value[this.model.item[i].id] === 'undefined')
            this.setValue(this.model.item[i].id,this.tempValue[this.model.item[i].id]); */

    this.setState({
      value: value,
      visible: visible,
    });
    this.inThis = false;
  }
  valid() {
    let valid = true;
    if (this.state.visible)
      for (let i = 0; i < this.model.item.length; i++)
        // eslint-disable-next-line react/no-string-refs
        if (!this.refs[`component${i}`].valid()) valid = false;
    return valid;
  }
  visible() {
    return this.state.visible;
  }
  testCondition(value) {
    const { condition } = this.model;
    if (!condition || !condition.length) return false;

    function testOneCondition(condition) {
      const key = condition[0];
      const val = value[key];
      let test = condition[1];
      if (test === "false" || test === false) return !val;
      if (test === "true" || test === true) return !!val;
      const reverse = test[0] === "!";
      if (reverse) test = test.substring(1);
      test = new RegExp(`^${test}$`, "i");
      if (test.test(val)) {
        if (!reverse) return true;
      } else if (reverse) return true;
      return false;
    }

    let valid = true;
    let sum = false;
    const sumValidator = (condition) => {
      let sum = 0;
      condition = condition.split("||");
      return function (valid) {
        if (typeof valid !== "undefined" && valid) sum++;
        for (let i = 0; i < condition.length; i++)
          if (parseInt(condition[i], 10) === sum) return true;
        return false;
      };
    };
    for (let i = 0; i < condition.length; i++) {
      if (condition[i][0] === "||") {
        if (sum) {
          valid = sum();
          sum = false;
        }
        if (valid) return true;
        valid = true;
      } else if (condition[i][0] === "<sum>") {
        sum = sumValidator(condition[i][1]);
      } else if (sum) sum(testOneCondition(condition[i]));
      else valid = testOneCondition(condition[i]) && valid;
    }
    if (sum) valid = sum();
    return valid;
  }
  componentWillUnmount() {
    this.props.view.off("change", this.onChange);
  }
  render() {
    const { model, view } = this.props;
    if (this.state.visible)
      return (
        <Wrapper className={model.className}>
          {model.item.map(view.createItem, this)}
        </Wrapper>
      );
    return null;
  }
}
export default ConditionalViewAndOr;

import app from "nystem";
import PropTypes from "prop-types";
import { BackHandler } from "react-native";

class RouterBackHandler extends React.Component {
  constructor(props) {
    super(props);
    this.hardwareBackPress = this.hardwareBackPress.bind(this);
    this.state = {};
  }
  hardwareBackPress(context) {
    const history = this.context.router.history;
    app()
      .event("overlay", {})
      .then((data) => {
        if (data.open && Object.keys(data.open).length)
          app().event("overlay", { do: "close" });
        else if (history.canGo(-1)) history.go(-1);
        else BackHandler.exitApp();
      });
    return true;
  }
  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.hardwareBackPress);
  }
  componentWillUnmount() {
    BackHandler.removeEventListener(
      "hardwareBackPress",
      this.hardwareBackPress
    );
  }
  render() {
    return null;
  }
}
RouterBackHandler.contextTypes = {
  router: PropTypes.object,
};
export default RouterBackHandler;

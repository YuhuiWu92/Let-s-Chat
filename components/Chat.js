import React from "react";
import { View, Text } from "react-native";

export default class Chat extends React.Component {
  render() {
    let { name } = this.props.route.params;
    this.props.navigation.setOptions({ title: name });
    const { BGColor } = this.props.route.params;
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: BGColor,
        }}
      >
        <Text>Hello Chat!</Text>
      </View>
    );
  }
}

import React, { Component } from "react";
import { StyleSheet, View, Text, TextInput } from "react-native";
import { useState } from "react";

export default function HelloWorld() {
  const [displayedWroteText, setDisplayedWroteText] = useState("");
  const [message, setMessage] = useState([]);

  function getInputHandler(enteredText) {
    setDisplayedWroteText(enteredText);
  }
  function addToMessageHandler() {
    setMessage((currentMessage) => [...currentMessage, displayedWroteText]);
  }
  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <TextInput
        style={{ flex: 1, justifyContent: "center" }}
        placeholder="Type here..."
        onChangeText={getInputHandler}
      />
      <Button
        onPress={() => {
          addToMessageHandler;
        }}
        title="Press Me"
      />
      <Text>You wrote: {enteredText}</Text>
    </View>
  );
}

/* const styles = StyleSheet.create({}); */

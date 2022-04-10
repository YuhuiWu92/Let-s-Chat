import React from "react";
import { View, Platform, KeyboardAvoidingView } from "react-native";
import { Bubble, GiftedChat, InputToolbar } from "react-native-gifted-chat";
import * as firebase from "firebase";
import "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
const firebaseConfig = {
  apiKey: "AIzaSyDR2dfMQ-LEJsK1Ler79a_JL4e189k7Xqw",
  authDomain: "let--s-chat-1be9e.firebaseapp.com",
  projectId: "let--s-chat-1be9e",
  storageBucket: "let--s-chat-1be9e.appspot.com",
  messagingSenderId: "39544552828", //no  measurementId
};

export default class Chat extends React.Component {
  constructor(props) {
    super();
    this.state = {
      messages: [],
      uid: 0,
      user: {
        _id: "",
        name: "",
        avatar: "",
      },
      isConnected: false,
      image: null,
    };

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    this.referenceChatUser = null;
    this.referenceChatMessages = firebase.firestore().collection("messages");
  }
  //get message from asyncStorage
  async getMessages() {
    let messages = "";
    try {
      messages = (await AsyncStorage.getItem("messages")) || [];
      this.setState({
        messages: JSON.parse(messages),
      });
    } catch (error) {
      console.log(error.message);
    }
  }
  //save messages
  async saveMessages() {
    try {
      await AsyncStorage.setItem(
        "messages",
        JSON.stringify(this.state.messages)
      );
    } catch (error) {
      console.log(error.message);
    }
  }
  async deleteMessages() {
    try {
      await AsyncStorage.removeItem("messages");
      this.setState({
        messages: [],
      });
    } catch (error) {
      console.log(error.message);
    }
  }
  componentDidMount() {
    //set name to name selected on start page
    let { name } = this.props.route.params;
    // Adds the name to top of screen
    this.props.navigation.setOptions({ title: name });

    //Check if the user is off- or online
    NetInfo.fetch().then((connection) => {
      if (connection.isConnected) {
        this.setState({ isConnected: true });
        console.log("online");

        // listens for updates in the collection
        this.unsubscribe = this.referenceChatMessages
          .orderBy("createdAt", "desc")
          .onSnapshot(this.onCollectionUpdate);

        //listen to authentication events, sign in anonymously
        this.authUnsubscribe = firebase
          .auth()
          .onAuthStateChanged(async (user) => {
            if (!user) {
              return await firebase.auth().signInAnonymously();
            }

            //update user state with currently active user data
            this.setState({
              uid: user.uid,
              messages: [],
              user: {
                _id: user.uid,
                name: name,
                avatar: "https://placeimg.com/140/140/any",
              },
            });

            //referencing messages of current user
            this.referenceChatUser = firebase
              .firestore()
              .collection("messages")
              .where("uid", "==", this.state.uid);
          });
        //save messages when online
        this.saveMessages();
      } else {
        // the user is offline
        this.setState({ isConnected: false });
        console.log("offline");
        //retrieve chat from asyncstorage
        this.getMessages();
      }
    });
  }

  //update Collection
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      let data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: {
          _id: data.user._id,
          name: data.user.name,
          avatar: data.user.avatar,
        },
        image: data.image || null,
      });
    });
    this.setState({
      messages: messages,
    });
    this.saveMessages();
  };
  //unsubscribe from collection updates
  componentWillUnmount() {
    if (this.state.isConnected) {
      // stop authentication and listen to change
      this.authUnsubscribe();
      this.unsubscribe();
    }
  }

  onSend(messages = []) {
    this.setState(
      (previousState) => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        this.addMessages();
        this.saveMessages();
      }
    );
  }
  //add new message to database
  addMessages() {
    const message = this.state.messages[0];
    this.referenceChatMessages.add({
      uid: this.state.uid,
      _id: message._id,
      text: message.text || "",
      createdAt: message.createdAt,
      user: this.state.user,
      image: message.image || "",
    });
  }
  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#1e085a",
          },
        }}
      />
    );
  }
  renderInputToolbar(props) {
    if (this.state.isConnected == false) {
    } else {
      return <InputToolbar {...props} />;
    }
  }
  render() {
    //entered name state from Start screen gets displayed in status bar at the top of the app
    let { bgColor } = this.props.route.params;
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: bgColor,
        }}
        accessible={true}
      >
        <GiftedChat
          renderBubble={this.renderBubble.bind(this)}
          renderInputToolbar={this.renderInputToolbar.bind(this)}
          messages={this.state.messages}
          //user={this.state.user}
          onSend={(messages) => this.onSend(messages)}
          user={{
            _id: this.state.user._id,
            name: this.state.name,
            avatar: this.state.user.avatar,
          }}
        />

        {Platform.OS === "android" ? (
          <KeyboardAvoidingView behavior="height" />
        ) : null}
      </View>
    );
  }
}

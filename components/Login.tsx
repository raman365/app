import React, { useState, useEffect } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth"; // Import signInWithEmailAndPassword
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { doc, setDoc } from "firebase/firestore";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Define the type for the navigation prop
  type NavigationProp = StackNavigationProp<YourStackParamList, "Component">;

  type YourStackParamList = {
    Component: undefined;
  };

  // Inside your functional component
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Reset input fields when the component becomes focused
      setUsername("");
      setPassword("");
    });

    // Cleanup function
    return unsubscribe;
  }, [navigation]);

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, username, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("User found:");
        console.log("Email:", user.email);
        console.log("User ID:", user.uid);
        navigation.navigate("Component"); // Navigate to MyComponent screen upon successful login
      })
      .catch((error) => {
        const errorMessage = error.message;
        console.error("Error:", errorMessage);
      });
  };

  const handleRegister = () => {
    createUserWithEmailAndPassword(auth, username, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("User registered successfully:");
        console.log("Email:", user.email);
        console.log("User ID:", user.uid);

        // Create a document under "users" collection with the new user's ID
        const userRef = doc(db, "users", user.uid);
        setDoc(userRef, {}); // Set the document data

        navigation.navigate("Component"); // Navigate to MyComponent screen upon successful registration
      })
      .catch((error) => {
        const errorMessage = error.message;
        console.error("Error:", errorMessage);
      });
  };

  return (
    <LinearGradient
      colors={["#ffffff", "#ffffff", "#dddddd", "#aaaaaa"]}
      style={styles.container}
    >
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <View style={{ height: 10 }}></View>
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: "80%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "black",
    padding: 10,
    borderRadius: 5,
    width: "30%",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

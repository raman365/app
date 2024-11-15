import React, { useState, useEffect } from "react";
import Component from "./components/MyComponent";
import StartScreen from "./components/StartScreen";
import Login from "./components/Login";
import WebViewScreen from "./components/WebView";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { auth } from "./components/firebase";

export default function App() {
  const Stack = createNativeStackNavigator();

  const [initialRoute, setInitialRoute] = useState<string>("StartScreen");

  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: "transparent", // Set the background color of the theme to transparent
    },
  };

  /* Remove this comment when testing to see if authworks on loading back in

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is authenticated
        console.log("User is authenticated:", user.uid);
        setInitialRoute("Component");
      } else {
        // User is not authenticated
        console.log("User is not authenticated");
        setInitialRoute("StartScreen");
      }
    });

    // Cleanup function
    return () => unsubscribe();
  }, []); 
  
  */

  return (
      <NavigationContainer theme={theme}>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{ headerShown: false, gestureEnabled: false }}
        >
          <Stack.Screen name="StartScreen" component={StartScreen} />
          <Stack.Screen name="Component" component={Component} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="WebView" component={WebViewScreen} />
        </Stack.Navigator>
      </NavigationContainer>
  );
}

import React, { useEffect, useState } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { Button, Text } from "react-native-elements";
import { View, Image, Animated, Easing } from "react-native";
import LottieView from "lottie-react-native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";

type YourStackParamList = {
  StartScreen: undefined; // Screen with no parameters
  Component: undefined;
  Login: undefined;
  WebView: undefined;
};

// Define the type for the navigation prop
type StartScreenNavigationProp = StackNavigationProp<
  YourStackParamList,
  "StartScreen"
>;

interface StartScreenProps {
  navigation: StartScreenNavigationProp;
}

const StartScreen: React.FC<StartScreenProps> = ({ navigation }) => {
  const spinValue = new Animated.Value(0);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  Animated.loop(
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 5000,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  ).start();

  const goToWebViewScreen = () => {
    navigation.navigate("WebView");
  };

  const goToLoginScreen = () => {
    navigation.navigate("Login");
  };

  // Temperature START
  const [temperature, setTemperature] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const apiKey = "3b92a1966f4e76f1e4d6baf43e74c9fd";
        const lat = "51.55621730214603";
        const lon = "-0.14813111622004224";
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

        const response = await axios.get(apiUrl);
        const temp = response.data.main.temp.toFixed(2);
        setTemperature(temp);
      } catch (err) {
        setError("Error fetching weather data");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);
  // Temperature END

  return (
    <LinearGradient
      colors={["#ffffff", "#ffffff", "#dddddd", "#aaaaaa"]} // Set your cloudy gradient colors
      style={{ flex: 1 }}
    >
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 50,
      }}
    >
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 250,
          zIndex: 1000,
        }}
      >
        <LottieView
          style={{ flex: 1 }}
          source={require("./../assets/confetti.json")}
          autoPlay
          loop
          speed={1}
        />
      </View>
      <Image
        source={require("./../assets/image021.gif")}
        style={{ width: "100%", marginLeft: 40, marginBottom: 40 }}
        resizeMode="contain"
      />
      <Animated.Image
        source={require("./../assets/react-512.webp")}
        style={{
          width: 100,
          height: 100,
          marginBottom: 200,
          transform: [{ rotate: spin }],
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.5,
          shadowRadius: 4,
        }}
        resizeMode="contain"
      />
      <Button
        title="Log in"
        onPress={goToLoginScreen}
        buttonStyle={{
          backgroundColor: "black",
          borderRadius: 5,
          paddingVertical: 15,
          width: 300,
        }}
        titleStyle={{
          color: "white",
          fontWeight: "bold",
        }}
      />
      <View style={{ height: 10 }}></View>
      <Button
        title="WebView"
        onPress={goToWebViewScreen}
        buttonStyle={{
          backgroundColor: "black",
          borderRadius: 5,
          paddingVertical: 15,
          width: 300,
        }}
        titleStyle={{
          color: "white",
          fontWeight: "bold",
        }}
      />
      <View style={{ position: "absolute", left: 65, bottom: 100 }}>
        <Text style={{ fontSize: 20 }}>
          Current Weather at STM:{" "}
          {loading ? (
            "Loading..."
          ) : error ? (
            error
          ) : (
            <Text style={{ fontWeight: "bold" }}>{`${temperature}°C`}</Text>
          )}
        </Text>
      </View>
    </View>
    </LinearGradient>
  );
};

export default StartScreen;

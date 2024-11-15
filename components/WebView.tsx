import React, { useState } from "react";
import { SafeAreaView, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";

const WebViewScreen = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#d5ecf1" }}>
      <WebView
        source={{ uri: "https://papercafe.co.uk" }}
        style={{ flex: 1 }}
        javaScriptEnabled={true} // Enable JavaScript execution
        domStorageEnabled={true} // Enable DOM storage for cookies and local storage
        startInLoadingState={true} // Show a loading indicator while the page is loading
        renderLoading={() => (
          <ActivityIndicator
            size="large"
            color="#d5ecf1" // Change color as needed
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        )}
        onLoadStart={() => setIsLoading(true)}
        onLoad={() => setIsLoading(false)}
      />
    </SafeAreaView>
  );
};

export default WebViewScreen;

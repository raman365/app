import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Keyboard,
} from "react-native";
import { Text, Button, Icon } from "react-native-elements";
import { makeStyles } from "@rneui/themed";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  deleteField,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";

export default function App() {
  const styles = useStyles();
  const [task, setTask] = useState<string>("");
  const [tasks, setTasks] = useState<
    {
      [x: string]: any;
      text: string;
      editing: boolean;
    }[]
  >([]);
  const [gradientColors, setGradientColors] = useState(["#434343", "#000000"]);
  const [iconColor, setIconColor] = useState("white");
  const [buttontextColor, setbuttontextColor] = useState("black");
  const [editedTask, setEditedTask] = useState("");
  const [userId, setUserId] = useState<string | null>(null); // State to store the user ID

  useEffect(() => {
    // Fetch tasks when component mounts
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;
        const userRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(userRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const userTasks = Object.entries(userData)
            .filter(
              ([key, value]) =>
                key.startsWith("task") && typeof value === "string"
            )
            .map(([key, value]) => ({ id: key, text: value, editing: false }));

          // Sort tasks based on their numerical order
          userTasks.sort((a, b) => {
            const indexA = parseInt(a.id.replace("task", ""));
            const indexB = parseInt(b.id.replace("task", ""));
            return indexA - indexB;
          });

          setTasks(userTasks);
        } else {
          console.error("User document not found for current user");
        }
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Your functions for handling editing, deleting tasks, etc.

  useEffect(() => {
    // Check if there's an authenticated user
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid); // Set the user ID if authenticated
      } else {
        setUserId(null); // Reset user ID if not authenticated
      }
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleAddTask = async () => {
    if (task.trim() !== "") {
      try {
        // Check if user is authenticated
        if (!userId) {
          console.error("User is not authenticated");
          return;
        }

        // Create a reference to the user's document
        const userDocRef = doc(db, "users", userId);

        // Get the user's document data
        const userDocSnap = await getDoc(userDocRef);
        const userData = userDocSnap.data();

        // Check if user document exists and has data
        if (!userDocSnap.exists() || !userData) {
          console.error("User document not found or has no data");
          return;
        }

        // Determine the numerical key for the new task
        const nextKey =
          Object.keys(userData).filter((key) => key.startsWith("task")).length +
          1;

        // Update the user's document with the new task
        await updateDoc(userDocRef, {
          [`task${nextKey}`]: task,
        });

        // Fetch tasks again to reflect the changes
        fetchTasks();

        setTask("");
        Keyboard.dismiss(); // Dismiss the keyboard
      } catch (error) {
        console.error("Error adding task: ", error);
      }
    }
  };

  const handleDeleteTask = async (index: number) => {
    try {
      const updatedTasks = [...tasks];
      const deletedTask = updatedTasks.splice(index, 1)[0]; // Remove the task at the specified index
      setTasks(updatedTasks); // Update the local state

      // Get the user's document reference
      const user = auth.currentUser;
      if (!user) {
        console.error("User not authenticated");
        return;
      }
      const userId = user.uid;
      const userRef = doc(db, "users", userId);

      swipeableRefs.current[index]?.reset(); // Close the swipeable

      // Delete the current task field from Firestore
      await updateDoc(userRef, {
        [deletedTask.id]: deleteField(), // Delete the current task field
      });

      // Re-index the remaining tasks in Firestore
      for (let i = index; i < updatedTasks.length; i++) {
        const taskId = `task${i + 1}`; // Increment the index by 1 to match the new order
        const currentTask = updatedTasks[i];
        await updateDoc(userRef, {
          [taskId]: currentTask.text, // Update the field with the new index
        });
      }

      // Delete the very last field from Firestore
      const lastTaskId = `task${updatedTasks.length + 1}`; // Get the ID of the last field
      await updateDoc(userRef, {
        [lastTaskId]: deleteField(), // Delete the last field
      });

      console.log("Task deleted successfully in Firestore");
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleEditTask = (index: number) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].editing = true;
    setTasks(updatedTasks);
    setEditedTask(updatedTasks[index].text);
  };

  const handleSaveTask = async (index: number) => {
    try {
      const updatedTasks = [...tasks];
      const editedText = editedTask.trim(); // Trim the edited text to remove leading and trailing whitespaces
      updatedTasks[index].text = editedTask;
      updatedTasks[index].editing = false;
      setTasks(updatedTasks);

      if (editedText === "") {
        // If edited text is empty, call handleDeleteTask to delete the task
        handleDeleteTask(index);
        return;
      }

      // Get the user's document reference
      const user = auth.currentUser;
      if (!user) {
        console.error("User not authenticated");
        return;
      }
      const userId = user.uid;
      const userRef = doc(db, "users", userId);

      // Construct the updated data object for Firestore
      const updatedData: { [key: string]: string } = {};
      updatedTasks.forEach((task, i) => {
        updatedData[`task${i + 1}`] = task.text; // Update the task with the new text
      });

      // Update the user's document on Firestore
      await updateDoc(userRef, updatedData);

      console.log("Task updated successfully in Firestore");
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const switchTheme = () => {
    // Toggle between two sets of colors
    setGradientColors(
      gradientColors[0] === "#434343"
        ? ["#ece9e6", "#ffffff"]
        : ["#434343", "#000000"]
    );
    // Toggle icon color between white and black
    setIconColor(iconColor === "white" ? "black" : "white");
    setbuttontextColor(buttontextColor === "black" ? "white" : "black");
  };

  // Define the type for the navigation prop
  type NavigationProp = StackNavigationProp<YourStackParamList, "Login">;

  type YourStackParamList = {
    Login: undefined;
    StartScreen: undefined;
  };

  // Inside your functional component
  const navigation = useNavigation<NavigationProp>();
  const handleBackPress = async () => {
    try {
      // Sign out the user
      await auth.signOut();
      // Navigate to the login page
      navigation.navigate('StartScreen');
      console.log("Signed Out");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const swipeableRefs = useRef<Array<Swipeable | null>>(
    Array(tasks.length).fill(null)
  );

  const handleSwipeOpen = (index: number) => {
    swipeableRefs.current.forEach((swipeable, i) => {
      if (swipeable && i !== index) {
        swipeable.reset();
      }
    });
  };

  return (
    <LinearGradient
      colors={gradientColors}
      start={[0, 0]}
      end={[1, 1]}
      style={styles.container}
    >
      <SafeAreaView style={styles.content}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={{ alignItems: "flex-end" }}
        >
          <Text style={{ color: "red", fontSize: 20 }}>Sign Out</Text>
        </TouchableOpacity>
        <Text h3 style={[styles.title, { color: iconColor }]}>
          TO DO LIST
        </Text>
        <TextInput
          style={[styles.input, { color: iconColor, borderColor: iconColor }]}
          placeholder="Enter task"
          placeholderTextColor={iconColor}
          value={task}
          onChangeText={(text) => setTask(text)}
        />
        <Button
          title="Add Task"
          onPress={handleAddTask}
          buttonStyle={[styles.button, { backgroundColor: iconColor }]}
          titleStyle={[styles.buttonText, { color: buttontextColor }]}
        />
        <ScrollView showsVerticalScrollIndicator={false}>
          {tasks.map((task, index) => (
            <GestureHandlerRootView key={index} style={{ flex: 1 }}>
              <Swipeable
                ref={(swipeable) => {
                  swipeableRefs.current[index] = swipeable; // Store swipeable ref
                }}
                friction={2}
                overshootRight={false}
                rightThreshold={25}
                renderRightActions={() => (
                  <View
                    style={{
                      width: "40%",
                      justifyContent: "center",
                      alignItems: "flex-end",
                      paddingRight: 5,
                      borderBottomWidth: 1,
                      borderBottomColor: iconColor,
                    }}
                  >
                    <Text
                      style={{ color: "red" }}
                      onPress={() => handleDeleteTask(index)}
                    >
                      DELETE TASK
                    </Text>
                  </View>
                )}
                onSwipeableWillOpen={() => handleSwipeOpen(index)}
              >
                <View
                  key={index}
                  style={[
                    styles.taskContainer,
                    { borderBottomColor: iconColor },
                  ]}
                >
                  <View style={styles.bulletpoint}>
                    <Icon name="circle" size={10} color={iconColor} />
                  </View>
                  <View style={styles.textContainer}>
                    {task.editing ? (
                      <TextInput
                        style={[
                          styles.input,
                          { color: iconColor, borderColor: iconColor },
                        ]}
                        value={editedTask}
                        onChangeText={(text) => setEditedTask(text)}
                        onBlur={() => handleSaveTask(index)}
                        autoFocus
                      />
                    ) : (
                      <Text style={[styles.task, { color: iconColor }]}>
                        {task.text}
                      </Text>
                    )}
                  </View>
                  <View style={styles.iconContainer}>
                    {!task.editing && (
                      <TouchableOpacity onPress={() => handleEditTask(index)}>
                        <Icon
                          name="edit"
                          type="material"
                          color={iconColor}
                          size={20}
                        />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => handleDeleteTask(index)}>
                      <Icon
                        name="delete"
                        type="material"
                        color={iconColor}
                        size={20}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </Swipeable>
            </GestureHandlerRootView>
          ))}
        </ScrollView>
        <TouchableOpacity onPress={switchTheme} style={styles.switchThemeIcon}>
          <Icon
            name="brightness-4"
            type="material-icons"
            color={iconColor}
            size={30}
          />
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const useStyles = makeStyles(() => ({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 75,
  },
  content: {
    position: "relative",
    width: "80%",
    height: "100%",
  },
  title: {
    textAlign: "center",
    marginBottom: 10,
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  button: {
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    fontWeight: "bold",
  },
  taskContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 25,
    paddingTop: 25,
    borderBottomWidth: 1,
  },
  task: {
    fontSize: 20,
  },
  switchThemeIcon: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  iconContainer: {
    flexDirection: "row",
    columnGap: 15,
    justifyContent: "flex-end",
    width: "20%",
  },
  bulletpoint: {
    marginRight: 0,
    width: "10%",
    alignItems: "flex-start",
  },
  textContainer: {
    flex: 1,
  },
}));

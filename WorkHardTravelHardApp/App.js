import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableHighlight,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  Dimensions,
  Animated,
} from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SwipeListView } from "react-native-swipe-list-view";

import { Fontisto, MaterialIcons } from "@expo/vector-icons";
import { theme } from "./colors";
import { color } from "react-native/Libraries/Components/View/ReactNativeStyleAttributes";

const STORAGE_KEY_WORK_TODO = "@workToDo";
const STORAGE_KEY_TRAV_TODO = "@travToDo";
const STORAGE_KEY_WORKING = "@working";
const rowTranslateAnimatedValues = {};
Array(20)
  .fill("")
  .forEach((_, i) => {
    rowTranslateAnimatedValues[`${i}`] = new Animated.Value(1);
  });

export default function App() {
  const [working, setWorking] = useState(true);
  const [edit, setEdit] = useState(false);
  const [text, setText] = useState("");
  const [editText, setEditText] = useState("");
  const [workToDos, setWorkToDos] = useState([]); //not an array, but hashmap!
  const [travToDos, setTravToDos] = useState([]);
  useEffect(() => {
    loadWorking();
    loadToDos();

    // console.log("workToDos in useEffect : ", workToDos);
    // console.log("travToDos in useEffect : ", travToDos);
  }, []);

  const travel = () => {
    setWorking(false);
    saveWorking(false);
  };
  const work = () => {
    setWorking(true);
    saveWorking(true);
  };
  const onChangeText = (payload) => setText(payload);

  const saveWorking = async (isWorking) => {
    await AsyncStorage.setItem(STORAGE_KEY_WORKING, JSON.stringify(isWorking));
  };
  const loadWorking = async () => {
    const loadedWorking = await AsyncStorage.getItem(STORAGE_KEY_WORKING);
    if (loadedWorking) {
      setWorking(JSON.parse(loadedWorking));
    }
  };

  const saveToDos = async (toSave) => {
    //take todos, turn into string, save using asyncStorage
    if (working) {
      await AsyncStorage.setItem(STORAGE_KEY_WORK_TODO, JSON.stringify(toSave));
    } else {
      await AsyncStorage.setItem(STORAGE_KEY_TRAV_TODO, JSON.stringify(toSave));
    }
  };
  const loadToDos = async () => {
    const workTodo = await AsyncStorage.getItem(STORAGE_KEY_WORK_TODO);
    const travTodo = await AsyncStorage.getItem(STORAGE_KEY_TRAV_TODO);
    if (workTodo) {
      setWorkToDos(JSON.parse(workTodo));
    }
    if (travTodo) {
      setTravToDos(JSON.parse(travTodo));
    }
  };

  const addToDo = async () => {
    if (text === "") {
      return;
    }
    //save to do
    // const newToDos = Object.assign({}, toDos, {
    //   [Date.now()]: { text, work: working },
    // });
    const newToDo = {
      key: Date.now(),
      text,
      working,
      checked: false,
      edit: false,
    };
    const newToDos = working
      ? [...workToDos, newToDo]
      : [...travToDos, newToDo];

    if (working) setWorkToDos(newToDos);
    else setTravToDos(newToDos);
    await saveToDos(newToDos);
    setText("");

    console.log("workToDos : ", workToDos);
    console.log("travToDos : ", travToDos);
  };
  const deleteToDo = (key) => {
    if (Platform.OS === "web") {
      const ok = confirm("Do you want to delete this To Do?");
      if (ok) {
        const newToDos = { ...workToDos };
        delete newToDos[key];
        setWorkToDos(newToDos); //update the state
        saveToDos(newToDos); //save in the asyncStorage
      }
      return;
    }
    Alert.alert("Delete To Do", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "I'm Sure",
        style: "destructive",
        onPress: () => {
          //create a new toDos that 'without' the todo that has the parameter key
          const newToDos = { ...workToDos };
          delete newToDos[key];
          setWorkToDos(newToDos); //update the state
          saveToDos(newToDos); //save in the asyncStorage
        },
      },
    ]);
  };
  const checkToDo = (event, data) => {
    const idx = data.index;
    const newToDos = working ? [...workToDos] : [...travToDos];
    newToDos[idx].checked = !newToDos[idx].checked;

    //setState -> set AsyncStorage
    working ? setWorkToDos(newToDos) : setTravToDos(newToDos);
    saveToDos(newToDos);
  };
  const goEditMode = (key) => {
    return;
    if (edit) {
      Alert.alert("Edit one at a time!", "", [{ text: "OK" }]);
      return;
    }
    const newToDos = { ...workToDos };
    setEdit(true);
    setEditText(newToDos[key].text);
    newToDos[key].edit = true;
    setWorkToDos(newToDos);
  };
  const onEditTodo = (payload) => setEditText(payload);
  const editToDo = (event, key) => {
    const editedText = event.nativeEvent.text;
    if (event.text === "") {
      return;
    }
    const newToDos = { ...workToDos };
    newToDos[key].text = editedText;
    newToDos[key].edit = false;
    setWorkToDos(newToDos);
    saveToDos(newToDos);
    setEdit(false);
    setEditText("");
  };

  const onSwipeValueChange = (swipeData) => {
    const { key, value } = swipeData;

    if (value < -Dimensions.get("window").width) {
      //console.log("swipeData : ", swipeData);

      Animated.timing(new Animated.Value(1), {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start((e) => {
        const newToDos = working ? [...workToDos] : [...travToDos];
        const prevIndex = newToDos.findIndex((item) => item.key === key);
        newToDos.splice(prevIndex, 1);

        //save
        working ? setWorkToDos(newToDos) : setTravToDos(newToDos);
        saveToDos(newToDos);
        //console.log("todos : ", toDos);
      });
    }
  };

  const renderItem = (data) => {
    //console.log("=============================================");
    //console.log("renderItem : ", data.item.text);

    //console.log("returned tochable");
    return (
      <TouchableHighlight
        activeOpacity={0.8}
        onPress={(e) => checkToDo(e, data)}
        style={styles.toDo}
        underlayColor={theme.toDoBg}
      >
        {data.item.edit ? (
          //수정 모드
          <View>
            <TextInput
              returnKeyType="done"
              style={styles.toDoText}
              autoFocus
            ></TextInput>
          </View>
        ) : (
          //조회 모드
          <View style={styles.viewMode}>
            <Text
              style={
                data.item.checked
                  ? { ...styles.checkedToDoText }
                  : { ...styles.toDoText }
              }
            >
              {data.item.text}
            </Text>
            <TouchableOpacity
              onPress={(event, data) => goEditMode(event, data)}
            >
              <MaterialIcons
                name="mode-edit"
                size={24}
                style={styles.todoIcon}
              />
            </TouchableOpacity>
          </View>
        )}
      </TouchableHighlight>
    );
  };
  const renderHiddenItem = (data) => {
    //console.log("renderHiddenItem : ", data.item.text);
    // console.log(
    //   "data.item.working === working : ",
    //   data.item.working === working
    // );

    return (
      <View style={styles.rowBack}>
        <View style={[styles.backRightBtn, styles.backRightBtnRight]}>
          <Text style={styles.backTextWhite}>Delete</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        autoCorrect={false}
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        value={text}
        returnKeyType="done"
        placeholder={working ? "Add a To Do!" : "Where do you want to go?"}
        style={styles.input}
      ></TextInput>

      {/* =================================To Do List====================================== */}
      {workToDos && working ? (
        <SwipeListView
          disableRightSwipe
          data={workToDos}
          renderItem={renderItem}
          renderHiddenItem={renderHiddenItem}
          onSwipeValueChange={onSwipeValueChange}
          rightOpenValue={-Dimensions.get("window").width}
          useNativeDriver={false}
        />
      ) : (
        <SwipeListView
          disableRightSwipe
          data={travToDos}
          renderItem={renderItem}
          renderHiddenItem={renderHiddenItem}
          onSwipeValueChange={onSwipeValueChange}
          rightOpenValue={-Dimensions.get("window").width}
          useNativeDriver={false}
        />
      )}
      {/* <ScrollView>
        {toDos &&
          Object.keys(toDos).map((key) =>
            toDos[key].working === working ? (
              // work
              <View key={key}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => checkToDo(key)}
                >
                  <View key={key} style={styles.toDo}>
                    {toDos[key].edit ? (
                      <View>
                        <TextInput
                          returnKeyType="done"
                          style={styles.toDoText}
                          onSubmitEditing={(e) => editToDo(e, key)}
                          value={editText}
                          onChangeText={onEditTodo}
                          autoCapitalize="none"
                          autoCorrect={false}
                          autoFocus
                        ></TextInput>
                      </View>
                    ) : (
                      <View style={styles.viewMode}>
                        <Text
                          key={key}
                          style={
                            toDos[key].checked
                              ? { ...styles.checkedToDoText }
                              : { ...styles.toDoText }
                          }
                        >
                          {toDos[key].text}
                        </Text>
                      </View>
                    )}
                    {toDos[key].edit ? null : (
                      <View style={styles.todoIcons}>
                        <TouchableOpacity onPress={() => goEditMode(key)}>
                          <MaterialIcons
                            name="mode-edit"
                            size={24}
                            style={styles.todoIcon}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteToDo(key)}>
                          <Fontisto
                            name="trash"
                            size={18}
                            style={styles.todoIcon}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            ) : null
          )}
      </ScrollView> */}
      {/* Object.keys(toDos).map((key) =>
            toDos[key].working === working ? ( */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    marginTop: 100,
    justifyContent: "space-between",
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
    color: "white",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    marginVertical: 2,
    padding: 20,
    backgroundColor: theme.toDoBg,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  checkedToDoText: {
    color: theme.lightGrey,
    fontSize: 16,
    fontWeight: "500",
    textDecorationLine: "line-through",
  },
  viewMode: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  todoIcons: {
    flexDirection: "row",
  },
  todoIcon: {
    marginHorizontal: 5,
    color: theme.grey,
    position: "absolute",
    left: 0,
  },
  rowBack: {
    borderRadius: 10,
    marginVertical: 2,
    padding: 20,
    alignItems: "center",
    backgroundColor: "red",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 15,
  },
  backRightBtn: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    position: "absolute",
    top: 0,
    width: 75,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  backRightBtnRight: {
    backgroundColor: "red",
    right: 0,
  },
  backTextWhite: {
    color: "#FFF",
  },
});

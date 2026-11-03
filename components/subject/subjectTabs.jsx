import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors, Opacity } from "../../constants/colors";
import { Fredoka } from "../../constants/fonts";

export default function SubjectTabs({ tabs, active, onChange }) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChange(tab.key)}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginHorizontal: 5,
    padding: 4,
    borderRadius: 20,
    backgroundColor: Colors.primarySoft ,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#ffff",
  },
  label: {
    fontFamily: Fredoka.semiBold,
    fontSize: 13,
    color: Colors.neutral,
  },
  labelActive: {
    color: Colors.text,
  },
});
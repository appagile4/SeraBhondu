import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableWithoutFeedback,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setLocationModalVisible, setCityAndPersist } from "../../store/slices/locationSlice";
import { setSelectedCity, fetchApprovedListings } from "../../store/slices/listingsSlice";
import { POPULAR_CITIES, CityLocation } from "../../constants/locations";
import { THEME } from "../../constants/theme";

export const LocationModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const visible = useAppSelector((state) => state.location.locationModalVisible);
  const selectedCity = useAppSelector((state) => state.location.selectedCity);
  const [search, setSearch] = useState("");

  const filteredCities = POPULAR_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.state.toLowerCase().includes(search.toLowerCase()) ||
      (c.nameBn && c.nameBn.includes(search))
  );

  const handleSelect = (city: CityLocation) => {
    dispatch(setCityAndPersist(city.name));
    dispatch(setSelectedCity(city.name));
    dispatch(fetchApprovedListings({ city: city.name, page: 1, refresh: true }));
  };

  const handleClose = () => {
    dispatch(setLocationModalVisible(false));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              <View style={styles.handleBar} />

              <View style={styles.header}>
                <Text style={styles.title}>স্থান নির্বাচন করুন / Select Location</Text>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={handleClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={22} color={THEME.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Search Bar */}
              <View style={styles.searchWrapper}>
                <Ionicons name="search-outline" size={18} color={THEME.colors.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  value={search}
                  onChangeText={setSearch}
                  placeholder="শহর বা বিভাগ খুঁজুন (Search city or division)..."
                  placeholderTextColor={THEME.colors.textMuted}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch("")}>
                    <Ionicons name="close-circle" size={18} color={THEME.colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Cities List */}
              <FlatList
                data={filteredCities}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                  const isSelected = selectedCity.toLowerCase() === item.name.toLowerCase();
                  return (
                    <TouchableOpacity
                      style={[styles.cityRow, isSelected && styles.selectedRow]}
                      onPress={() => handleSelect(item)}
                    >
                      <View style={styles.cityLeft}>
                        <View style={[styles.pinCircle, isSelected && styles.selectedPinCircle]}>
                          <Ionicons
                            name="location"
                            size={16}
                            color={isSelected ? "#FFFFFF" : THEME.colors.primary}
                          />
                        </View>
                        <View>
                          <Text style={[styles.cityName, isSelected && styles.selectedCityName]}>
                            {item.name} {item.nameBn ? `(${item.nameBn})` : ""}
                          </Text>
                          <Text style={styles.cityState}>{item.state}</Text>
                        </View>
                      </View>

                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={20} color={THEME.colors.primary} />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: THEME.colors.backdrop,
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: THEME.radii.xl,
    borderTopRightRadius: THEME.radii.xl,
    maxHeight: "80%",
    paddingBottom: 24,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: THEME.colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.background,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    height: 42,
    borderRadius: THEME.radii.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: THEME.colors.text,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: THEME.radii.md,
    marginBottom: 4,
  },
  selectedRow: {
    backgroundColor: THEME.colors.primaryLight,
  },
  cityLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pinCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedPinCircle: {
    backgroundColor: THEME.colors.primary,
  },
  cityName: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.colors.text,
  },
  selectedCityName: {
    color: THEME.colors.primary,
    fontWeight: "700",
  },
  cityState: {
    fontSize: 12,
    color: THEME.colors.textMuted,
  },
});

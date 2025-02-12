import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Calendar,
  CalendarProvider,
  WeekCalendar,
} from "react-native-calendars";
import { FontAwesome } from "@expo/vector-icons";
import { theme } from "../../src/theme";
import type { MealType, MealPlan } from "../../src/types/meal-plan";
import { mealType_CONFIG } from "../../src/types/meal-plan";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMealPlanStore } from "@/stores/useMealPlanStore";
import { router } from "expo-router";
import { useRecipeStore } from "@/stores/useRecipeStore";
import Toast, { useToastStore } from "@/components/Toast";
import { useGlobalStore } from "@/stores/useGlobalStore";
import ConfirmModal from "@/components/ConfirmModal";

// Skeleton styles
const skeletonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  skeletonCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  skeletonContent: {
    gap: theme.spacing.sm,
  },
  skeletonTitle: {
    height: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
    width: "60%",
  },
  skeletonText: {
    height: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
    width: "40%",
  },
  nutritionStats: {
    padding: theme.spacing.md,
  },
  nutritionGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nutritionItem: {
    alignItems: "center",
  },
  skeletonValue: {
    height: 24,
    width: 48,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
    marginBottom: 4,
  },
  skeletonLabel: {
    height: 16,
    width: 32,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
  },
  mealSection: {
    marginBottom: theme.spacing.lg,
  },
  skeletonHeader: {
    height: 48,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    marginBottom: theme.spacing.sm,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.md,
  },
  calendarTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  viewToggle: {
    padding: theme.spacing.sm,
  },
  mealList: {
    flex: 1,
  },
  mealSection: {
    marginBottom: theme.spacing.lg,
  },
  mealTypeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.md,
    borderLeftWidth: 4,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.sm,
  },
  mealTypeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  mealTypeLabel: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  mealTypeTime: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  mealCard: {
    flexDirection: "row",
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.surface,
  },
  mealCardContent: {
    flex: 1,
  },
  mealName: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  mealPortions: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  mealCardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  listDeleteButton: {
    padding: theme.spacing.sm,
  },
  nutritionStats: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.lg,
  },
  nutritionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  nutritionGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nutritionItem: {
    alignItems: "center",
  },
  nutritionValue: {
    ...theme.typography.h2,
    marginBottom: theme.spacing.xs,
  },
  nutritionLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  drawerContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.spacing.lg,
    borderTopRightRadius: theme.spacing.lg,
    maxHeight: "80%",
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  drawerTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  drawerFooter: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface,
  },
  recipeItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  recipeItemSelected: {
    backgroundColor: theme.colors.surface,
  },
  recipeItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  recipeCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    marginRight: theme.spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  recipeDescription: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.spacing.sm,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    ...theme.typography.body,
    color: theme.colors.background,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.spacing.lg,
    padding: theme.spacing.lg,
    width: "80%",
  },
  modalHeader: {
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    textAlign: "center",
  },
  modalBody: {
    marginBottom: theme.spacing.lg,
  },
  modalText: {
    ...theme.typography.body,
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.spacing.sm,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
  },
  cancelButtonText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  deleteButtonText: {
    ...theme.typography.body,
    color: theme.colors.background,
  },
  errorContainer: {
    padding: theme.spacing.md,
    alignItems: "center",
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.spacing.sm,
  },
  retryButtonText: {
    ...theme.typography.body,
    color: theme.colors.background,
  },
});

function SkeletonLoader() {
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const renderSkeletonCard = (index: number) => (
    <Animated.View
      key={"skeleton_card" + index}
      style={[skeletonStyles.skeletonCard, { opacity }]}
    >
      <View style={skeletonStyles.skeletonContent}>
        <View style={skeletonStyles.skeletonTitle} />
        <View style={skeletonStyles.skeletonText} />
      </View>
    </Animated.View>
  );

  return (
    <View style={skeletonStyles.container}>
      <View style={skeletonStyles.nutritionStats}>
        <View style={skeletonStyles.skeletonTitle} />
        <View style={skeletonStyles.nutritionGrid}>
          {[...Array(4)].map((_, i) => (
            <View
              key={"skeleton_nutrition" + i}
              style={skeletonStyles.nutritionItem}
            >
              <View style={skeletonStyles.skeletonValue} />
              <View style={skeletonStyles.skeletonLabel} />
            </View>
          ))}
        </View>
      </View>
      {Object.keys(mealType_CONFIG).map((type) => (
        <View key={type + "skeleton2"} style={skeletonStyles.mealSection}>
          <View style={skeletonStyles.skeletonHeader} />
          {[...Array(2)].map((_, i) => renderSkeletonCard(i))}
        </View>
      ))}
    </View>
  );
}

export default function MealPlanScreen() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isMonthView, setIsMonthView] = useState(true);
  const [showRecipeDrawer, setShowRecipeDrawer] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(
    null
  );
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(
    new Set()
  );
  const [isAdding, setIsAdding] = useState(false);
  const [deletingMealId, setDeletingMealId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mealToDelete, setMealToDelete] = useState<MealPlan | null>(null);
  const { session } = useAuthStore();
  const { dailyPlan, loading, error, fetchDailyPlan, deleteMeal, addMeal } =
    useMealPlanStore();
  const { recipes, loading: recipesLoading, fetchRecipes } = useRecipeStore();
  const { themeColor } = useGlobalStore();
  const { showToast } = useToastStore();

  useEffect(() => {
    if (session?.access_token) {
      fetchDailyPlan(selectedDate);
    }
  }, [selectedDate, session?.access_token]);

  const handleAddMeal = (mealType: MealType) => {
    setSelectedMealType(mealType);
    setShowRecipeDrawer(true);
    setSelectedRecipes(new Set());
    fetchRecipes(1);
  };

  const handleConfirmSelection = async () => {
    if (!selectedMealType || selectedRecipes.size === 0) return;

    try {
      setIsAdding(true);
      const promises = Array.from(selectedRecipes).map((recipeId) =>
        addMeal(selectedDate, selectedMealType, recipeId)
      );
      await Promise.all(promises);
      setShowRecipeDrawer(false);
      showToast("添加成功", "success");
    } catch (error) {
      showToast("添加失败", "error");
    } finally {
      setIsAdding(false);
    }
  };

  const toggleRecipeSelection = (recipeId: string) => {
    setSelectedRecipes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(recipeId)) {
        newSet.delete(recipeId);
      } else {
        newSet.add(recipeId);
      }
      return newSet;
    });
  };

  const handleEditMeal = (meal: MealPlan) => {
    router.push(`/meal-plan/edit/${meal.id}` as any);
  };

  const handleDeleteMeal = async (meal: MealPlan) => {
    setMealToDelete(meal);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!mealToDelete) return;

    try {
      setDeletingMealId(mealToDelete.id);
      await deleteMeal(mealToDelete.id, selectedDate);
      showToast("删除成功", "success");
      setShowDeleteModal(false);
    } catch (error) {
      showToast("删除失败", "error");
    } finally {
      setDeletingMealId(null);
      setMealToDelete(null);
    }
  };

  // 渲染餐次标题
  const renderMealTypeHeader = (mealType: MealType) => {
    const config = mealType_CONFIG[mealType as keyof typeof mealType_CONFIG];
    return (
      <View style={[styles.mealTypeHeader, { borderLeftColor: config.color }]}>
        <View style={styles.mealTypeInfo}>
          <FontAwesome
            name={config.icon as keyof typeof FontAwesome.glyphMap}
            size={20}
            color={config.color}
          />
          <Text style={styles.mealTypeLabel}>{config.label}</Text>
          <Text style={styles.mealTypeTime}>{config.timeRange}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: config.color }]}
          onPress={() => handleAddMeal(mealType)}
        >
          <FontAwesome name="plus" size={16} color={theme.colors.background} />
        </TouchableOpacity>
      </View>
    );
  };

  // 渲染餐品卡片
  const renderMealCard = (meal: MealPlan, index: number) => (
    <Animated.View key={index + meal.id} style={styles.mealCard}>
      <View style={styles.mealCardContent}>
        <Text style={styles.mealName}>{meal.recipe.name}</Text>
        <Text style={styles.mealPortions}>{meal.recipe.description}</Text>
      </View>
      <View style={styles.mealCardActions}>
        <TouchableOpacity
          style={styles.listDeleteButton}
          onPress={() => handleDeleteMeal(meal)}
          disabled={deletingMealId === meal.id}
        >
          {deletingMealId === meal.id ? (
            <ActivityIndicator size="small" color={theme.colors.error} />
          ) : (
            <FontAwesome name="trash" size={24} color={theme.colors.error} />
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  // 渲染营养统计
  const renderNutritionStats = () => {
    if (!dailyPlan) return null;

    const totalNutrition = Object.values(dailyPlan).reduce(
      (acc, meals) => {
        meals.forEach((meal) => {
          if (meal.recipe.nutritionFacts) {
            acc.calories += meal.recipe.calories || 0;
            acc.protein += meal.recipe.nutritionFacts?.protein || 0;
            acc.carbs += meal.recipe.nutritionFacts?.carbs || 0;
            acc.fat += meal.recipe.nutritionFacts?.fat || 0;
          }
        });
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return (
      <View style={styles.nutritionStats}>
        <Text style={styles.nutritionTitle}>今日营养摄入</Text>
        <View style={styles.nutritionGrid}>
          <View style={styles.nutritionItem}>
            <Text style={[styles.nutritionValue, { color: themeColor }]}>
              {Math.round(totalNutrition.calories)}
            </Text>
            <Text style={styles.nutritionLabel}>卡路里</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={[styles.nutritionValue, { color: themeColor }]}>
              {Math.round(totalNutrition.protein)}g
            </Text>
            <Text style={styles.nutritionLabel}>蛋白质</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={[styles.nutritionValue, { color: themeColor }]}>
              {Math.round(totalNutrition.carbs)}g
            </Text>
            <Text style={styles.nutritionLabel}>碳水</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={[styles.nutritionValue, { color: themeColor }]}>
              {Math.round(totalNutrition.fat)}g
            </Text>
            <Text style={styles.nutritionLabel}>脂肪</Text>
          </View>
        </View>
      </View>
    );
  };

  // 渲染食谱列表抽屉
  const renderRecipeDrawer = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showRecipeDrawer}
      onRequestClose={() => setShowRecipeDrawer(false)}
    >
      <View style={styles.drawerOverlay}>
        <View style={styles.drawerContent}>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>选择食谱</Text>
            <TouchableOpacity onPress={() => setShowRecipeDrawer(false)}>
              <FontAwesome name="times" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          {recipesLoading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : (
            <>
              <FlatList
                data={recipes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.recipeItem,
                      selectedRecipes.has(item.id) && styles.recipeItemSelected,
                    ]}
                    onPress={() => toggleRecipeSelection(item.id)}
                  >
                    <View style={styles.recipeItemContent}>
                      <View style={styles.recipeCheckbox}>
                        {selectedRecipes.has(item.id) && (
                          <FontAwesome
                            name="check"
                            size={16}
                            color={theme.colors.primary}
                          />
                        )}
                      </View>
                      <View style={styles.recipeInfo}>
                        <Text style={styles.recipeName}>{item.name}</Text>
                        <Text
                          style={styles.recipeDescription}
                          numberOfLines={2}
                        >
                          {item.description}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
                onEndReached={() => {
                  // TODO: 实现加载更多
                }}
                onEndReachedThreshold={0.5}
              />
              <View style={styles.drawerFooter}>
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    (selectedRecipes.size === 0 || isAdding) &&
                      styles.confirmButtonDisabled,
                  ]}
                  onPress={handleConfirmSelection}
                  disabled={selectedRecipes.size === 0 || isAdding}
                >
                  {isAdding ? (
                    <ActivityIndicator
                      color={theme.colors.background}
                      size="small"
                    />
                  ) : (
                    <Text style={styles.confirmButtonText}>
                      确认添加 ({selectedRecipes.size})
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderDeleteModal = () => (
    <ConfirmModal
      visible={showDeleteModal}
      title="确认删除"
      message="确定要删除这个餐品吗？"
      confirmText="删除"
      onConfirm={confirmDelete}
      onCancel={() => {
        setShowDeleteModal(false);
        setMealToDelete(null);
      }}
      loading={deletingMealId !== null}
      destructive
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 日历标题 */}
      <View style={styles.calendarHeader}>
        <Text style={styles.calendarTitle}>
          {new Date(selectedDate).toLocaleDateString("zh-CN", {
            month: "long",
            day: "numeric",
          })}
        </Text>
        <TouchableOpacity
          style={styles.viewToggle}
          onPress={() => setIsMonthView(!isMonthView)}
        >
          <FontAwesome
            name={isMonthView ? "calendar" : "calendar-o"}
            size={20}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* 日历组件 */}
      <CalendarProvider date={selectedDate}>
        {isMonthView ? (
          <Calendar
            current={selectedDate}
            onDayPress={(day: { dateString: string }) =>
              setSelectedDate(day.dateString)
            }
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: themeColor,
              },
            }}
            theme={{
              calendarBackground: theme.colors.background,
              textSectionTitleColor: theme.colors.textSecondary,
              selectedDayBackgroundColor: themeColor,
              selectedDayTextColor: theme.colors.background,
              todayTextColor: themeColor,
              dayTextColor: theme.colors.text,
              textDisabledColor: theme.colors.textSecondary,
              monthTextColor: theme.colors.text,
              arrowColor: theme.colors.text,
            }}
          />
        ) : (
          <WeekCalendar
            current={selectedDate}
            onDayPress={(day: { dateString: string }) =>
              setSelectedDate(day.dateString)
            }
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: themeColor,
              },
            }}
            theme={{
              calendarBackground: theme.colors.background,
              textSectionTitleColor: theme.colors.textSecondary,
              selectedDayBackgroundColor: themeColor,
              selectedDayTextColor: theme.colors.background,
              todayTextColor: themeColor,
              dayTextColor: theme.colors.text,
              textDisabledColor: theme.colors.textSecondary,
            }}
          />
        )}
      </CalendarProvider>

      {/* 餐单列表 */}
      <ScrollView style={styles.mealList}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => fetchDailyPlan(selectedDate)}
            >
              <Text style={styles.retryButtonText}>重试</Text>
            </TouchableOpacity>
          </View>
        ) : loading ? (
          <SkeletonLoader />
        ) : (
          <>
            {renderNutritionStats()}
            {dailyPlan &&
              (Object.keys(mealType_CONFIG) as MealType[]).map((type) => (
                <View key={type} style={styles.mealSection}>
                  {renderMealTypeHeader(type)}
                  {dailyPlan[type].map(renderMealCard)}
                </View>
              ))}
          </>
        )}
      </ScrollView>
      {renderRecipeDrawer()}
      {renderDeleteModal()}
      <Toast />
    </SafeAreaView>
  );
}

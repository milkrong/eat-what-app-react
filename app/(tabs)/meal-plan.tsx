import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Calendar,
  CalendarProvider,
  WeekCalendar,
} from 'react-native-calendars';
import { FontAwesome } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import type { MealType, MealPlan } from '../../src/types/meal-plan';
import { MEAL_TYPE_CONFIG } from '../../src/types/meal-plan';
import { useAuthStore } from '@/stores/useAuthStore';
import { useMealPlanStore } from '@/stores/useMealPlanStore';
import { router } from 'expo-router';
import { useRecipeStore } from '@/stores/useRecipeStore';
import Toast from 'react-native-toast-message';

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
      key={'skeleton_card' + index}
      style={[styles.skeletonCard, { opacity }]}
    >
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonText} />
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.nutritionStats}>
        <View style={styles.skeletonTitle} />
        <View style={styles.nutritionGrid}>
          {[...Array(4)].map((_, i) => (
            <View key={'skeleton_nutrition' + i} style={styles.nutritionItem}>
              <View style={styles.skeletonValue} />
              <View style={styles.skeletonLabel} />
            </View>
          ))}
        </View>
      </View>
      {Object.keys(MEAL_TYPE_CONFIG).map((type) => (
        <View key={type + 'skeleton2'} style={styles.mealSection}>
          <View style={styles.skeletonHeader} />
          {[...Array(2)].map((_, i) => renderSkeletonCard(i))}
        </View>
      ))}
    </View>
  );
}

export default function MealPlanScreen() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
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
      Toast.show({
        type: 'success',
        text1: '添加成功',
        text2: `已添加 ${selectedRecipes.size} 个食谱到餐单`,
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '添加失败',
        text2: '请稍后重试',
        position: 'bottom',
        visibilityTime: 2000,
      });
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
      Toast.show({
        type: 'success',
        text1: '删除成功',
        text2: '已从餐单中移除',
        position: 'bottom',
        visibilityTime: 2000,
      });
      setShowDeleteModal(false);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '删除失败',
        text2: '请稍后重试',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } finally {
      setDeletingMealId(null);
      setMealToDelete(null);
    }
  };

  // 渲染餐次标题
  const renderMealTypeHeader = (mealType: MealType) => {
    const config = MEAL_TYPE_CONFIG[mealType as keyof typeof MEAL_TYPE_CONFIG];
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

    // 计算总营养
    const totalNutrition = Object.values(dailyPlan)
      .flat()
      .reduce(
        (acc, meal) => {
          console.log('meal', meal);
          const { recipe } = meal;
          return {
            calories: acc.calories + (recipe.calories || 0),
            protein: acc.protein + (recipe.nutrition_facts?.protein || 0),
            carbs: acc.carbs + (recipe.nutrition_facts?.carbs || 0),
            fat: acc.fat + (recipe.nutrition_facts?.fat || 0),
          };
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

    return (
      <View style={styles.nutritionStats}>
        <Text style={styles.nutritionTitle}>今日营养摄入</Text>
        <View style={styles.nutritionGrid}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{totalNutrition.calories}</Text>
            <Text style={styles.nutritionLabel}>卡路里</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{totalNutrition.protein}g</Text>
            <Text style={styles.nutritionLabel}>蛋白质</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{totalNutrition.carbs}g</Text>
            <Text style={styles.nutritionLabel}>碳水</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{totalNutrition.fat}g</Text>
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
    <Modal
      animationType="fade"
      transparent={true}
      visible={showDeleteModal}
      onRequestClose={() => {
        setShowDeleteModal(false);
        setMealToDelete(null);
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>确认删除</Text>
          </View>
          <View style={styles.modalBody}>
            <Text style={styles.modalText}>确定要删除这个餐品吗？</Text>
            {mealToDelete && (
              <Text style={styles.mealName}>{mealToDelete.recipe.name}</Text>
            )}
          </View>
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setShowDeleteModal(false);
                setMealToDelete(null);
              }}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.deleteButton]}
              onPress={confirmDelete}
              disabled={deletingMealId !== null}
            >
              {deletingMealId ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.background}
                />
              ) : (
                <Text style={styles.deleteButtonText}>删除</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 日历标题 */}
      <View style={styles.calendarHeader}>
        <Text style={styles.calendarTitle}>
          {new Date(selectedDate).toLocaleDateString('zh-CN', {
            month: 'long',
            day: 'numeric',
          })}
        </Text>
        <TouchableOpacity
          style={styles.viewToggle}
          onPress={() => setIsMonthView(!isMonthView)}
        >
          <FontAwesome
            name={isMonthView ? 'calendar' : 'calendar-o'}
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
                selectedColor: theme.colors.primary,
              },
            }}
            theme={{
              calendarBackground: theme.colors.background,
              textSectionTitleColor: theme.colors.textSecondary,
              selectedDayBackgroundColor: theme.colors.primary,
              selectedDayTextColor: theme.colors.background,
              todayTextColor: theme.colors.primary,
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
                selectedColor: theme.colors.primary,
              },
            }}
            theme={{
              calendarBackground: theme.colors.background,
              textSectionTitleColor: theme.colors.textSecondary,
              selectedDayBackgroundColor: theme.colors.primary,
              selectedDayTextColor: theme.colors.background,
              todayTextColor: theme.colors.primary,
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
              (Object.keys(MEAL_TYPE_CONFIG) as MealType[]).map((type) => (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
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
    padding: theme.spacing.md,
  },
  mealSection: {
    marginBottom: theme.spacing.lg,
  },
  mealTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: theme.spacing.sm,
  },
  mealTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTypeLabel: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  mealTypeTime: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.surface,
  },
  mealCardContent: {
    flex: 1,
  },
  mealName: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  mealPortions: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  mealCardActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginLeft: theme.spacing.md,
  },
  nutritionStats: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  nutritionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    ...theme.typography.h2,
    color: theme.colors.primary,
  },
  nutritionLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  errorContainer: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.spacing.sm,
  },
  retryButtonText: {
    ...theme.typography.body,
    color: theme.colors.background,
  },
  loadingContainer: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  drawerContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  drawerTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  recipeItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  recipeItemSelected: {
    backgroundColor: `${theme.colors.primary}10`,
  },
  recipeItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    marginRight: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeInfo: {
    flex: 1,
  },
  drawerFooter: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: theme.colors.textSecondary,
  },
  confirmButtonText: {
    ...theme.typography.body,
    color: theme.colors.background,
    fontWeight: 'bold',
  },
  recipeName: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: 4,
  },
  recipeDescription: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
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
    width: '60%',
  },
  skeletonText: {
    height: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
    width: '40%',
  },
  skeletonHeader: {
    height: 48,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    marginBottom: theme.spacing.sm,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  modalTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    textAlign: 'center',
  },
  modalBody: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  modalText: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface,
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
  listDeleteButton: {
    padding: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 48,
    minHeight: 48,
  },
});

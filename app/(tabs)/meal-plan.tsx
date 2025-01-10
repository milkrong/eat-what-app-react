import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Calendar,
  CalendarProvider,
  WeekCalendar,
} from 'react-native-calendars';
import { FontAwesome } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import type { MealType, DailyMealPlan } from '../../src/types/meal';
import { MEAL_TYPE_CONFIG } from '../../src/types/meal';
import { useAuthStore } from '@/stores/useAuthStore';
import { router } from 'expo-router';

export default function MealPlanScreen() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isMonthView, setIsMonthView] = useState(true);
  const [dailyPlan, setDailyPlan] = useState<DailyMealPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const { session } = useAuthStore();

  const fetchDailyPlan = async (date: string) => {
    if (!session?.access_token) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/meal-plans/${date}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          setDailyPlan({
            date,
            breakfast: [],
            lunch: [],
            dinner: [],
            snack: [],
            nutrition: {
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
              fiber: 0,
            },
          });
          return;
        }
        throw new Error('获取餐单失败');
      }

      const data = await response.json();
      setDailyPlan(data);
    } catch (error) {
      console.error('获取餐单失败:', error);
      Alert.alert('错误', '获取餐单失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyPlan(selectedDate);
  }, [selectedDate, session?.access_token]);

  const handleAddMeal = (mealType: MealType) => {
    router.push(`/meal-plan/add?date=${selectedDate}&type=${mealType}` as any);
  };

  const handleEditMeal = (
    meal: NonNullable<typeof dailyPlan>['breakfast'][0]
  ) => {
    router.push(`/meal-plan/edit/${meal.id}` as any);
  };

  const handleDeleteMeal = async (
    meal: NonNullable<typeof dailyPlan>['breakfast'][0]
  ) => {
    if (!session?.access_token) return;

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/meal-plans/meals/${meal.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error('删除餐点失败');

      // 重新获取当天餐单
      await fetchDailyPlan(selectedDate);
      Alert.alert('成功', '已删除餐点');
    } catch (error) {
      console.error('删除餐点失败:', error);
      Alert.alert('错误', '删除餐点失败');
    }
  };

  // 渲染餐次标题
  const renderMealTypeHeader = (mealType: MealType) => {
    const config = MEAL_TYPE_CONFIG[mealType];
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
  const renderMealCard = (
    meal: NonNullable<typeof dailyPlan>['breakfast'][0]
  ) => (
    <Animated.View key={meal.id} style={styles.mealCard}>
      <View style={styles.mealCardContent}>
        <Text style={styles.mealName}>{meal.recipe.name}</Text>
        <Text style={styles.mealPortions}>{meal.portions} 份</Text>
      </View>
      <View style={styles.mealCardActions}>
        <TouchableOpacity onPress={() => handleEditMeal(meal)}>
          <FontAwesome
            name="pencil"
            size={16}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteMeal(meal)}>
          <FontAwesome name="trash" size={16} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  // 渲染营养统计
  const renderNutritionStats = () => {
    if (!dailyPlan) return null;

    return (
      <View style={styles.nutritionStats}>
        <Text style={styles.nutritionTitle}>今日营养摄入</Text>
        <View style={styles.nutritionGrid}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>
              {dailyPlan.nutrition.calories}
            </Text>
            <Text style={styles.nutritionLabel}>卡路里</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>
              {dailyPlan.nutrition.protein}g
            </Text>
            <Text style={styles.nutritionLabel}>蛋白质</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>
              {dailyPlan.nutrition.carbs}g
            </Text>
            <Text style={styles.nutritionLabel}>碳水</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>
              {dailyPlan.nutrition.fat}g
            </Text>
            <Text style={styles.nutritionLabel}>脂肪</Text>
          </View>
        </View>
      </View>
    );
  };

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
        {renderNutritionStats()}

        {dailyPlan &&
          Object.entries(MEAL_TYPE_CONFIG).map(([type, config]) => (
            <View key={type} style={styles.mealSection}>
              {renderMealTypeHeader(type as MealType)}
              {dailyPlan[type as MealType].map(renderMealCard)}
            </View>
          ))}
      </ScrollView>
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
});

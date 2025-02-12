import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { theme } from "../../src/theme";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRecipeStore } from "@/stores/useRecipeStore";
import { useGlobalStore } from "@/stores/useGlobalStore";
import { useMealPlanStore } from "@/stores/useMealPlanStore";
import { MealType } from "@/types/meal-plan";
import Toast, { useToastStore } from "@/components/Toast";

interface Step {
  order: number;
  description: string;
  image_url?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_HEIGHT = SCREEN_WIDTH * 0.75;

const SkeletonLoader = ({
  width,
  height,
  style,
}: {
  width: number;
  height: number;
  style?: any;
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
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

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.spacing.xs,
          opacity,
        },
        style,
      ]}
    />
  );
};

const mealTypeS: { id: MealType; name: string }[] = [
  { id: "breakfast", name: "早餐" },
  { id: "lunch", name: "午餐" },
  { id: "dinner", name: "晚餐" },
];

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const scrollY = new Animated.Value(0);
  const { session } = useAuthStore();
  const { currentRecipe, loading, error, fetchRecipeById, toggleFavorite } =
    useRecipeStore();
  const { themeColor } = useGlobalStore();
  const [showMealPlanModal, setShowMealPlanModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(
    null
  );
  const [dateInput, setDateInput] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const { showToast } = useToastStore();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: 4,
    },
    headerButtonActive: {
      backgroundColor: theme.colors.background,
    },
    backButton: {
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      marginLeft: 16,
    },
    headerButtons: {
      flexDirection: "row",
    },
    imageContainer: {
      height: IMAGE_HEIGHT,
      overflow: "hidden",
    },
    imageWrapper: {
      height: IMAGE_HEIGHT,
      width: "100%",
    },
    image: {
      width: SCREEN_WIDTH,
      height: IMAGE_HEIGHT,
    },
    imagePlaceholder: {
      width: SCREEN_WIDTH,
      height: IMAGE_HEIGHT,
      backgroundColor: theme.colors.surface,
    },
    content: {
      flex: 1,
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: theme.spacing.lg,
      borderTopRightRadius: theme.spacing.lg,
      marginTop: -theme.spacing.lg,
      paddingTop: theme.spacing.lg,
    },
    header: {
      padding: theme.spacing.md,
    },
    title: {
      ...theme.typography.h1,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    description: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    metrics: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingVertical: theme.spacing.md,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.colors.surface,
    },
    metricItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
    },
    metricValue: {
      ...theme.typography.body,
      color: theme.colors.text,
    },
    section: {
      padding: theme.spacing.md,
      borderTopWidth: 8,
      borderTopColor: theme.colors.surface,
    },
    sectionTitle: {
      ...theme.typography.h2,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    nutritionGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
      flexWrap: "wrap",
    },
    nutritionItem: {
      alignItems: "center",
      minWidth: "25%",
    },
    nutritionValue: {
      ...theme.typography.h2,
      color: theme.colors.text,
    },
    nutritionLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    ingredientGroup: {
      marginBottom: theme.spacing.md,
    },
    ingredientGroupTitle: {
      ...theme.typography.h3,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    ingredientItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: theme.spacing.xs,
    },
    ingredientName: {
      ...theme.typography.body,
      color: theme.colors.text,
    },
    ingredientAmount: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
    },
    stepItem: {
      marginBottom: theme.spacing.md,
    },
    stepHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: theme.spacing.sm,
    },
    stepNumber: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: themeColor,
      justifyContent: "center",
      alignItems: "center",
      marginRight: theme.spacing.sm,
      marginTop: 2,
    },
    stepNumberText: {
      ...theme.typography.caption,
      color: theme.colors.background,
      fontWeight: "bold",
    },
    stepDescription: {
      flex: 1,
      ...theme.typography.body,
      color: theme.colors.text,
    },
    stepImage: {
      width: "100%",
      height: 200,
      borderRadius: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    errorText: {
      ...theme.typography.body,
      color: theme.colors.error,
      marginBottom: theme.spacing.md,
    },
    retryButton: {
      padding: 12,
      borderRadius: 20,
      backgroundColor: themeColor,
      alignItems: "center",
    },
    retryButtonText: {
      ...theme.typography.body,
      color: theme.colors.background,
      fontWeight: "bold",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: theme.spacing.lg,
      borderTopRightRadius: theme.spacing.lg,
      padding: theme.spacing.lg,
    },
    modalTitle: {
      ...theme.typography.h2,
      color: theme.colors.text,
      marginBottom: theme.spacing.lg,
      textAlign: "center",
    },
    modalLabel: {
      ...theme.typography.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    mealTypeContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: theme.spacing.lg,
    },
    mealTypeButton: {
      flex: 1,
      padding: theme.spacing.sm,
      borderRadius: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.xs,
      alignItems: "center",
    },
    mealTypeButtonActive: {
      backgroundColor: themeColor,
    },
    mealTypeText: {
      ...theme.typography.body,
      color: theme.colors.text,
    },
    mealTypeTextActive: {
      color: theme.colors.background,
    },
    modalActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: theme.spacing.lg,
    },
    modalButton: {
      flex: 1,
      padding: theme.spacing.sm,
      borderRadius: theme.spacing.sm,
      marginHorizontal: theme.spacing.xs,
      alignItems: "center",
    },
    cancelButton: {
      backgroundColor: theme.colors.surface,
    },
    confirmButton: {
      backgroundColor: themeColor,
    },
    cancelButtonText: {
      ...theme.typography.body,
      color: theme.colors.text,
    },
    confirmButtonText: {
      ...theme.typography.body,
      color: theme.colors.background,
    },
    addToMealPlanButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: themeColor,
      padding: theme.spacing.sm,
      borderRadius: theme.spacing.sm,
      marginTop: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    addToMealPlanText: {
      ...theme.typography.body,
      color: theme.colors.background,
      fontWeight: "bold",
    },
    dateInput: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.sm,
      borderRadius: theme.spacing.sm,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      fontSize: 16,
    },
  });

  const RecipeDetailSkeleton = () => (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <SkeletonLoader width={SCREEN_WIDTH} height={IMAGE_HEIGHT} />
      </View>
      <View style={[styles.content, { paddingHorizontal: theme.spacing.md }]}>
        <View style={styles.header}>
          <SkeletonLoader
            width={200}
            height={32}
            style={{ marginBottom: theme.spacing.sm }}
          />
          <SkeletonLoader
            width={SCREEN_WIDTH - theme.spacing.md * 2}
            height={48}
            style={{ marginBottom: theme.spacing.md }}
          />
          <View style={styles.metrics}>
            <SkeletonLoader width={80} height={24} />
            <SkeletonLoader width={80} height={24} />
            <SkeletonLoader width={80} height={24} />
          </View>
        </View>

        <View style={styles.section}>
          <SkeletonLoader
            width={120}
            height={24}
            style={{ marginBottom: theme.spacing.md }}
          />
          <View style={styles.nutritionGrid}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={styles.nutritionItem}>
                <SkeletonLoader
                  width={60}
                  height={32}
                  style={{ marginBottom: theme.spacing.xs }}
                />
                <SkeletonLoader width={40} height={16} />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SkeletonLoader
            width={120}
            height={24}
            style={{ marginBottom: theme.spacing.md }}
          />
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.ingredientItem}>
              <SkeletonLoader width={120} height={20} />
              <SkeletonLoader width={80} height={20} />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <SkeletonLoader
            width={120}
            height={24}
            style={{ marginBottom: theme.spacing.md }}
          />
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.stepItem}>
              <View style={styles.stepHeader}>
                <SkeletonLoader
                  width={24}
                  height={24}
                  style={{ borderRadius: 12, marginRight: theme.spacing.sm }}
                />
                <SkeletonLoader
                  width={SCREEN_WIDTH - theme.spacing.md * 4 - 24}
                  height={48}
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  React.useEffect(() => {
    if (!session?.access_token || !id) return;
    fetchRecipeById(id as string);
  }, [id, session?.access_token]);

  const handleToggleFavorite = async () => {
    if (!currentRecipe) return;
    try {
      await toggleFavorite(currentRecipe.id);
    } catch (error) {
      console.error("收藏失败:", error);
    }
  };

  const imageTranslateY = scrollY.interpolate({
    inputRange: [-IMAGE_HEIGHT, 0, IMAGE_HEIGHT],
    outputRange: [IMAGE_HEIGHT / 2, 0, -IMAGE_HEIGHT / 3],
    extrapolate: "clamp",
  });

  const renderIngredients = () => {
    if (!currentRecipe || !currentRecipe.ingredients) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>材料清单</Text>
        {currentRecipe.ingredients.map((ingredient, index) => (
          <View key={index} style={styles.ingredientItem}>
            <Text style={styles.ingredientName}>{ingredient.name}</Text>
            <Text style={styles.ingredientAmount}>
              {ingredient.amount}
              {ingredient.unit}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderStep = ({ item }: { item: Step }) => (
    <View style={styles.stepItem}>
      <View style={styles.stepHeader}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>{item.order}</Text>
        </View>
        <Text style={styles.stepDescription}>{item.description}</Text>
      </View>
      {item.image_url && (
        <Image source={{ uri: item.image_url }} style={styles.stepImage} />
      )}
    </View>
  );

  const handleAddToMealPlan = async () => {
    if (!selectedMealType || !currentRecipe || !dateInput) return;

    try {
      await useMealPlanStore
        .getState()
        .addMeal(dateInput, selectedMealType, currentRecipe.id);

      showToast("已添加到餐饮计划", "success");
      setShowMealPlanModal(false);
      setDateInput("");
      setSelectedMealType(null);
    } catch (error) {
      showToast("添加失败", "error");
    }
  };

  const renderMealPlanModal = () => (
    <Modal
      visible={showMealPlanModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowMealPlanModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>添加到餐饮计划</Text>

          <Text style={styles.modalLabel}>选择日期 (格式: YYYY-MM-DD)</Text>
          <TextInput
            style={styles.dateInput}
            value={dateInput}
            onChangeText={setDateInput}
            placeholder="2024-01-01"
            placeholderTextColor={theme.colors.textSecondary}
          />

          <Text style={styles.modalLabel}>选择餐点</Text>
          <View style={styles.mealTypeContainer}>
            {mealTypeS.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.mealTypeButton,
                  selectedMealType === type.id && styles.mealTypeButtonActive,
                ]}
                onPress={() => setSelectedMealType(type.id)}
              >
                <Text
                  style={[
                    styles.mealTypeText,
                    selectedMealType === type.id && styles.mealTypeTextActive,
                  ]}
                >
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setShowMealPlanModal(false);
                setDateInput("");
                setSelectedMealType(null);
              }}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleAddToMealPlan}
            >
              <Text style={styles.confirmButtonText}>确认</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading || !currentRecipe) {
    return (
      <SafeAreaView style={styles.container}>
        <RecipeDetailSkeleton />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchRecipeById(id as string)}
          >
            <Text style={styles.retryButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTransparent: true,
          headerTitle: "",
          headerLeft: () => (
            <TouchableOpacity
              style={[styles.headerButton, styles.backButton]}
              onPress={() => router.back()}
            >
              <FontAwesome name="arrow-left" size={24} color={themeColor} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={[styles.headerButton]}
                onPress={() => setShowMealPlanModal(true)}
              >
                <FontAwesome
                  name="calendar-plus-o"
                  size={20}
                  color={theme.colors.background}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.headerButton,
                  currentRecipe?.isFavorite && styles.headerButtonActive,
                ]}
                onPress={handleToggleFavorite}
              >
                <FontAwesome
                  name={currentRecipe?.isFavorite ? "heart" : "heart-o"}
                  size={20}
                  color={
                    currentRecipe?.isFavorite
                      ? themeColor
                      : theme.colors.background
                  }
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <FontAwesome
                  name="share"
                  size={20}
                  color={theme.colors.background}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* 图片区域 */}
        <View style={styles.imageContainer}>
          <Animated.View
            style={[
              styles.imageWrapper,
              { transform: [{ translateY: imageTranslateY }] },
            ]}
          >
            {currentRecipe.img ? (
              <Image source={{ uri: currentRecipe.img }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder} />
            )}
          </Animated.View>
        </View>

        <View style={styles.content}>
          {/* 基本信息 */}
          <View style={styles.header}>
            <Text style={styles.title}>{currentRecipe.name}</Text>
            <Text style={styles.description}>{currentRecipe.description}</Text>
            <View style={styles.metrics}>
              <View style={styles.metricItem}>
                <FontAwesome name="clock-o" size={20} color={themeColor} />
                <Text style={styles.metricValue}>
                  {currentRecipe.cookingTime}分钟
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.addToMealPlanButton}
              onPress={() => setShowMealPlanModal(true)}
            >
              <FontAwesome
                name="calendar-plus-o"
                size={20}
                color={theme.colors.background}
              />
              <Text style={styles.addToMealPlanText}>添加到餐饮计划</Text>
            </TouchableOpacity>
          </View>

          {/* 营养成分 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>营养成分</Text>
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>
                  {currentRecipe.calories}
                </Text>
                <Text style={styles.nutritionLabel}>卡路里</Text>
              </View>
              {currentRecipe.nutritionFacts && (
                <>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>
                      {currentRecipe.nutritionFacts.protein}g
                    </Text>
                    <Text style={styles.nutritionLabel}>蛋白质</Text>
                  </View>

                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>
                      {currentRecipe.nutritionFacts.carbs}g
                    </Text>
                    <Text style={styles.nutritionLabel}>碳水</Text>
                  </View>

                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>
                      {currentRecipe.nutritionFacts.fat}g
                    </Text>
                    <Text style={styles.nutritionLabel}>脂肪</Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* 材料清单 */}
          {renderIngredients()}

          {/* 步骤说明 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>步骤说明</Text>
            {currentRecipe.steps?.map((step) => (
              <View key={step.order}>{renderStep({ item: step })}</View>
            ))}
          </View>
        </View>
      </Animated.ScrollView>
      {renderMealPlanModal()}
      <Toast />
    </SafeAreaView>
  );
}

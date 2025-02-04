import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { theme } from '@/theme';
import { create } from 'zustand';

interface ToastState {
  visible: boolean;
  message: string;
  type: 'success' | 'error';
  showToast: (message: string, type: 'success' | 'error') => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  message: '',
  type: 'success',
  showToast: (message: string, type: 'success' | 'error') => {
    set({ visible: true, message, type });
    setTimeout(() => {
      set({ visible: false });
    }, 2000);
  },
  hideToast: () => set({ visible: false }),
}));

const Toast = () => {
  const { visible, message, type } = useToastStore();
  const opacity = React.useRef(new Animated.Value(0)).current;
  const offset = React.useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(offset, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(offset, {
          toValue: 20,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY: offset }],
        },
      ]}
    >
      <View style={[styles.toast, styles[type]]}>
        <FontAwesome
          name={type === 'success' ? 'check-circle' : 'exclamation-circle'}
          size={20}
          color={theme.colors.background}
        />
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.spacing.lg,
    gap: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  success: {
    backgroundColor: theme.colors.primary,
  },
  error: {
    backgroundColor: theme.colors.error,
  },
  message: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Toast; 
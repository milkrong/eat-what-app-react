import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Link, router } from "expo-router";
import { useAuthStore } from "../../src/stores/useAuthStore";
import { theme } from "../../src/theme";
import type { RegisterInput } from "../../src/types/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";

export default function RegisterScreen() {
  const { register, loading, error } = useAuthStore();
  const [step, setStep] = useState(1);
  const [avatar, setAvatar] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<RegisterInput & { confirmPassword: string }>();
  const password = watch("password");

  const handleNextStep = async () => {
    const isValid = await trigger(["email", "password", "confirmPassword"]);
    if (isValid) {
      setStep(2);
    }
  };

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const onSubmit = async (
    data: RegisterInput & { confirmPassword: string }
  ) => {
    try {
      const { confirmPassword, ...registerData } = data;
      await register({ ...registerData, avatar_url: avatar || undefined });
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  const renderStepOne = () => (
    <>
      <Controller
        control={control}
        name="email"
        rules={{
          required: "请输入邮箱",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "请输入有效的邮箱地址",
          },
        }}
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>邮箱</Text>
            <TextInput
              style={styles.input}
              placeholder="请输入邮箱"
              keyboardType="email-address"
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
              editable={!loading}
              placeholderTextColor="#999999"
            />
            {errors.email && (
              <Text style={styles.fieldError}>{errors.email.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        rules={{
          required: "请输入密码",
          minLength: {
            value: 6,
            message: "密码至少6位",
          },
        }}
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>密码</Text>
            <TextInput
              style={styles.input}
              placeholder="请输入密码"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              editable={!loading}
              placeholderTextColor="#999999"
            />
            {errors.password && (
              <Text style={styles.fieldError}>{errors.password.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        rules={{
          required: "请确认密码",
          validate: (value) => value === password || "两次输入的密码不一致",
        }}
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>确认密码</Text>
            <TextInput
              style={styles.input}
              placeholder="请再次输入密码"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              editable={!loading}
              placeholderTextColor="#999999"
            />
            {errors.confirmPassword && (
              <Text style={styles.fieldError}>
                {errors.confirmPassword.message}
              </Text>
            )}
          </View>
        )}
      />

      <TouchableOpacity style={styles.singleButton} onPress={handleNextStep}>
        <Text style={styles.buttonText}>下一步</Text>
      </TouchableOpacity>
    </>
  );

  const renderStepTwo = () => (
    <>
      <Controller
        control={control}
        name="username"
        rules={{
          required: "请输入用户名",
          minLength: {
            value: 3,
            message: "用户名至少3位",
          },
        }}
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>用户名</Text>
            <TextInput
              style={styles.input}
              placeholder="请输入用户名"
              value={value}
              onChangeText={onChange}
              editable={!loading}
              placeholderTextColor="#999999"
            />
            {errors.username && (
              <Text style={styles.fieldError}>{errors.username.message}</Text>
            )}
          </View>
        )}
      />

      <View style={styles.avatarContainer}>
        <Text style={styles.label}>头像</Text>
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={handlePickAvatar}
        >
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>点击选择头像</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => setStep(1)}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            上一步
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>完成注册</Text>
          )}
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
          />
          <Text style={styles.title}>创建账号</Text>
          <Text style={styles.subtitle}>
            {step === 1 ? "第一步：设置账号" : "第二步：个人信息"}
          </Text>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {step === 1 ? renderStepOne() : renderStepTwo()}

        <View style={styles.footer}>
          <Text style={styles.footerText}>已有账号？</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginButtonText}>立即登录</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 32,
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.error,
    marginBottom: 16,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: "#1A1A1A",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  fieldError: {
    fontSize: 12,
    color: theme.colors.error,
    marginTop: 4,
  },
  button: {
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
    flex: 1,
  },
  singleButton: {
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },
  secondaryButtonText: {
    color: "#1A1A1A",
  },
  buttonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
  },
  footerText: {
    color: "#666666",
    fontSize: 14,
  },
  loginButton: {
    marginLeft: 4,
  },
  loginButtonText: {
    color: "#1A1A1A",
    fontSize: 14,
    fontWeight: "600",
  },
  avatarContainer: {
    marginBottom: 24,
  },
  avatarButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    alignSelf: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlaceholderText: {
    color: "#666666",
    fontSize: 14,
    textAlign: "center",
  },
});

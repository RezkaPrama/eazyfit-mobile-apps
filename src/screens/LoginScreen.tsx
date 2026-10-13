import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { useAppDispatch, useAppSelector } from '../store';
import { clearAuthError, login } from '../store/authSlice';
import { Button, TextField } from '../components/ui';

// Sesuaikan path ini dengan lokasi file logo di project kamu
const logo = require('../../assets/logo 1.png');

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const { loggingIn, error } = useAppSelector((s) => s.auth);
  const [email, setEmail] = useState('yuzzy@gmail.com');
  const [password, setPassword] = useState('123456');
  // const [email, setEmail] = useState('');
  // const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);

  const submit = () => {
    if (!email.trim() || !password) return;
    dispatch(login({ email, password }));
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center', marginBottom: 36 }}>
          <View style={{ width: 180, height: 72 }}>
            <Image
              source={logo}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
              accessibilityLabel="EazyFit logo"
            />
          </View>
          {/* <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800', marginTop: 16 }}>EazyFit Trainer</Text> */}
          <Text style={{ color: colors.muted, marginTop: 4 }}>Sign in to manage your members</Text>
        </View>

        <TextField
          label="Email"
          value={email}
          onChangeText={(t) => { setEmail(t); if (error) dispatch(clearAuthError()); }}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="trainer@example.com"
        />
        <View>
          <TextField
            label="Password"
            value={password}
            onChangeText={(t) => { setPassword(t); if (error) dispatch(clearAuthError()); }}
            secureTextEntry={!show}
            autoCapitalize="none"
            placeholder="••••••••"
            onSubmitEditing={submit}
            returnKeyType="go"
            style={{ paddingRight: 44 }}
          />
          <Ionicons
            name={show ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={colors.muted}
            onPress={() => setShow((v) => !v)}
            style={{ position: 'absolute', right: 14, top: 34 }}
          />
        </View>

        {error ? (
          <View style={{ backgroundColor: colors.dangerBg, padding: 12, borderRadius: 12, marginBottom: 14 }}>
            <Text style={{ color: colors.dangerText }}>{error}</Text>
          </View>
        ) : null}

        <Button title="Sign in" onPress={submit} loading={loggingIn} disabled={!email.trim() || !password} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
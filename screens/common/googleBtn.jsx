import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, Alert } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useDispatch } from 'react-redux';
import { googleLogin } from '../../store/auth/index';
import AntDesign from 'react-native-vector-icons/AntDesign';

const GoogleLoginButton = () => {
  const dispatch = useDispatch();

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.idToken;

      const response = await dispatch(googleLogin(idToken));
      if (response?.payload?.success) {
        Alert.alert('Login Success');
      } else {
        Alert.alert('Login Failed');
      }

    } catch (error) {
      console.error(error);
      Alert.alert('Google Sign-In error');
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleGoogleSignIn}>
      <AntDesign name="google" size={24} color="#7F7F7F" style={styles.input_icon} />
      <Text style={styles.text}>Sign in with Google</Text>
    </TouchableOpacity>
  );
};

export default GoogleLoginButton;

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1D1D1D',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 3,
    marginTop: 16,
  },
  input_icon: {
    marginRight:20,
    marginLeft:10
  },
  text: {
    fontSize: 16,
    color: '#ccc',
  },
});

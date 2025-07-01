import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, Alert } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useDispatch } from 'react-redux';
import { googleLogin } from '../../store/auth/index';

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
      <Image
        source={{
          uri: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Google_favicon_2015.png',
        }}
        style={styles.icon}
      />
      <Text style={styles.text}>Sign in with Google</Text>
    </TouchableOpacity>
  );
};

export default GoogleLoginButton;

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 3,
    marginTop: 16,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  text: {
    fontSize: 16,
    color: '#000',
  },
});

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, Image, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../store/auth/index';
import logo from '../../assests/logo.png';
import Icon from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import { ScrollView, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import GoogleLoginButton from '../common/googleBtn';
import { NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const SignUpScreen = ({ navigation }) => {

  const dispatch = useDispatch();
  const { isLoading, isAuthenticated } = useSelector((state) => state.auth);

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error,setError] = useState('');

  const handleRegister = async () => {
    if (!userName || !email || !password) {
      setError("Please Enter Valid Credentials");
      return;
    }
    console.log("Entered");
    const resultAction = await dispatch(registerUser({ userName, email, password }));
    if (registerUser.fulfilled.match(resultAction)) {
       const { token, user } = resultAction.payload;
       console.log("User",user);
       const userId = user?.id;

       if(token && userId) {
        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("userId", userId);
        NativeModules.NativeStorageModule.saveUserId(userId);
        navigation.replace("Home");
       }else {
          setError("Sorry ! Try again Later");
          // Token Missing Error
       }

    } else {
      setError("Invalid Credentials ! Try Again");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      console.log("Clicked Google Login!");
      await GoogleSignin.hasPlayServices();
      console.log("after await singIn");
      // console.log("Got the userInfo",GoogleSignin.signIn());

      const userInfo = await GoogleSignin.signIn();
      console.log("userInfo Id Token",userInfo);
      const idToken = userInfo.idToken;
      console.log("got the IdToken");
      const response = await dispatch(googleLogin(idToken));
      console.log("got response! ",response);
      if (response?.payload?.success) {
        Alert.alert('Login Success');
      } else {
        Alert.alert('Login Failed');
      }

    } catch (Error) {
      console.error(Error);
      Alert.alert(`Google Sign-In error ${Error}`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1F1F1F' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={"height"}
      >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
        
            <View style={styles.header}>
                <Image
                    style={styles.logo}
                    source={logo}
                />
                <Text style={styles.primary_text}>NoteFlow AI.</Text>

                <Text style={styles.signUp_primary_text}>Create your Account !</Text>
                <Text style={styles.signUp_secondary_text}>Register to access NoteFlow AI.</Text>
            </View>

            <View style={styles.glassCard}>
              <View style={styles.box_container}>
                <Icon name="user" size={24} color="#7F7F7F" style={styles.input_icon} />
                <TextInput
                  style={styles.input}
                  placeholder="User Name"
                  placeholderTextColor="#7F7F7F"
                  value={userName}
                  onChangeText={setUserName}
                />
              </View>
                
              <View style={styles.box_container}>
                <AntDesign name="mail" size={24} color="#7F7F7F" style={styles.input_icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#7F7F7F"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.box_container}>
                <AntDesign name="lock" size={24} color="#7F7F7F" style={styles.input_icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#7F7F7F"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />

                <Feather
                  name={showPassword ? "eye" : "eye-off"}
                  size={20}
                  color="#7F7F7F"
                  style={styles.eye_icon}
                  onPress={() => setShowPassword(prev => !prev)}
                />
                
              </View>
                
                { error!='' ? <Text style={styles.error_txt}>{error!='' ? error : ""}</Text>: ''}
                {isLoading ? (
                    <ActivityIndicator size="large" color="#7F7F7F" />
                ) : (
                    <TouchableOpacity style={styles.signUp_btn} onPress={handleRegister}>
                      <Text style={styles.btn_text}>SIGN UP</Text>
                    </TouchableOpacity>
                )}
                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
                  <View style={{flex: 1, height: 1, backgroundColor: '#7F7f7F'}} />
                  <View>
                    <Text style={{width: 50, textAlign: 'center', fontSize:20, color: '#fff'}}>or</Text>
                  </View>
                  <View style={{flex: 1, height: 1, backgroundColor: '#7F7f7F'}} />
                </View>

               
                <TouchableOpacity style={styles.button} onPress={handleGoogleSignIn}>
                    <AntDesign name="google" size={24} color="#7F7F7F" style={styles.input_icon} />
                    <Text style={styles.text}>Sign in with Google</Text>
                </TouchableOpacity>
                    
            </View>
            
            <View style={styles.end_view}>
              <Text style={styles.link_text}>
                Already have an account?{' '}
                <Text style={styles.linkText} onPress={() => navigation.navigate('Login')}>
                  SignIn
                </Text>
              </Text>
            </View>



          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>

  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    flexDirection : 'column',
    // padding: 30,
    justifyContent: 'center',
    backgroundColor : '#1F1F1F'
  },
  header: {
    flex : 1,
    flexDirection : 'column',
    justifyContent : 'start',
    alignItems : 'center',
  },
  logo : {
    width: 106,
    height: 118,
  },
  primary_text : {
    fontSize : 30,
    color : '#fff',
    fontWeight : 'bold'
  },
  signUp_primary_text : {
    marginTop : 20,
    fontSize : 21,
    fontWeight : 'medium',
    color : '#ccc'
  },
  signUp_secondary_text : {
    marginTop : 5,
    fontSize : 17,
    fontWeight : 'medium',
    color : '#7f7f7f'
  },
  signUp_card : {
    backgroundColor : '#F3F3F3',
    borderRadius : 10
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // transparent white
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 30,
    flex : 1,
    justifyContent : 'start',
    flexDirection : 'column',
  },
  title: {
    fontSize: 28,
    marginBottom: 30,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    padding:20,
    marginBottom: 20,
    fontSize: 16,
    paddingVertical: 8,
    backgroundColor : '#1F1F1F',
    outlineColor:'#1F1F1F',
    height : 60,
    borderRadius : 12,
  },
  box_container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 20,
    height: 60,
  },
  input_icon: {
    marginRight: 10,
    opacity: 0.5
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },

  signUp_btn: {
    backgroundColor: '#1D1D1D',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderColor : '#323232',
    marginTop: 10,
  },
  btn_text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'medium',
  },
  eye_icon: {
    position: 'absolute',
    right: 10,
    opacity: 0.5
  },
  end_view : {
    // width:600,
    flex:1,
    justifyContent :'center',
    alignItems:'center',
    marginTop : 10,
    textAlign:'center'
  },
  link_text : {

    color:'#7F7F7F',
    fontFamily :'bold',
    fontSize:15,
  },
  linkText : {

    color:'#fff',
    fontFamily :'bold',
    fontSize:15,
    // marginBottom:8
  },
  scrollContainer : {
    flexGrow: 1,
    padding: 25,
    backgroundColor: '#1F1F1F',
    marginTop:-10
  },
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
  error_txt : {
    textAlign:'center',
    color : '#e25f5fff',

  }

});

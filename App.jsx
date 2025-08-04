import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import store from './store/store.js';

import SplashScreen from './screens/splash/splashScreen.jsx';
import LoginScreen from './screens/auth/loginScreen.jsx';
import HomeScreen from './screens/home/homeScreen.jsx';
import SignUpScreen from './screens/auth/signUpScreen.jsx';
import PermissionsScreen from './screens/splash/permissionsScreen.jsx';
import { setupGoogleSignin } from './utils/googleBtn.js';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const Stack = createNativeStackNavigator();

const App = () => {


  useEffect(()=>{
    GoogleSignin.configure({
      webClientId: '997407954891-7l57v131emrunti9rsifo3ksvfqd9laf.apps.googleusercontent.com',
      offlineAccess: true,
    })
    console.log("GoogleSignin:", GoogleSignin);
  },[]);

  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Permissions" component={PermissionsScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={SignUpScreen}/>
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default App;

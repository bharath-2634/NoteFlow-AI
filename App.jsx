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
import { setupGoogleSignin } from './utils/googleBtn.js';

const Stack = createNativeStackNavigator();

const App = () => {

  useEffect(()=>{
    setupGoogleSignin();
  },[]);

  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={SignUpScreen}/>
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default App;

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
import SettingsModal from './screens/common/settingsModel.jsx';
import LibraryScreen from './screens/library/libraryScreen.jsx';
import LibraryFullScreen from './screens/library/libraryFullScreen.jsx';


const Stack = createNativeStackNavigator();

const App = () => {


  useEffect(()=>{
    GoogleSignin.configure({
      scopes: ['email'],
      webClientId: '514559115604-nu1efes2drbinuojs9pmpme6jlbov0vc.apps.googleusercontent.com', 
      offlineAccess: false,
      androidClientId: '514559115604-vgfpk5kfphed5bft92eng5f89a19o68b.apps.googleusercontent.com',
    });
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
          <Stack.Screen name="PopUp" component={SettingsModal} />
          <Stack.Screen name="Library" component={LibraryScreen} />
          <Stack.Screen name="LibraryScreen" component={LibraryFullScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default App;

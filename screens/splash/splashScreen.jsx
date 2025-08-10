import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import logo from '../../assests/logo.png';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserById } from '../../store/auth';
import { NativeModules } from 'react-native';

const { ScanModule } = NativeModules;

const SplashScreen = ({ navigation }) => {

  const dispatch = useDispatch();

  const [user,setUser] = useState(null);

  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error("Invalid JWT", err);
      return null;
    }
  };

  const [scanFiles, setScanFiles] = useState(false);
  
  useEffect(() => {
    const startScan = async () => {
      try {
        await ScanModule.runOneTimeScan();
        navigation.replace("Home");
      } catch (error) {
        navigation.replace("Home");
      }
    };

    startScan();
  }, [scanFiles]);

 useEffect(() => {
  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      setTimeout(() => navigation.replace('Login'), 3000);
      return;
    }

    const decoded = decodeJWT(token);
    if (!decoded?.userId) {
      setTimeout(() => navigation.replace('Login'), 3000);
      return;
    }

    try {
      const res = await dispatch(fetchUserById(decoded.userId));
      const fetchedUser = res.payload?.user;

      if (fetchedUser) {
        setUser(fetchedUser);
        setTimeout(() => {
          if (fetchedUser.permissions) {
            setScanFiles(true);
            navigation.replace('Home');
          } else {
            setScanFiles(false);
            navigation.replace('Permissions');
          }
        }, 3000);
      } else {
        setTimeout(() => navigation.replace('Login'), 3000);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setTimeout(() => navigation.replace('Login'), 3000);
    }
  };

  checkAuth();
  }, []);

  return (
    <View style={styles.container}>
         <Image
            style={styles.logo}
            source={logo}
        />

        <Text style={styles.title}>NoteFlow AI</Text>
        <Text style={styles.sub_title}>Note For Change</Text>

        <View style={styles.endContainer}>
            <Text style={styles.splash_screen_primary_text}>Powered By</Text>
            <Text style={styles.splash_screen_secondary_text}>Motren Connect AI</Text>
        </View>

    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
    container: {
        flex : 1,
        flexDirection: 'col',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1F1F1F',    
    },
    logo: {
        width: 106,
        height: 128,
    },
    title : {
        fontSize : 35,
        fontWeight:'bold',
        color : '#fff'
    },
    sub_title : {
        fontSize : 18,
        fontWeight: 'medium',
        color : '#7c7c7c'
    },
    endContainer: {
        position: 'absolute',
        bottom: 30,
        alignItems: 'center',
    },
    splash_screen_primary_text : {
        color: '#7c7c7c',
        fontSize : 17
    },
    splash_screen_secondary_text : {
        fontWeight : 'medium',
        color: '#7c7c7c',
        fontSize : 17
    }

});

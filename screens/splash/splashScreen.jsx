import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import logo from '../../assests/logo.png';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreen = ({ navigation }) => {

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      
      setTimeout(() => {
        if (token) {
          navigation.replace('Home');
        } else {
          navigation.replace('Login');
        }
      }, 3000);
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

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserById } from '../../store/auth';
import { ScrollView, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../common/screenHeader';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Foundation from 'react-native-vector-icons/Foundation';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';


const GradientText = ({ text, colors, fontSize = 48, fontWeight = 900, fontFamily="Poppins-Medium" }) => {
  return (
    <View style={{textAlign:'center', flex : 1, justifyContent:'center',alignItems:'center'}}>
      <Svg height={fontSize * 1.2} width="100%">
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={colors[0]} />
            <Stop offset="100%" stopColor={colors[1]} />
          </LinearGradient>
        </Defs>
        <SvgText
          fill="url(#grad)"
          fontSize={fontSize}
          fontWeight={fontWeight}
          fontFamily={fontFamily}
          x="50%"
          y={fontSize}
          textAnchor="middle"
        >
          {text}
        </SvgText>
      </Svg>
    </View>
  );
};




const HomeScreen = ({navigation}) => {

    const {user} = useSelector((state)=>state.auth);
    console.log("user",user);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#1F1F1F' }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView contentContainerStyle={styles.homeScrollContainer} keyboardShouldPersistTaps="handled" style={{backgroundColor : 'transparent'}}>
                        <View style={styles.home_container}>
                            <View style={styles.home_header}>
                                <ScreenHeader user={user}/>
                            </View>
                            <View style={styles.home_mainContainer}>
                                <View style={{ flex : 1, alignSelf: 'center', width: '100%',textAlign:'center' }}>
                                  <GradientText
                                    text={`Hello, ${user?.userName} !`}
                                    colors={['#4E95F3', '#2CA387','#8FB9C0','#213C94']}
                                    fontSize={25}
                                    fontWeight={900}
                                    fontFamily="Poppins-Medium"
                                  />
                                </View>
                                <Text style={styles.sub_text}>What we are working Today ?</Text>
                                <View style={styles.home_cardContainer}>
                                    <TouchableOpacity style={styles.signUp_btn} onPress={()=>{navigation.replace('Directory')}}>
                                      <View style={styles.home_card}>
                                        <Ionicons name="library" size={24} color="#7F7F7F" style={styles.home_icons} />
                                        <Text style={styles.card_text}>Our Library</Text>
                                      </View>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity style={styles.signUp_btn} onPress={()=>{}}>
                                        <View style={styles.home_card}>
                                            <Foundation name="upload" size={24} color="#7F7F7F" style={styles.home_icons} />
                                            <Text style={styles.card_text}>Upload file</Text>
                                        </View>
                                    </TouchableOpacity>
                                    
                                </View>
                            </View>
                            
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export default HomeScreen;

const styles = StyleSheet.create({
    home_container: {
        padding : 25,
        justifyContent: 'center',
        backgroundColor : '#1F1F1F',
        flex : 1,
    },
    home_header : {
        marginTop : -10
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        marginVertical: 20,
        textAlign:'center',
    },
    subtitle: {
        fontSize: 32,
        fontWeight: 'normal',
        marginVertical: 10,
        backgroundColor : '#1F1F1F'
    },
    homeScrollContainer : {
      backgroundColor :'transparent'
    },
    home_mainContainer : {  
      flex : 1,
      flexDirection : 'column',
      alignItems : 'center',
      justifyContent : 'center',
      marginTop : 130,
      gap : 8
    },
    sub_text : {
      fontFamily:'Poppins-Regular',
      fontSize : 18,
      color:'#919191'
    },
    home_cardContainer : {
      marginTop:10,
      flex : 1,
      flexDirection : 'row',
      gap : 20,
      // width : 300
    },
    home_card : {
      width : 140,
      height : 35,
      flexDirection : 'row',
      borderColor : '#494848ff',
      borderRadius : 9,
      borderWidth : 2,
      gap : 10,
    },
    home_icons : {
      padding:3,
      marginLeft : 3,
    },
    card_text : {
      fontFamily:'Poppins-Regular',
      fontSize : 16,
      color:'#919191',
      marginLeft:-6,
      marginTop:5
    }

})
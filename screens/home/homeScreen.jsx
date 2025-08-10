import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserById } from '../../store/auth';
import { ScrollView, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../common/screenHeader';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-community/masked-view';



const GradientText = ({ children, style, colors }) => {
  return (
    <MaskedView
      style={{ backgroundColor: '#fff' }}
      maskElement={
        <Text style={[style, { backgroundColor: 'transparent' }]}>
          {children}
        </Text>
      }
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ paddingHorizontal: 0, backgroundColor: '#fff' }}
      >
        <Text style={[style, { opacity: 0 }]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
};



const HomeScreen = ({navigation}) => {

    const {user} = useSelector((state)=>state.auth);
    console.log("user",user);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#1F1F1F' }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                        <View style={styles.home_container}>
                            <View style={styles.home_header}>
                                <ScreenHeader user={user}/>
                            </View>
                            <View style={{ alignSelf: 'flex-start' }}>
                                <GradientText style={styles.title} colors={['#FF5733', '#FFC300']}>
                                    Gradient Text
                                </GradientText>
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
    },
    home_header : {
        marginTop : -10
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        marginVertical: 20,
        backgroundColor : '#1F1F1F'
    },
    subtitle: {
        fontSize: 32,
        fontWeight: 'normal',
        marginVertical: 10,
        backgroundColor : '#1F1F1F'
    },
})
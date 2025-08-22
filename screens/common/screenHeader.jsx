import React, { Component, useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import logo from "../../assets/logo.png";
import SettingsModal from './settingsModel';

const ScreenHeader = ({user, navigation, onUserIconPress, onMenuIconPress, screen}) => {
    
    console.log("screen value",navigation);

    const [userIcon,setUserIcon] = useState('');
    const [userName,setUserName] = useState('');

    useEffect(()=>{
        if(user) {
            const getInitial = () => {
                const userName = user?.userName;
                setUserName(userName);
                setUserIcon(userName.charAt(0).toUpperCase());
            }
            getInitial();
        }

    },[]);

    const onBackPress = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }else {
            navigation.replace('Home');
        }
    };
    

    return (
        <View style={styles.header_container}>
            {
                screen=='Home' ? 
                <TouchableOpacity onPress={onMenuIconPress}>
                    <Feather name="message-square" size={24} color="#7F7F7F" style={styles.msg_icon} />
                </TouchableOpacity> : <TouchableOpacity onPress={()=>{onBackPress()}}>
                    <Ionicons name="arrow-back" size={24} color="#7F7F7F" style={styles.msg_icon} />
                </TouchableOpacity>
            }
            
            
            <View style={styles.header_logo}>
                <Image style={styles.header_logoImg} source={logo}/>
                <Text style={styles.header_name}>NoteFlow</Text>
            </View>
            
            <TouchableOpacity style={styles.signUp_btn} onPress={onUserIconPress}>
                <View style={styles.header_user}>
                    <Text style={styles.userIcon}>{userIcon}</Text>
                </View>
            </TouchableOpacity>

        </View>
    )
    
}

export default ScreenHeader;

const styles = StyleSheet.create({
    header_container: {
        justifyContent: 'space-evenly',
        flexDirection : 'row',
        backgroundColor : '#1F1F1F',
    },
    msg_icon : {
        fontSize:28,
        marginTop : 4
    },
    header_logo : {
        flex : 1,
        flexDirection : 'row',
        justifyContent:'center',
        alignItems : 'center',
        gap : 10
    },
    header_logoImg : {
        width : 27,
        height : 27,
        marginTop:-3
    },
    header_name: {
        fontSize: 22,
        color: '#FFF',
        fontFamily: 'Poppins-Medium',
        fontWeight: '500',
        marginTop:3
    },
    header_user : {
        backgroundColor : '#0f42cfff',
        width : 35,
        height : 35,
        borderRadius : 50,

    },
    userIcon : {
        textAlign : 'center',
        fontSize : 20,
        color : '#fff',
        fontWeight : 450,
        marginTop : 3,
        fontFamily : 'Poppins-Medium'
    }
});

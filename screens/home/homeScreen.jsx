import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions, ScrollView, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../common/screenHeader';
import SettingsModal from '../common/settingsModel';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Foundation from 'react-native-vector-icons/Foundation';
import Feather from 'react-native-vector-icons/Feather';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { pick, types } from '@react-native-documents/picker';
import { NativeModules } from 'react-native';
import Sidebar from '../common/sideBar';

const GradientText = ({ text, colors, fontSize, fontWeight, fontFamily }) => {
  return (
    <View style={{ width: '100%' }}>
      <Svg height={fontSize * 1.5} width="100%">
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
          x="20%"
          y={fontSize}
        >
          {text}
        </SvgText>
      </Svg>
    </View>
  );
};


const HomeScreen = ({ navigation }) => {
    const { user } = useSelector((state) => state.auth);
    const [gemPromt, setGemPrompt] = useState("");
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showSideBar, setShowSideBar] = useState(false);

    useEffect(() => {
      const keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',() => {
          setKeyboardVisible(true);
        }
      );
      const keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide', () => {
          setKeyboardVisible(false);
        }
      );

      return () => {
        keyboardDidHideListener.remove();
        keyboardDidShowListener.remove();
      };
    }, []);

   
    const handleFileSelection = async () => {
        try {
            const result = await pick({
                type: [types.allFiles], 
                copyTo: 'cachesDirectory',
            });

            if (result && result.length > 0) {
                const newFiles = result.map(file => ({
                    name: file.name,
                    uri: file.uri,
                    type: file.type,
                    size: file.size,
                }));
                setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
            }

          
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                console.log('Document picking cancelled');
            } else {
                console.error('Error picking document:', err);
            }
        }
    };

    const handleRemoveFile = (uri) => {
      setSelectedFiles(prevFiles => prevFiles.filter(file => file.uri !== uri));
    };


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#1F1F1F' }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.outerContainer}>
                        {/* Header Section */}
                        <View style={styles.headerSection}>
                            <ScreenHeader user={user} navigation={navigation} onUserIconPress={() => setShowSettingsModal(true)} onMenuIconPress={() => setShowSideBar(true)} />
                        </View>
                        
                        <View style={[styles.mainContentSection, isKeyboardVisible && { marginTop: 10 }]}>
                             <ScrollView contentContainerStyle={styles.homeScrollContainer} keyboardShouldPersistTaps="handled" style={{backgroundColor : 'transparent'}}>
                                
                                <View style={styles.topContentContainer}>
                                    <GradientText
                                        text={`Hello, ${user?.userName} !`}
                                        colors={['#4E95F3', '#2CA387', '#8FB9C0', '#213C94']}
                                        fontSize={25}
                                        fontWeight={900}
                                        fontFamily="Poppins-Medium"
                                    />
                                    <Text style={styles.sub_text}>What we are working Today ?</Text>
                                    <View style={styles.home_cardContainer}>
                                        <TouchableOpacity style={styles.actionButton} onPress={() => { navigation.replace('Library') }}>
                                            <View style={styles.home_card}>
                                                <Ionicons name="library" size={24} color="#7F7F7F" style={styles.home_icons} />
                                                <Text style={styles.card_text}>Our Library</Text>
                                            </View>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.actionButton} onPress={()=>{}}>
                                            <View style={styles.home_card}>
                                                <Foundation name="upload" size={24} color="#7F7F7F" style={styles.home_icons} />
                                                <Text style={styles.card_text}>Upload file</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                             </ScrollView>
                        </View>
                        
                        {/* Prompt Input Box aligned at the bottom */}
                        <View style={styles.promptInputContainer}>
                            <View style={styles.promptInputWrapper}>
                                {selectedFiles.length > 0 && (
                                    <ScrollView contentContainerStyle={styles.selectedFilesScrollContent} horizontal={true} showsHorizontalScrollIndicator={false}>
                                      {selectedFiles.map((file) => (
                                        <View key={file.uri} style={styles.selectedFileItem}>
                                          <Text style={styles.selectedFileName} numberOfLines={1}>{file.name}</Text>
                                          <TouchableOpacity onPress={() => handleRemoveFile(file.uri)}>
                                            <Ionicons name="close-circle-outline" size={20} color="#fff" />
                                          </TouchableOpacity>
                                        </View>
                                      ))}
                                    </ScrollView>
                                )}
                                <View style={styles.prompt_inputContainer}>
                                  <TextInput
                                      style={styles.prompt_inputBox}
                                      placeholder="Need anything instant ? "
                                      placeholderTextColor="#7F7F7F"
                                      keyboardType="email-address"
                                      value={gemPromt}
                                      onChangeText={setGemPrompt}
                                  />
                                </View>
                                <View style={styles.promptBox_bottomSheet}>
                                    <TouchableOpacity style={styles.home_uploadBtn} onPress={handleFileSelection}>
                                        <View style={styles.promt_iconView}>
                                           <FontAwesome name="plus" size={24} color="#7F7F7F" style={styles.prompt_boxIcons} />
                                        </View>
                                        <Text style={{fontSize:17,fontFamily:'Poppins-Medium',fontWeight:480,color:'#656565ff'}}>Upload File</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.actionButton} onPress={() => { }}>
                                      <View style={styles.promt_iconView}>
                                          {gemPromt=="" ? <FontAwesome name="microphone" size={24} color="#7F7F7F" style={styles.prompt_boxIcons} /> : <Feather name="send" size={28} color="#7F7F7F" style={styles.prompt_sendIcon} />}
                                      </View>
                                  </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
            
            {/* Settings Modal */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={showSettingsModal}
              onRequestClose={() => setShowSettingsModal(false)}
            >
              <SettingsModal user={user} onClose={() => setShowSettingsModal(false)} navigation={navigation}/>
            </Modal>
            
            {/* Sidebar Modal */}
            <Modal
              animationType="fade" // Changed to fade for a smoother transition
              transparent={true}
              visible={showSideBar}
              onRequestClose={() => setShowSideBar(false)}
            >
              <Sidebar user={user} onClose={() => setShowSideBar(false)} navigation={navigation} />
            </Modal>
        </SafeAreaView>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        backgroundColor: '#1F1F1F',
        position: 'relative',
    },
    headerSection: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
        paddingHorizontal: 25,
        paddingTop: 10,
    },
    mainContentSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingTop: 40,
        paddingBottom: 120,
    },
    topContentContainer: {
        alignItems: 'center',
    },
    promptInputContainer: {
        position: 'absolute',
        bottom: -20,
        left: 0,
        right: 0,
        zIndex: 1,
        padding: 25,
        backgroundColor: '#1F1F1F',
        alignItems: 'center',
    },
    title: {
        fontSize: 25,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    sub_text: {
        fontFamily: 'Poppins-Regular',
        fontSize: 18,
        color: '#919191',
        textAlign: 'center',
        marginTop: 10,
    },
    home_cardContainer: {
        marginTop: 15,
        flexDirection: 'row',
        gap: 20,
        justifyContent: 'center',
    },
    actionButton: {},
    home_card: {
        width: 140,
        height: 35,
        flexDirection: 'row',
        borderColor: '#494848ff',
        borderRadius: 9,
        borderWidth: 2,
        gap: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    prompt_sendIcon : {
      fontSize : 25,
      marginRight:3,
      color : '#b9b9b9ff'
    },
    card_text: {
        fontFamily: 'Poppins-Regular',
        fontSize: 16,
        color: '#919191',
        marginLeft: -6,
        marginTop: 5,
    },
    promptInputWrapper: {
        width: '100%',
        padding: 10,
        borderColor: '#494848ff',
        borderRadius: 20,
        borderWidth: 2,
        flex : 1,
        justifyContent :'center',
        paddingTop: 10, // Added padding to separate files from the top border
    },
    prompt_inputBox: {
        fontFamily: 'Poppins-Regular',
        fontSize: 18,
        width:'100%',
        color: '#fff',
    },
    homeScrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    promt_iconView : {
      backgroundColor : '#535353ff',
      width : 40,
      height : 40,
      borderRadius : 50,
      textAlign : 'center',
      alignItems : 'center',
      justifyContent : 'center'
    },
    prompt_boxIcons : {
      color : '#bcbcbcff',
      fontSize : 20
    },
    prompt_inputContainer : {
      flex:1,
      flexDirection : 'row',
      justifyContent : 'space-between',
      alignItems : 'center'
    },
    promptBox_bottomSheet : {
      flexDirection : 'row',
      justifyContent:'space-between',
      alignItems:'center'
    },
    home_uploadBtn : {
      flexDirection:'row',
      alignItems:'center',
      gap:10
    },
    selectedFilesContainer: {
      flexDirection: 'row',
      marginBottom: 10,
      paddingHorizontal: 10,
      gap: 10,
    },
    selectedFilesScrollContent: {
      alignItems: 'center',
      paddingRight: 20,
    },
    selectedFileItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#323232',
      borderRadius: 15,
      padding: 8,
      gap: 5,
      width: 150,
      margin:5
    },
    selectedFileName: {
      color: '#fff',
      fontFamily: 'Poppins-Regular',
      fontSize: 14,
      flexShrink: 1,
    },
});

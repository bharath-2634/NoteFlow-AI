import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, FlatList, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../common/screenHeader';
import SettingsModal from '../common/settingsModel';
import Sidebar from '../common/sideBar';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const { height } = Dimensions.get('window');

const LibraryScreen = ({ navigation }) => {
    const { user } = useSelector((state) => state.auth);
    const [tags, setTags] = useState(user?.className || []);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showSideBar, setShowSideBar] = useState(false);
    const [showAllFoldersModal, setShowAllFoldersModal] = useState(false);

    // This useEffect is to handle keyboard visibility
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
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

    const renderFolder = ({ item }) => (
        <TouchableOpacity style={styles.folderItem}>
            <View style={styles.folderInfo}>
                <FontAwesome name="folder-o" size={24} color="#7F7F7F" />
                <Text style={styles.folderName} numberOfLines={1} ellipsizeMode="tail">{item}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#1F1F1F' }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.library_outerContainer}>
                        {/* Header Section */}
                        <View style={styles.libraryHeaderSection}>
                            <ScreenHeader user={user} navigation={navigation} onUserIconPress={() => setShowSettingsModal(true)} onMenuIconPress={() => setShowSideBar(true)} screen={'Library'}/>
                        </View>
                        
                        <View style={styles.libraryContainer}>
                            {tags.length > 0 ? (
                                <>
                                    <FlatList
                                        data={tags.slice(0, 6)}
                                        keyExtractor={(item) => item}
                                        renderItem={renderFolder}
                                        style={styles.folderList}
                                        numColumns={2} // Changed to 2 columns
                                        contentContainerStyle={styles.flatListContent}
                                    />
                                    {tags.length > 6 && (
                                        <TouchableOpacity onPress={() => setShowAllFoldersModal(true)} style={styles.allFoldersButton}>
                                            <Text style={styles.allFoldersText}>All folders <FontAwesome name="angle-right" size={24} color="#7F7F7F" style={styles.left_arrow}/></Text>
                                        </TouchableOpacity>
                                    )}
                                </>
                            ) : (
                                <Text style={styles.noTagsText}>No tags found. Add some in the settings!</Text>
                            )}
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            <Modal
              animationType="slide"
              transparent={true}
              visible={showSettingsModal}
              onRequestClose={() => setShowSettingsModal(false)}
            >
              <SettingsModal user={user} onClose={() => setShowSettingsModal(false)} navigation={navigation}/>
            </Modal>

            <Modal
              animationType="fade" 
              transparent={true}
              visible={showSideBar}
              onRequestClose={() => setShowSideBar(false)}
            >
              <Sidebar user={user} onClose={() => setShowSideBar(false)} navigation={navigation} />
            </Modal>
        </SafeAreaView>
    );
};

export default LibraryScreen;

const styles = StyleSheet.create({
    library_outerContainer: {
        flex: 1,
        backgroundColor: '#1F1F1F',
        position: 'relative',
        flexDirection: 'column',
    },
    libraryHeaderSection: {
        zIndex: 1,
        paddingHorizontal: 25,
        paddingTop: 10,
    },
    libraryContainer: {
        // flex: 1,
        padding: 18,
        marginTop: 20,
        height:'45%',
        // backgroundColor:'#fff'
    },
    libraryHeaderTitle: {
        fontSize: 22,
        color: '#fff',
        fontFamily: 'Poppins-Medium',
        marginBottom: 15,
        fontWeight: 'bold'
    },
    folderList: {
        // flex: 1,
    },
    flatListContent: {
        gap: 10,
    },
    folderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 10,
        backgroundColor: '#2A2A2A',
        borderRadius: 10,
        marginBottom: 10,
        width: '48%', 
        margin:5
    },
    folderInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    folderName: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        flexShrink: 1,
    },
    folderCountContainer: {
        backgroundColor: '#4A4A4A',
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    folderCountText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
    },
    noTagsText: {
        color: '#7F7F7F',
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
        marginTop: 50,
    },
    allFoldersButton: {
        flex:1,
        alignSelf: 'center',
        textAlign:'center',
        justifyContent:'center',
        alignItems:'center',
        gap:5,
        width:'100%'
    },
    allFoldersText: {
        color: '#fff',
        fontFamily: 'Poppins-Regular',
        fontSize: 16,
    },
    left_arrow : {
      marginLeft:10,
      marginTop:1
    }
});

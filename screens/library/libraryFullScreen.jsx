import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, FlatList, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../common/screenHeader';
import SettingsModal from '../common/settingsModel';
import Sidebar from '../common/sideBar';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const AllLabelsModal = ({ labels, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredLabels = labels.filter(label =>
        label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={modalStyles.modalOverlay}>
            <View style={modalStyles.allLabelsModalContainer}>
                <View style={modalStyles.header}>
                    <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                        <AntDesign name="close" size={24} color="#ccc" />
                    </TouchableOpacity>
                    <Text style={modalStyles.headerTitle}>All Tags</Text>
                </View>
                <View style={modalStyles.searchContainer}>
                    <AntDesign name="search1" size={20} color="#7F7F7F" style={modalStyles.searchIcon} />
                    <TextInput
                        style={modalStyles.searchInput}
                        placeholder="find your labels.."
                        placeholderTextColor="#7F7F7F"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                {filteredLabels.length > 0 ? (
                    <ScrollView style={modalStyles.allLabelsList}>
                        {filteredLabels.map((label, index) => (
                            <View key={index} style={modalStyles.allLabelsItem}>
                                <View style={modalStyles.labelInfo}>
                                    <AntDesign name="tags" size={20} color="#7F7F7F" />
                                    <Text style={modalStyles.allLabelsText}>{label}</Text>
                                </View>
                                <TouchableOpacity>
                                    <MaterialCommunityIcons name="trash-can-outline" size={24} color="#7F7F7F" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                ) : (
                    <Text style={modalStyles.emptyLabelsText}>No tags found !</Text>
                )}
            </View>
        </View>
    );
};

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
            <View style={styles.folderCountContainer}>
                <Text style={styles.folderCountText}>12</Text> 
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
                                <FlatList
                                    data={tags}
                                    keyExtractor={(item) => item}
                                    renderItem={renderFolder}
                                    style={styles.folderList}
                                    contentContainerStyle={styles.flatListContent}
                                />
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

            {/* All Folders Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showAllFoldersModal}
                onRequestClose={() => setShowAllFoldersModal(false)}
            >
                <AllLabelsModal
                    labels={tags}
                    onClose={() => setShowAllFoldersModal(false)}
                />
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
        flex: 1,
        padding: 28,
        marginTop: 20,
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
        paddingHorizontal: 15,
        backgroundColor: '#2A2A2A',
        borderRadius: 10,
        marginBottom: 10,
        width: '100%',
        // margin:5
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
        textAlign:'center',
        justifyContent:'center',
        alignItems:'center',
        flexDirection:'row',
        gap:5,
        width:'100%'
    },
    allFoldersText: {
        color: '#fff',
        fontFamily: 'Poppins-Regular',
        fontSize: 16,
    },
    left_arrow : {
      marginLeft:3,
      marginTop:-3
    }
});

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch } from 'react-redux';
import { logoutUser, updateUserProfile } from '../../store/auth';
import Toast from 'react-native-simple-toast';


const AllLabelsModal = ({ labels, onClose, onRemoveLabel }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredLabels = labels.filter(label =>
        label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={modalStyles.modalOverlay}>
            <View style={modalStyles.allLabelsModalContainer}>
                <View style={{width:'100%',height:60,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                    <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                        <AntDesign name="close" size={20} color="#ccc" />
                    </TouchableOpacity>
                    <Text style={{fontFamily:'Poppins-Regular',color:'#fff',fontSize:18,textAlign:'start',width:'100%',marginLeft:20}}>find your tags !</Text>
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
                <ScrollView style={modalStyles.allLabelsList}>
                    {filteredLabels.map((label, index) => (
                        <View key={index} style={modalStyles.allLabelsItem}>
                            <View style={modalStyles.labelInfo}>
                                <AntDesign name="tags" size={20} color="#7F7F7F" />
                                <Text style={modalStyles.allLabelsText}>{label}</Text>
                            </View>
                            <TouchableOpacity onPress={() => onRemoveLabel(label)}>
                                <MaterialCommunityIcons name="trash-can-outline" size={24} color="#7F7F7F" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
};

const AddLabelsModal = ({ setShowAddLabelsModal, data, user }) => {
    const [newLabel, setNewLabel] = useState('');
    const [labels, setLabels] = useState(data);
    const [showAllLabelsModal, setShowAllLabelsModal] = useState(false);
    const maxVisibleTags = 5;
    const dispatch = useDispatch();

    const handleAddLabel = () => {
        if (newLabel.trim() !== '' && !labels.includes(newLabel.trim())) {
            setLabels([...labels, newLabel.trim()]);
            setNewLabel('');
        }
    };

    const handleRemoveLabel = (labelToRemove) => {
        setLabels(labels.filter(label => label !== labelToRemove));
    };

    const displayedLabels = labels.slice(0, maxVisibleTags);
    const remainingCount = labels.length - maxVisibleTags;

    const handleTags = () => {
        const newUser = {
            ...user,
            className: labels,
        };
        dispatch(updateUserProfile(newUser)).then(() => {
            Toast.showWithGravity(
                'Your tags updated successfully! ',
                Toast.LONG,
                Toast.BOTTOM,
            );
            setShowAddLabelsModal(false);
        }).catch(() => {
             Toast.showWithGravity(
                'Sorry ! Try Again later ',
                Toast.LONG,
                Toast.BOTTOM,
            );
        });
    };

    return (
        <View style={modalStyles.modalOverlay}>
            <View style={modalStyles.modalContainer}>
                <View style={modalStyles.header}>
                    <Text style={modalStyles.headerTitle}>Add Labels</Text>
                </View>
                <View style={modalStyles.tagInputContainer}>
                    <View style={modalStyles.inputContainer}>
                        <TextInput
                            style={modalStyles.input}
                            placeholder="Type here..."
                            placeholderTextColor="#7F7F7F"
                            value={newLabel}
                            onChangeText={setNewLabel}
                            onSubmitEditing={handleAddLabel}
                        />
                    </View>
                    <TouchableOpacity onPress={handleAddLabel} style={modalStyles.done_btn}>
                        <Ionicons name="checkmark-done" size={24} color="#ffffffff" />
                    </TouchableOpacity>
                </View>
                
                {labels.length > 0 ? (
                    <ScrollView contentContainerStyle={modalStyles.labelsContainer}>
                        {displayedLabels.map((label, index) => (
                            <View key={index} style={modalStyles.labelItemContainer}>
                                <Text style={modalStyles.labelItemText}>{label}</Text>
                                <TouchableOpacity onPress={() => handleRemoveLabel(label)}>
                                    <AntDesign name="close" size={16} color="#7F7F7F" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        {remainingCount > 0 && (
                            <TouchableOpacity onPress={() => setShowAllLabelsModal(true)} style={modalStyles.labelItemContainer}>
                                <Text style={modalStyles.labelItemText}>{`${remainingCount}+`}</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                ) : (
                    <Text style={modalStyles.emptyLabelsText}>No Tags Found!</Text>
                )}

                <View style={modalStyles.submit_btn}>
                    <TouchableOpacity onPress={() => handleTags()} style={modalStyles.doneButton}>
                        <Text style={modalStyles.doneButtonText}>Done</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={showAllLabelsModal}
                onRequestClose={() => setShowAllLabelsModal(false)}
            >
                <AllLabelsModal
                    labels={labels}
                    onClose={() => setShowAllLabelsModal(false)}
                    onRemoveLabel={handleRemoveLabel}
                />
            </Modal>
           
        </View>
    );
};

const SettingsModal = ({ user, onClose,navigation }) => {
    const [showAddLabelsModal, setShowAddLabelsModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const userIcon = user?.userName?.charAt(0).toUpperCase() || 'U';
    const userName = user?.userName || 'User Name';
    const userEmail = user?.email || 'user@example.com';
    const data = user?.className || [];

    const dispatch = useDispatch();
    
    const renderItem = (icon, text, onPress = () => {}) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuItemIconContainer}>
                {icon}
            </View>
            <Text style={styles.menuItemText}>{text}</Text>
        </TouchableOpacity>
    );

    const handleLogout = () => {
        dispatch(logoutUser())
            .then(() => {
                navigation.replace('Login');
            })
            .catch(() => {
                Toast.show('Sorry! Try again later');
            });
    }

    return (
        <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
                {/* Header with Close button */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <AntDesign name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>NoteFlow AI</Text>
                </View>

                {/* User Profile Section */}
                <View style={{ backgroundColor: '#1F1F1F', borderRadius: 20, padding: 8 }}>
                    <View style={styles.userProfile}>
                        <View style={styles.userIconContainer}>
                            <Text style={styles.userIconText}>{userIcon}</Text>
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.userNameText}>{userName}</Text>
                            <Text style={styles.userEmailText}>{userEmail}</Text>
                        </View>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Menu Items */}
                    <View style={styles.menuItemsContainer}>
                        {renderItem(
                            <AntDesign name="tags" size={24} color="#5e5d5dff" />,
                            'Add labels',
                            () => setShowAddLabelsModal(true)
                        )}
                        {renderItem(<MaterialIcons name="security" size={24} color="#5e5d5dff" />, 'Security and Privacy Hub',()=>{Toast.show('This is a short toast');})}
                        {renderItem(<MaterialIcons name="logout" size={24} color="#5e5d5dff" />, 'Logout',()=>{setShowLogoutModal(true)})}
                        {renderItem(<MaterialCommunityIcons name="trash-can-outline" size={24} color="#5e5d5dff" />, 'Clear Chats and Gems')}
                        {renderItem(<MaterialIcons name="tips-and-updates" size={24} color="#5e5d5dff" />, 'Updates')}
                        {renderItem(<Ionicons name="settings-outline" size={24} color="#5e5d5dff" />, 'Settings')}
                        {renderItem(<MaterialIcons name="feedback" size={24} color="#5e5d5dff" />, 'Feedback')}
                        {renderItem(<Feather name="help-circle" size={24} color="#5e5d5dff" />, 'Help Desk')}
                    </View>
                </View>
            </View>

            {/* Modal for Add Labels */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showAddLabelsModal}
                onRequestClose={() => setShowAddLabelsModal(false)}
            >
                <AddLabelsModal setShowAddLabelsModal={setShowAddLabelsModal} data={data} user={user} />
            </Modal>

            <Modal
              animationType="fade"
              transparent={true}
              visible={showLogoutModal}
              onRequestClose={() => setShowLogoutModal(false)}
            >
              <View style={styles.logoutModalOverlay}>
                <View style={styles.logoutModalContainer}>
                  <Text style={styles.logoutModalTitle}>Are you sure you want to log out?</Text>
                  <View style={styles.logoutModalButtons}>
                    <TouchableOpacity onPress={() => setShowLogoutModal(false)} style={styles.cancelLogoutButton}>
                      <Text style={styles.cancelLogoutButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { setShowLogoutModal(false); handleLogout(); }} style={styles.confirmLogoutButton}>
                      <Text style={styles.confirmLogoutButtonText}>Logout</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(36, 36, 36, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Poppins-Regular'
    },
    modalContainer: {
        width: '90%',
        backgroundColor: '#313131ff',
        borderRadius: 20,
        padding: 10,
        paddingBottom: 20,
        alignItems: 'flex-start',
        borderWidth: 1,
        maxHeight: '90%',
        borderWidth: 0
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',
        padding: 10,
        marginLeft:-12
    },
    closeButton: {
        padding: 10,
        marginRight: 10,
    },
    headerTitle: {
        width: '70%',
        textAlign: 'center',
        fontSize: 20,
        color: '#fff',
        fontFamily: 'Poppins-Medium',
        marginLeft: 10,
    },
    userProfile: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        padding: 10,
        marginTop: 10,
    },
    userIconContainer: {
        backgroundColor: '#0f42cfff',
        width: 50,
        height: 50,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    userIconText: {
        fontSize: 24,
        color: '#fff',
        fontFamily: 'Poppins-Medium',
        textAlign: 'center',
        marginTop: 6
    },
    userInfo: {
        flex: 1,
    },
    userNameText: {
        fontSize: 18,
        color: '#fff',
        fontFamily: 'Poppins-Medium',
        fontWeight: '500',
    },
    userEmailText: {
        fontSize: 13,
        color: '#919191',
        fontFamily: 'Poppins-Regular',
    },
    divider: {
        height: 1,
        backgroundColor: '#494848ff',
        width: '100%',
        marginVertical: 15,
    },
    menuItemsContainer: {
        width: '100%',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        width: '100%',
    },
    menuItemIconContainer: {
        width: 30,
        alignItems: 'center'
    },
    menuItemText: {
        fontSize: 16,
        color: '#fff',
        fontFamily: 'Poppins-Regular',
        marginLeft: 20,
    },
    logoutModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(36, 36, 36, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutModalContainer: {
        width: '80%',
        backgroundColor: '#313131ff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    logoutModalTitle: {
        fontSize: 18,
        color: '#fff',
        fontFamily: 'Poppins-Medium',
        textAlign: 'center',
        marginBottom: 20,
    },
    logoutModalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 10,
    },
    cancelLogoutButton: {
        flex: 1,
        backgroundColor: '#494848ff',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    cancelLogoutButtonText: {
        color: '#fff',
        fontFamily: 'Poppins-Medium',
    },
    confirmLogoutButton: {
        flex: 1,
        backgroundColor: '#1f72f7ff',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    confirmLogoutButtonText: {
        color: '#fff',
        fontFamily: 'Poppins-Medium',
    },
});

const modalStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(36, 36, 36, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: '#313131ff',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        borderColor: '#494848ff',
        borderWidth: 1,
    },
    allLabelsModalContainer: {
        width: '80%',
        backgroundColor: '#313131ff',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        borderColor: '#494848ff',
        borderWidth: 1,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'start',
        width: '100%',
        marginBottom: 20,
    },
    closeButton: {
        padding: 10,
        fontSize: 12,
    },
    headerTitle: {
        fontSize: 18,
        color: '#fff',
        fontFamily: 'Poppins-Medium',
        flex: 1,
        textAlign: 'start',
    },
    modalContentText: {
        color: '#fff',
        fontFamily: 'Poppins-Regular',
    },
    tagInputContainer: {
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 7,
    },
    inputContainer: {
        width: '85%',
        marginBottom: 20,
        backgroundColor: '#1F1F1F',
        borderRadius: 30,
        paddingHorizontal: 15,
        paddingVertical: 6,
        justifyContent: 'space-between',
        alignSelf: 'flex-start',
        marginLeft: -10,
    },
    done_btn: {
        alignSelf: 'center',
        backgroundColor: '#1f72f7ff',
        height: 40,
        width: 47,
        marginBottom: 20,
        borderRadius: 30,
        textAlign: 'center',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    input: {
        color: '#fff',
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        borderRadius: 10,
    },
    labelsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        width: '100%',
        marginBottom: 10,
    },
    labelItemContainer: {
        flexDirection: 'row',
        backgroundColor: '#5e5d5dff',
        borderRadius: 25,
        padding: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
        gap: 5,
    },
    labelItemText: {
        color: '#fff',
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
    },
    emptyLabelsText: {
        color: '#7F7F7F',
        fontFamily: 'Poppins-Regular',
        fontSize: 16,
    },
    submit_btn: {
        width: '100%',
        alignItems: 'flex-end',
        marginTop: 20,
    },
    doneButton: {
        backgroundColor: '#1f72f7ff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    doneButtonText: {
        color: '#fff',
        fontFamily: 'Poppins-Medium',
    },
    toastContainer: {
        position: 'absolute',
        top: 60,
        left: '10%',
        right: '10%',
        alignSelf: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#313131ff',
        borderRadius: 50,
        borderWidth: 1,
        borderColor: '#494848ff',
        zIndex: 9999,
        alignItems: 'center',
    },
    toastText: {
        color: '#fff',
        fontFamily: 'Poppins-Regular',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1F1F1F',
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 20,
        width: '100%',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontFamily: 'Poppins-Regular',
        fontSize: 16,
        paddingVertical: 8,
    },
    allLabelsList: {
        width: '100%',
    },
    allLabelsItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#494848ff',
    },
    labelInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    allLabelsText: {
        color: '#fff',
        fontFamily: 'Poppins-Regular',
        fontSize: 16,
        marginLeft: 10,
    },
});

export default SettingsModal;

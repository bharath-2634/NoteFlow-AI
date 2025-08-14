import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// This is a placeholder for the new modal component. You will need to create this file.
const AddLabelsModal = ({ setShowAddLabelsModal, data }) => {
    const [newLabel, setNewLabel] = useState('');
    const [labels, setLabels] = useState(data); // Use internal state for labels
    
    const handleAddLabel = () => {
        if (newLabel.trim() !== '' && !labels.includes(newLabel.trim())) {
            setLabels([...labels, newLabel.trim()]);
            setNewLabel('');
        }
    };

    const handleRemoveLabel = (labelToRemove) => {
        setLabels(labels.filter(label => label !== labelToRemove));
    };

    return (
        <View style={modalStyles.modalOverlay}>
            <View style={modalStyles.modalContainer}>
                <View style={modalStyles.header}>
                    <TouchableOpacity onPress={() => setShowAddLabelsModal(false)} style={modalStyles.closeButton}>
                        <AntDesign name="close" size={20} color="#ccc" />
                    </TouchableOpacity>
                    <Text style={modalStyles.headerTitle}>Add Labels</Text>
                </View>
                {/* Add an input box  */}
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

                {/* Display labels */}
                {labels.length > 0 ? (
                    <ScrollView contentContainerStyle={modalStyles.labelsContainer}>
                        {labels.map((label, index) => (
                            <View key={index} style={modalStyles.labelItemContainer}>
                                <Text style={modalStyles.labelItemText}>{label}</Text>
                                <TouchableOpacity onPress={() => handleRemoveLabel(label)}>
                                    <AntDesign name="close" size={16} color="#7F7F7F" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                ) : (
                    <Text style={modalStyles.emptyLabelsText}>Add labels</Text>
                )}
            </View>
        </View>
    );
};

const SettingsModal = ({ user, onClose }) => {
    const [showAddLabelsModal, setShowAddLabelsModal] = useState(false);

    const userIcon = user?.userName?.charAt(0).toUpperCase() || 'U';
    const userName = user?.userName || 'User Name';
    const userEmail = user?.email || 'user@example.com';
    const data = user?.className || [];

    const renderItem = (icon, text, onPress = () => {}) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuItemIconContainer}>
                {icon}
            </View>
            <Text style={styles.menuItemText}>{text}</Text>
        </TouchableOpacity>
    );

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
                <View style={{backgroundColor:'#1F1F1F',borderRadius:20,padding:8}}>
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
                        {renderItem(<MaterialIcons name="security" size={24} color="#5e5d5dff" />, 'Security and Privacy Hub')}
                        {renderItem(<Ionicons name="time-outline" size={24} color="#5e5d5dff" />, 'NoteFlow AI Activity')}
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
                <AddLabelsModal setShowAddLabelsModal={setShowAddLabelsModal} data={data}/>
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
        fontFamily : 'Poppins-Regular'
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
        borderWidth:0
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',
        padding: 10,
    },
    closeButton: {
        padding: 10,
        marginRight: 10,
    },
    headerTitle: {
        width:'70%',
        textAlign:'center',
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
        textAlign:'center',
        marginTop:6
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
        fontSize: 14,
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    closeButton: {
        padding: 10,
        fontSize:12,
    },
    headerTitle: {
        fontSize: 18,
        color: '#fff',
        fontFamily: 'Poppins-Medium',
        flex: 1,
        textAlign: 'center',
        marginLeft: -30, // To visually center the text
    },
    modalContentText: {
        color: '#fff',
        fontFamily: 'Poppins-Regular',
    },
    inputContainer: {
        width: '100%',
        marginBottom: 20,
        backgroundColor: '#1F1F1F',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    input: {
        color: '#fff',
        fontFamily: 'Poppins-Regular',
        fontSize: 16,
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
        borderRadius: 15,
        padding: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
        gap: 5,
    },
    labelItemText: {
        color: '#fff',
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
    },
    emptyLabelsText: {
        color: '#7F7F7F',
        fontFamily: 'Poppins-Regular',
        fontSize: 16,
    },
});

export default SettingsModal;

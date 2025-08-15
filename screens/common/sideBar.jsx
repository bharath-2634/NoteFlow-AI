import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';

const { width } = Dimensions.get('window');

const Sidebar = ({ user, onClose }) => {
    return (
        <View style={styles.overlay}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <AntDesign name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Chats</Text>
                </View>
                <View style={styles.content}>
                    <Text style={styles.content_text}>Your chat history will be displayed here.</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.closeArea} onPress={onClose} />
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    container: {
        width: width * 0.75, // 75% of screen width
        backgroundColor: '#1F1F1F',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    closeButton: {
        padding: 10,
    },
    headerTitle: {
        fontSize: 20,
        color: '#fff',
        fontFamily: 'Poppins-Medium',
        fontWeight: 'bold',
        marginLeft: 20,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    content_text: {
        color: '#7f7f7f',
        fontFamily: 'Poppins-Regular',
    },
    closeArea: {
        flex: 1,
    },
});

export default Sidebar;

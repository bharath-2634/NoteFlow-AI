import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../store/auth/index';
import logo from '../../assests/logo.png';
import Icon from 'react-native-vector-icons/FontAwesome';

const SignUpScreen = ({ navigation }) => {

  const dispatch = useDispatch();
  const { isLoading, isAuthenticated } = useSelector((state) => state.auth);

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!userName || !email || !password) {
      Alert.alert("Error", "All fields are required");
      return;
    }
    console.log("Entered");
    const resultAction = await dispatch(registerUser({ userName, email, password }));
    // Alert.alert("Failed", resultAction.payload?.message);
    if (registerUser.fulfilled.match(resultAction)) {
      Alert.alert("Success", "Registration successful");
      navigation.replace("Home");
    } else {
      Alert.alert("Failed", resultAction.payload?.message);
    }
  };

  return (
    <View style={styles.container}>
      
        <View style={styles.header}>
            <Image
                style={styles.logo}
                source={logo}
            />
            <Text style={styles.primary_text}>NoteFlow AI.</Text>

            <Text style={styles.signUp_primary_text}>Create your Account !</Text>
            <Text style={styles.signUp_secondary_text}>Register to access NoteFlow AI.</Text>
        </View>

        <View style={styles.glassCard}>
            <Icon name="users" color="#fff" />
            <TextInput
                style={styles.input}
                placeholder="User Name"
                value={userName}
                onChangeText={setUserName}
            />

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                keyboardType="email-address"
                onChangeText={setEmail}
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            {isLoading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <Button title="Register" onPress={handleRegister} />
            )}
        </View>


      
    </View>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection : 'column',
    padding: 30,
    justifyContent: 'center',
    backgroundColor : '#1F1F1F'
  },
  header: {
    flex : 1,
    flexDirection : 'column',
    justifyContent : 'start',
    alignItems : 'center',
  },
  logo : {
    width: 106,
    height: 118,
  },
  primary_text : {
    fontSize : 30,
    color : '#fff',
    fontWeight : 'bold'
  },
  signUp_primary_text : {
    marginTop : 20,
    fontSize : 21,
    fontWeight : 'medium',
    color : '#ccc'
  },
  signUp_secondary_text : {
    marginTop : 5,
    fontSize : 17,
    fontWeight : 'medium',
    color : '#7f7f7f'
  },
  signUp_card : {
    backgroundColor : '#F3F3F3',
    borderRadius : 10
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // transparent white
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 30,
    flex : 1,
    justifyContent : 'start',
    flexDirection : 'column',
  },
  title: {
    fontSize: 28,
    marginBottom: 30,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    padding:20,
    marginBottom: 20,
    fontSize: 16,
    paddingVertical: 8,
    backgroundColor : '#1F1F1F',
    outlineColor:'#1F1F1F',
    height : 60,
    borderRadius : 12,
  },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  Platform,
  Linking,
  StyleSheet,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import logo from "../../assests/logo.png";
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserById, updateUserProfile } from '../../store/auth';
import { NativeModules } from 'react-native';


const PermissionScreen = ({ navigation }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [statusList, setStatusList] = useState([]);

  const permissionSteps = [
    {
      label: 'Storage Access',
      type: Platform.Version >= 33
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      method: 'request',
    },
    {
      label: 'Manage Files',
      method: 'intent',
      settingsURL: 'android.settings.MANAGE_ALL_FILES_ACCESS_PERMISSION',
    },
    {
      label: 'Notification Access',
      type: PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      method: 'request',
    },
    {
      label: 'Ignore Battery Optimization',
      method: 'intent',
      settingsURL: 'android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS',
    },
  ];

  useEffect(() => {
    if (stepIndex < permissionSteps.length) {
      handlePermission(permissionSteps[stepIndex]);
    }
  }, [stepIndex]);

  const handlePermission = async (step) => {
    try {
      if (step.method === 'request') {
        const result = await PermissionsAndroid.request(step.type);
        updateStatus(step.label, result === PermissionsAndroid.RESULTS.GRANTED, result);
      } else if (step.method === 'intent') {
        const settingsIntent = `intent://${step.settingsURL}`;
        await Linking.openSettings();
        updateStatus(step.label, true, 'INTENT');
      }
    } catch (err) {
      console.warn(err);
      updateStatus(step.label, false, 'ERROR');
    }
  };

  const updateStatus = (label, granted, raw) => {
    console.log(`${label} → ${raw}`);
    setStatusList((prev) => [...prev, { label, granted }]);
    setTimeout(() => {
      setStepIndex((prev) => prev + 1);
    }, 1000);
  };

  const allGranted =
    statusList.length === permissionSteps.length &&
    statusList.every((step) => step.granted);

  const [acceptedGuidelines, setAcceptedGuidelines] = useState(false);

  const dispatch = useDispatch();
  
  const [user,setUser] = useState(null);

  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error("Invalid JWT", err);
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      
      setTimeout(() => {
        if (token) {
           const decoded = decodeJWT(token);
          //  console.log("users",decoded?.userId);
          dispatch(fetchUserById(decoded?.userId)).then((res)=>setUser(res.payload?.user)).catch((error)=>{console.log(error)});
          
        } else {
          navigation.replace('Login');
        }
      }, 3000);
    };

    checkAuth();
  }, []);


  const handleStart = async () => {
    if (!allGranted || !acceptedGuidelines) {
      Alert.alert('Required', 'Please grant all permissions and accept the guidelines to continue.');
      return;
    }

    try {
      const updatedUser = {
        ...user,
        permissions: true
      };

      await dispatch(updateUserProfile(updatedUser)).then((res)=>console.log(res)).catch((error)=>console.log(error));
      // console.log("Updated User Profile");
      navigation.replace('Home');
    } catch (err) {
      console.error('Failed to update user permissions:', err);
      Alert.alert('Error', 'Failed to update your profile. Please try again.');
    }
  };

  const { SAFModule } = NativeModules;
  const [showBottomPopup, setShowBottomPopup] = useState(true);



  return (
    <View style={styles.container}>
      
      <View style={styles.permissions_header}>
          <Image
              style={styles.logo}
              source={logo}
          />
          <Text style={styles.primary_text}>NoteFlow AI.</Text>
      </View>

      <View style={styles.permissions_glassCard}>
        <Text style={styles.primary_description}>
          Your smart companion for effortless document organization. Classify, summarize, and chat with your files, instantly. Transform your learning journey, one note at a time...
        </Text>
        <Text style={styles.primary_description_title}>Permissions</Text>
          {
            permissionSteps.map((step, index) => {
            const status = statusList[index];
            const iconName = status
              ? status.granted
                ? 'checkmark-circle'
                : 'close-circle'
              : 'ellipse-outline';

            const iconColor = status
              ? status.granted
                ? 'green'
                : 'red'
              : 'gray';

              return (
                <View
                  key={index}
                  style={styles.permissions_list}
                >
                  <Icon name={iconName} size={22} color={iconColor} style={{ marginRight: 8 }} />
                  <Text style={{ color: 'white', fontSize: 16 }}>{step.label}</Text>
                </View>
              );
            })
          }

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
            <TouchableOpacity
              onPress={() => setAcceptedGuidelines(!acceptedGuidelines)}
              style={{
                height: 20,
                width: 20,
                borderWidth: 1,
                borderColor: '#ccc',
                backgroundColor: acceptedGuidelines ? '#3A1FC0' : 'transparent',
                marginRight: 10,
                borderRadius: 4,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {acceptedGuidelines && <Icon name="checkmark" size={14} color="white" />}
            </TouchableOpacity>
            
            <Text style={{ color: '#ccc', fontSize: 11, flex: 1 }}>
              I accept all the guidelines and privacy conditions.
            </Text>
          </View>

      </View>

    
      <TouchableOpacity
        disabled={!(allGranted && acceptedGuidelines)}
        onPress={handleStart}
        style={{
          backgroundColor: allGranted && acceptedGuidelines ? '#3A1FC0' : '#444',
          padding: 14,
          borderRadius: 10,
          marginTop: 30,
          width:300,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white', fontSize: 16 }}>Continue with NoteFlow AI</Text>
      </TouchableOpacity>

      {showBottomPopup && (
        <View style={styles.bottomPopup}>
          <Text style={styles.popupTitle}>NoteFlow AI.</Text>
          <Text style={styles.popupText}>
            Please enable the “All File Access” Permission on your device for NoteFlow AI to unlock all features
          </Text>
          <TouchableOpacity style={styles.popupButton} onPress={() => setShowBottomPopup(false)}>
            <Text style={styles.popupButtonText}>Okay got it !</Text>
          </TouchableOpacity>
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start', // Changed from 'center'
    backgroundColor: '#1F1F1F',
    paddingTop: 40, // To push everything slightly down
  },
  permissions_header: {
    alignItems: 'center',
    marginBottom: 20
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
  permissions_glassCard : {
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
    // flex : 1,
    justifyContent : 'start',
    flexDirection : 'column',
    marginRight:20,
    marginLeft:20
  },
  primary_description : {
    fontSize : 17,
    color:'#ccc',
    fontWeight:'medium'
  },
  primary_description_title : {
    fontSize:17,
    color:'#ccc',
    fontWeight:'bold',
    marginTop:20,
    marginBottom:20
  },
  permissions_list : {
    flexDirection: 'row',
    alignItems: 'center', 
    marginVertical: 12, 
    marginLeft:25 
  },
  bottomPopup: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 20,
    width:340,
    backgroundColor: '#151515ff',
    borderRadius: 12,
    padding: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  popupTitle: {
    fontSize: 20,
    fontFamily:'Poppins',
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  popupText: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 19,
  },
  popupButton: {
    backgroundColor: '#2674f1ff',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  popupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

 

});

export default PermissionScreen;

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Linking, Platform, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
// import { request, check, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';

const PermissionScreen = ({ navigation }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [statusList, setStatusList] = useState([]);

  const permissionSteps = [
    {
      label: 'Storage Access',
      type: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      requestType: 'normal',
    },
    {
      label: 'Manage Files',
      type: 'MANAGE_EXTERNAL_STORAGE',
      requestType: 'intent',
    },
    {
      label: 'Notification Access',
      type: PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
      requestType: 'normal',
    },
    {
      label: 'Battery Optimization',
      type: 'IGNORE_BATTERY_OPTIMIZATION',
      requestType: 'intent',
    },
  ];

  useEffect(() => {
    if (stepIndex < permissionSteps.length) askPermission(permissionSteps[stepIndex]);
  }, [stepIndex]);

  const askPermission = async (step) => {
    try {
      if (step.requestType === 'normal') {
        const result = await request(step.type);
        const granted = result === RESULTS.GRANTED;
        updateStatus(granted);
      }

      else if (step.type === 'MANAGE_EXTERNAL_STORAGE') {
        const granted = await Linking.openSettings(); // native intent for All Files Access
        updateStatus(true); // assume granted for now (you can check via `getExternalStorageManager`)
      }

      else if (step.type === 'IGNORE_BATTERY_OPTIMIZATION') {
        const granted = await Linking.openSettings(); // or send intent to ignore optimization
        updateStatus(true); // assume granted
      }

    } catch (err) {
      console.error(err);
      updateStatus(false);
    }
  };

  const updateStatus = (granted) => {
    const current = permissionSteps[stepIndex];
    setStatusList((prev) => [
      ...prev,
      { label: current.label, granted }
    ]);
    setTimeout(() => {
      setStepIndex((prev) => prev + 1);
    }, 1000);
  };

  const allGranted = statusList.length === permissionSteps.length && statusList.every(p => p.granted);

  const handleStart = () => {
    if (!allGranted) {
      Alert.alert("Permissions Required", "Please accept all permissions to continue.");
      return;
    }
    navigation.replace("Home");
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#111', padding: 24, justifyContent: 'center' }}>
      <Text style={{ color: 'white', fontSize: 24, marginBottom: 20, fontWeight: 'bold' }}>Permissions</Text>

      {permissionSteps.map((step, index) => {
        const status = statusList[index];
        const iconName = status
          ? status.granted ? 'checkmark-circle' : 'close-circle'
          : 'ellipse-outline';

        const iconColor = status
          ? status.granted ? 'green' : 'red'
          : 'gray';

        return (
          <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
            <Icon name={iconName} size={22} color={iconColor} style={{ marginRight: 8 }} />
            <Text style={{ color: 'white', fontSize: 16 }}>{step.label}</Text>
          </View>
        );
      })}

      <TouchableOpacity
        disabled={!allGranted}
        onPress={handleStart}
        style={{
          backgroundColor: allGranted ? '#9747FF' : '#444',
          padding: 14,
          borderRadius: 10,
          marginTop: 30,
          alignItems: 'center'
        }}
      >
        <Text style={{ color: 'white', fontSize: 16 }}>Start now →</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PermissionScreen;

import React from 'react';
import { View, Text, StyleSheet} from 'react-native';


const App = () => {
  return (
    <View>
      <Text style={styles.text}>Hello</Text>
    </View>
  );
};

const styles = StyleSheet.create({

    text : {
        color: '#fff',
        fontSize: 18, 
        textAlign: 'center' 
    }
});

export default App;

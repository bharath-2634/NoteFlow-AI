import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const setupGoogleSignin = () => {
    GoogleSignin.configure({
    webClientId: '997407954891-7l57v131emrunti9rsifo3ksvfqd9laf.apps.googleusercontent.com',
    offlineAccess: true,
    })
};
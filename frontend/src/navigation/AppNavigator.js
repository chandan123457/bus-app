/**
 * App Navigator
 * Main navigation configuration for the application
 * Handles screen transitions and navigation stack
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LandingScreen from '../screens/LandingScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';

const Stack = createNativeStackNavigator();

/**
 * App Navigator Component
 * Configures the navigation structure and screen options
 */
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          gestureEnabled: false,
        }}
      >
        {/* Landing/Splash Screen */}
        <Stack.Screen 
          name="Landing" 
          component={LandingScreen}
          options={{
            animation: 'none',
          }}
        />
        
        {/* Sign In Screen */}
        <Stack.Screen 
          name="SignIn" 
          component={SignInScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />

        {/* Sign Up Screen */}
        <Stack.Screen 
          name="SignUp" 
          component={SignUpScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

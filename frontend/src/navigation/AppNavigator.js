/**
 * App Navigator
 * Main navigation configuration for the application
 * Handles screen transitions and navigation stack
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LandingScreen from '../screens/LandingScreen';

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
        
        {/* Add more screens here as you build them */}
        {/* Example:
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
        */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

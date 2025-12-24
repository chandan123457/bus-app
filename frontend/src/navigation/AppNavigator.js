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
import HomeScreen from '../screens/HomeScreen';
import BusSearchResultsScreen from '../screens/BusSearchResultsScreen';
import SeatSelectionScreen from '../screens/SeatSelectionScreen';
import SeatSelectionDuplicate from '../screens/SeatSelectionDuplicate';
import PassengerInformation from '../screens/PassengerInformation';

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

        {/* Home / Dashboard Screen */}
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />

        {/* Bus Search Results Screen */}
        <Stack.Screen 
          name="BusSearchResults" 
          component={BusSearchResultsScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />

        {/* Seat Selection Screen */}
        <Stack.Screen 
          name="SeatSelection" 
          component={SeatSelectionScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />

        {/* Seat Selection Duplicate Screen (with Lower/Upper selector) */}
        <Stack.Screen 
          name="SeatSelectionDuplicate" 
          component={SeatSelectionDuplicate}
          options={{
            animation: 'slide_from_right',
          }}
        />

        {/* Passenger Information Screen */}
        <Stack.Screen 
          name="PassengerInformation" 
          component={PassengerInformation}
          options={{
            animation: 'slide_from_right',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

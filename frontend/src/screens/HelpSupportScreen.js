import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const HelpSupportScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const supportCategories = [
    { id: 1, name: 'Booking Issues', icon: 'calendar-clock' },
    { id: 2, name: 'Payment Problems', icon: 'credit-card' },
    { id: 3, name: 'Cancellation & Refund', icon: 'cancel' },
    { id: 4, name: 'General FAQs', icon: 'help-circle' },
  ];

  const helpActions = [
    { id: 1, name: 'Call us now', icon: 'phone' },
    { id: 2, name: 'Chat with our agent', icon: 'message-text' },
    { id: 3, name: 'Mail your issue to us', icon: 'email' },
  ];

  const handleCategoryPress = (category) => {
    console.log('Category pressed:', category.name);
    // Add navigation to category details when needed
  };

  const handleHelpAction = (action) => {
    console.log('Help action:', action.name);
    // Add functionality for each action
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      
      {/* Top Background & Header */}
      <View style={styles.topImageSection}>
        <ImageBackground
          source={require('../../assets/landing-background.jpg')}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlay} />
          
          <SafeAreaView edges={['top']} style={styles.safeHeader}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Help & Support</Text>
            </View>
          </SafeAreaView>
        </ImageBackground>
      </View>

      {/* Content Area */}
      <View style={styles.contentArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for FAQ's"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <MaterialCommunityIcons
              name="magnify"
              size={24}
              color="#3B82F6"
              style={styles.searchIcon}
            />
          </View>

          {/* Support Categories List */}
          <View style={styles.categoriesSection}>
            {supportCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={category.icon}
                  size={24}
                  color="#3B82F6"
                  style={styles.categoryIcon}
                />
                <Text style={styles.categoryText}>{category.name}</Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Need More Help Section */}
          <View style={styles.helpSection}>
            <Text style={styles.helpSectionTitle}>Need more help ?</Text>
            <View style={styles.helpActionsContainer}>
              {helpActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.helpActionCard}
                  onPress={() => handleHelpAction(action)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={action.icon}
                    size={24}
                    color="#3B82F6"
                    style={styles.helpActionIcon}
                  />
                  <Text style={styles.helpActionText}>{action.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Contact Information Card */}
          <View style={styles.contactCard}>
            <Text style={styles.contactCardTitle}>Contact Information</Text>
            <View style={styles.contactRow}>
              <MaterialCommunityIcons
                name="phone"
                size={20}
                color="#3B82F6"
                style={styles.contactIcon}
              />
              <Text style={styles.contactText}>+91 80-67464646</Text>
            </View>
            <View style={styles.contactRow}>
              <MaterialCommunityIcons
                name="email"
                size={20}
                color="#3B82F6"
                style={styles.contactIcon}
              />
              <Text style={styles.contactText}>support@gantabya.com</Text>
            </View>
            <View style={styles.supportAvailableRow}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={20}
                color="#3B82F6"
                style={styles.supportAvailableIcon}
              />
              <Text style={styles.supportAvailableText}>24/7 Support Available</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Light off-white background
  },
  
  // Top Image Section
  topImageSection: {
    height: SCREEN_HEIGHT * 0.18,
    width: '100%',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(43, 99, 110, 0.85)', // Soft teal overlay with 0.85 opacity
  },
  safeHeader: {
    flex: 1,
  },
  
  // Header
  header: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600', // Semi-bold
    letterSpacing: 0.3,
  },

  // Content Area
  contentArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    marginTop: 5, // Start slightly upward, overlapping the background image
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0, // No extra top padding needed
    paddingBottom: 100, // Space for bottom navigation
  },

  // Search Bar
  searchContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 50,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
  },

  // Support Categories
  categoriesSection: {
    marginBottom: 24,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryIcon: {
    marginRight: 12,
  },
  categoryText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },

  // Need More Help Section
  helpSection: {
    marginBottom: 24,
  },
  helpSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  helpActionsContainer: {
    gap: 12,
  },
  helpActionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  helpActionIcon: {
    marginRight: 12,
  },
  helpActionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },

  // Contact Information Card
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  contactCardTitle: {
    fontSize: 16,
    fontWeight: '700', // Bold
    color: '#1F2937',
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactIcon: {
    marginRight: 12,
  },
  contactText: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '400',
  },
  supportAvailableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  supportAvailableIcon: {
    marginRight: 12,
  },
  supportAvailableText: {
    fontSize: 13, // Slightly larger for better readability
    color: '#6B7280', // Subtle gray color
    fontWeight: '400',
    fontStyle: 'italic', // Subtle italic styling
  },
});

export default HelpSupportScreen;


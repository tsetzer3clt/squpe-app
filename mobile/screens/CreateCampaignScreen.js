
# Create the CreateCampaignScreen.js file content

create_campaign_screen = """import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CreateCampaignScreen = ({ navigation }) => {
  // State management - matches your UI fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fundingGoal, setFundingGoal] = useState('');
  const [duration, setDuration] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Character limits (like your UI shows)
  const TITLE_MAX_LENGTH = 100;
  const DESCRIPTION_MAX_LENGTH = 500;

  // Validate form before submission
  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a campaign title');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a campaign description');
      return false;
    }
    if (!fundingGoal || parseFloat(fundingGoal) <= 0) {
      Alert.alert('Error', 'Please enter a valid funding goal');
      return false;
    }
    if (!duration || parseInt(duration) <= 0) {
      Alert.alert('Error', 'Please enter a valid duration in days');
      return false;
    }
    return true;
  };

  // Handle campaign creation
  const handleLaunchCampaign = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Call your backend API
      const response = await fetch('http://localhost:8000/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          goal: parseFloat(fundingGoal),
          duration_days: parseInt(duration),
          tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          user_id: 'current_user_id', // Replace with actual user ID from auth
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Success! 🎉',
          'Your campaign has been launched!',
          [
            {
              text: 'View Campaign',
              onPress: () => navigation.navigate('CampaignDetail', { id: data.id })
            },
            {
              text: 'Create Another',
              onPress: () => {
                // Reset form
                setTitle('');
                setDescription('');
                setFundingGoal('');
                setDuration('');
                setTags('');
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', data.detail || 'Failed to create campaign');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please check your connection.');
      console.error('Campaign creation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Campaign</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Campaign Title */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Campaign Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter campaign title"
            placeholderTextColor="#666"
            value={title}
            onChangeText={setTitle}
            maxLength={TITLE_MAX_LENGTH}
          />
          <Text style={styles.charCount}>
            {title.length}/{TITLE_MAX_LENGTH}
          </Text>
        </View>

        {/* Description */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your campaign and its impact..."
            placeholderTextColor="#666"
            value={description}
            onChangeText={setDescription}
            maxLength={DESCRIPTION_MAX_LENGTH}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>
            {description.length}/{DESCRIPTION_MAX_LENGTH}
          </Text>
        </View>

        {/* Funding Goal */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Funding Goal</Text>
          <View style={styles.dollarInputContainer}>
            <Text style={styles.dollarSign}>$</Text>
            <TextInput
              style={styles.dollarInput}
              placeholder="0.00"
              placeholderTextColor="#666"
              value={fundingGoal}
              onChangeText={setFundingGoal}
              keyboardType="decimal-pad"
            />
          </View>
          <Text style={styles.helperText}>
            Set a realistic goal for your campaign
          </Text>
        </View>

        {/* Duration */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Duration (Days)</Text>
          <TextInput
            style={styles.input}
            placeholder="30"
            placeholderTextColor="#666"
            value={duration}
            onChangeText={setDuration}
            keyboardType="number-pad"
          />
          <Text style={styles.helperText}>
            How many days will your campaign run?
          </Text>
        </View>

        {/* Tags */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tags</Text>
          <TextInput
            style={styles.input}
            placeholder="investigation, environment, corruption"
            placeholderTextColor="#666"
            value={tags}
            onChangeText={setTags}
          />
          <Text style={styles.helperText}>
            Separate tags with commas
          </Text>
        </View>

        {/* Launch Button */}
        <TouchableOpacity
          style={[styles.launchButton, isLoading && styles.launchButtonDisabled]}
          onPress={handleLaunchCampaign}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="rocket" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.launchButtonText}>Launch Campaign</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Tips Section */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Tips for Success:</Text>
          <Text style={styles.tipText}>• Be clear and specific about your goals</Text>
          <Text style={styles.tipText}>• Add compelling visuals (coming soon!)</Text>
          <Text style={styles.tipText}>• Share your campaign on social media</Text>
          <Text style={styles.tipText}>• Engage with your supporters regularly</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  inputContainer: {
    marginTop: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
  },
  textArea: {
    height: 140,
    paddingTop: 16,
  },
  charCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  dollarInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingLeft: 16,
  },
  dollarSign: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4CAF50',
    marginRight: 4,
  },
  dollarInput: {
    flex: 1,
    padding: 16,
    paddingLeft: 8,
    fontSize: 16,
    color: '#fff',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
  },
  launchButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    marginTop: 32,
  },
  launchButtonDisabled: {
    backgroundColor: '#2d5f2f',
  },
  buttonIcon: {
    marginRight: 8,
  },
  launchButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  tipsContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default CreateCampaignScreen;
"""

print(create_campaign_screen)
print("\n" + "="*80)
print("FILE CREATED: mobile/screens/CreateCampaignScreen.js")
print("="*80)


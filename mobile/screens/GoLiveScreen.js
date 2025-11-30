import React, { useState, useEffect } from 'react';
import {
View,
Text,
StyleSheet,
TouchableOpacity,
TextInput,
ScrollView,
Alert,
ActivityIndicator,
Platform,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';

export default function GoLiveScreen({ navigation }) {
// State Management
const [title, setTitle] = useState('');
const [description, setDescription] = useState('');
const [category, setCategory] = useState('');
const [hasPermission, setHasPermission] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
const [showPreview, setShowPreview] = useState(false);

// Categories matching your UI
const categories = [
'Social Impact',
'Education',
'Environment',
'Health',
'Community',
'Arts & Culture',
'Technology',
'Other'
];

// Request Camera & Microphone Permissions
useEffect(() => {
(async () => {
const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
const { status: audioStatus } = await Camera.requestMicrophonePermissionsAsync();

if (cameraStatus === 'granted' && audioStatus === 'granted') {
setHasPermission(true);
} else {
setHasPermission(false);
Alert.alert(
'Permissions Required',
'Camera and microphone access are required to go live.',
[
{ text: 'Cancel', style: 'cancel' },
{ text: 'Open Settings', onPress: () => Permissions.openSettings() }
]
);
}
})();
}, []);

// Form Validation
const validateForm = () => {
if (!title.trim()) {
Alert.alert('Missing Information', 'Please enter a stream title');
return false;
}
if (title.length < 3) {
Alert.alert('Title Too Short', 'Stream title must be at least 3 characters');
return false;
}
if (!category) {
Alert.alert('Missing Category', 'Please select a category');
return false;
}
return true;
};

// Start Live Stream
const handleGoLive = async () => {
if (!validateForm()) return;
if (!hasPermission) {
Alert.alert('No Permission', 'Please grant camera and microphone permissions');
return;
}

setIsLoading(true);

try {
// Call your backend API
const response = await fetch('http://localhost:8000/api/livestreams', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
// Add authentication token here when you implement auth
// 'Authorization': `Bearer ${userToken}`
},
body: JSON.stringify({
title: title.trim(),
description: description.trim(),
category: category,
status: 'live',
viewer_count: 0
})
});

const data = await response.json();

if (response.ok) {
Alert.alert(
'🎉 You\'re Live!',
'Your stream is now broadcasting to the world!',
[
{
text: 'Start Streaming',
onPress: () => {
// Navigate to actual streaming screen
navigation.navigate('LiveStreaming', {
streamId: data.id,
streamKey: data.stream_key
});
}
}
]
);
} else {
throw new Error(data.detail || 'Failed to start stream');
}
} catch (error) {
console.error('Error starting stream:', error);
Alert.alert(
'Error',
'Failed to start live stream. Please try again.',
[{ text: 'OK' }]
);
} finally {
setIsLoading(false);
}
};

// Toggle Camera (Front/Back)
const flipCamera = () => {
setCameraType(
cameraType === Camera.Constants.Type.back?
Camera.Constants.Type.front:
Camera.Constants.Type.back
);
};

// Permission Loading State
if (hasPermission === null) {
return (
<View style={styles.centerContainer}>
<Activity

Indicator size="large" color="#4CAF50" />
<Text style={styles.loadingText}>Checking permissions...</Text>
</View>
);
}

// Permission Denied State
if (hasPermission === false) {
return (
<View style={styles.centerContainer}>
<Text style={styles.permissionTitle}>📹 Camera Access Required</Text>
<Text style={styles.permissionText}>
To go live, Squpe needs access to your camera and microphone.
</Text>
<Touchable

Opacity
style={styles.permissionButton}
onPress={() => Permissions.openSettings()}
>
<Text style={styles.permissionButtonText}>Open Settings</Text>
</TouchableOpacity>
</View>
);
}

return (
<Scroll

View style={styles.container} keyboardShouldPersistTaps="handled">
{/* Header */}
<View style={styles.header}>
<Text style={styles.headerTitle}>Go Live</Text>
<Text style={styles.headerSubtitle}>
Share your impact with the world
</Text>
</View>

{/* Camera Preview (Optional) */}
{showPreview && (
<View style={styles.cameraContainer}>
<Camera
style={styles.camera}
type={cameraType}
ratio="16:9"
>
<Touchable

Opacity
style={styles.flipButton}
onPress={flipCamera}
>
<Text style={styles.flipButtonText}>🔄 Flip</Text>
</TouchableOpacity>
</Camera>
</View>
)}

{/* Toggle Preview Button */}
<Touchable

Opacity
style={styles.previewToggle}
onPress={() => setShowPreview(!showPreview)}
>
<Text style={styles.previewToggleText}>
{showPreview ? '📷 Hide Preview' : '📷 Show Camera Preview'}
</Text>
</TouchableOpacity>

{/* Stream Title */}
<View style={styles.inputContainer}>
<Text style={styles.label}>Stream Title *</Text>
<Text

Input
style={styles.input}
placeholder="What's your stream about?"
placeholderTextColor="#666"
value={title}
onChangeText={setTitle}
maxLength={100}
/>
<Text style={styles.charCount}>{title.length}/100</Text>
</View>

{/* Description */}
<View style={styles.inputContainer}>
<Text style={styles.label}>Description (Optional)</Text>
<Text

Input
style={[styles.input, styles.textArea]}
placeholder="Tell viewers what to expect..."
placeholderTextColor="#666"
value={description}
onChangeText={setDescription}
maxLength={500}
multiline
numberOfLines={4}
/>
<Text style={styles.charCount}>{description.length}/500</Text>
</View>

{/* Category Selection */}
<View style={styles.inputContainer}>
<Text style={styles.label}>Category *</Text>
<View style={styles.categoryGrid}>
{categories.map((cat) => (
<Touchable

Opacity
key={cat}
style={[
styles.categoryChip,
category === cat && styles.categoryChipSelected
]}
onPress={() => setCategory(cat)}
>
<Text
style={[
styles.categoryChipText,
category === cat && styles.categoryChipTextSelected
]}
>
{cat}
</Text>
</TouchableOpacity>
))}
</View>
</View>

{/* Streaming Tips */}
<View style={styles.tipsContainer}>
<Text style={styles.tipsTitle}>💡 Streaming Tips</Text>
<Text style={styles.tipText}>✓ Make sure you have a stable internet connection</Text>
<Text style={styles.tipText}>✓ Find good lighting for better video quality</Text>
<Text style={styles.tipText}>✓ Test your audio before going live</Text>
<Text style={styles.tipText}>✓ Engage with viewers in the chat</Text>
<Text style={styles.tipText}>✓ Have fun and be authentic!</Text>
</View>

{/* Go Live Button */}
<Touchable

Opacity
style={[styles.goLiveButton, isLoading && styles.buttonDisabled]}
onPress={handleGoLive}
disabled={isLoading}
>
{isLoading ? (
<Activity

Indicator color="#fff" />
) : (
<>
<Text style={styles.goLiveButtonText}>🔴 Go Live</Text>
<Text style={styles.goLiveButtonSubtext}>Start Broadcasting</Text>
</>
)}
</TouchableOpacity>

{/* Bottom Spacing */}
<View style={{ height: 40 }} />
</ScrollView>
);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#000',
},
centerContainer: {
flex: 1,
backgroundColor: '#000',
justifyContent: 'center',
alignItems: 'center',
padding: 20,
},
header: {
padding: 20,
paddingTop: Platform.OS === 'ios' ? 60 : 40,
},
headerTitle: {
fontSize: 32,
fontWeight: 'bold',
color: '#fff',
marginBottom: 8,
},
headerSubtitle: {
fontSize: 16,
color: '#999',
},
cameraContainer: {
marginHorizontal: 20,
marginBottom: 20,
borderRadius: 12,
overflow: 'hidden',
height: 200,
},
camera: {
flex: 1,
},
flipButton: {
position: 'absolute',
top: 10,
right: 10,
backgroundColor: 'rgba(0,0,0,0.6)',
paddingHorizontal: 15,
paddingVertical: 8,
borderRadius: 20,
},
flipButtonText: {
color: '#fff',
fontSize: 14,
fontWeight: '600',
},
previewToggle: {
marginHorizontal: 20,
marginBottom: 20,
padding: 15,
backgroundColor: '#1a1a1a',
borderRadius: 12,
alignItems: 'center',
},
previewToggleText: {
color: '#4CAF50',
fontSize: 16,
fontWeight: '600',
},
inputContainer: {
marginHorizontal: 20,
marginBottom: 20,
},
label: {
fontSize: 16,
fontWeight: '600',
color: '#fff',
marginBottom: 8,
},
input: {
backgroundColor: '#1a1a1a',
borderRadius: 12,
padding: 15,
fontSize: 16,
color: '#fff',
borderWidth: 1,
borderColor: '#333',
},
textArea: {
height: 100,
textAlignVertical: 'top',
},
charCount: {
fontSize: 12,
color: '#666',
textAlign: 'right',
marginTop: 4,
},
categoryGrid: {
flexDirection: 'row',
flexWrap: 'wrap',
gap: 10,
},
categoryChip: {
paddingHorizontal: 16,
paddingVertical: 10,
backgroundColor: '#1a1a1a',
borderRadius: 20,
borderWidth: 1,
borderColor: '#333',
},
categoryChipSelected: {
backgroundColor: '#4CAF50',
borderColor: '#4CAF50',
},
categoryChipText: {
color: '#999',
fontSize: 14,
fontWeight: '500',
},
categoryChipTextSelected: {
color: '#fff',
fontWeight: '600',
},
tipsContainer: {
marginHorizontal: 20,
marginBottom: 20,
padding: 20,
backgroundColor: '#1a1a1a',
borderRadius: 12,
borderLeftWidth: 4,
borderLeftColor: '#4CAF50',
},
tipsTitle: {
fontSize: 18,
fontWeight: 'bold',
color: '#fff',
marginBottom: 12,
},
tipText: {
fontSize: 14,
color: '#999',
marginBottom: 8,
lineHeight: 20,
},
goLiveButton: {
marginHorizontal: 20,
backgroundColor: '#ff0000',
borderRadius: 12,
padding: 20,
alignItems: 'center',
shadowColor: '#ff0000',
shadowOffset: { width: 0, height: 4 },
shadowOpacity:

0.3,
shadowRadius: 8,
elevation: 8,
},
buttonDisabled: {
backgroundColor: '#666',
shadowOpacity: 0,
},
goLiveButtonText: {
fontSize: 20,
fontWeight: 'bold',
color: '#fff',
marginBottom: 4,
},
goLiveButtonSubtext: {
fontSize: 14,
color: '#fff',
opacity:

0.9,
},
loadingText: {
color: '#999',
fontSize: 16,
marginTop: 12,
},
permissionTitle: {
fontSize: 24,
fontWeight: 'bold',
color: '#fff',
marginBottom: 12,
textAlign: 'center',
},
permissionText: {
fontSize: 16,
color: '#999',
textAlign: 'center',
marginBottom: 24,
paddingHorizontal: 40,
lineHeight: 24,
},
permissionButton: {
backgroundColor: '#4CAF50',
paddingHorizontal: 30,
paddingVertical: 15,
borderRadius: 12,
},
permissionButtonText: {
color: '#fff',
fontSize: 16,
fontWeight: 'bold',
},
});

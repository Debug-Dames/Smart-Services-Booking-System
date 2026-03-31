import React from 'react';
import { View, Text } from 'react-native';

const ProfileScreen: React.FC = () => {
  // …any hooks/logic…

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Profile screen</Text>
    </View>
  );
};

export default ProfileScreen;
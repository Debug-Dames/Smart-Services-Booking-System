import React from 'react';
import { View, Text } from 'react-native';

const ChatScreen: React.FC = () => {
  // …any hooks/logic…

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Chat screen</Text>
    </View>
  );
};

export default ChatScreen;
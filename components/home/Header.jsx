import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';

const Header = ({ title = 'Home' }) => {
  return (
    <>
      <StatusBar backgroundColor="#2962FF" barStyle="light-content" />
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>{title}</Text>
        </View>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#2962FF',
  },
  headerContainer: {
    width: '100%',
    backgroundColor: '#2962FF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
});

export default Header;

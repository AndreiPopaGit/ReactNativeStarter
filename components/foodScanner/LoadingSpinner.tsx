import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const LoadingSpinner: React.FC = () => {
  const [progress, setProgress] = useState<number>(0);
  const [analyzing, setAnalyzing] = useState<boolean>(true);
  
  // Animation values
  const spinValue = useRef(new Animated.Value(0)).current;
  const reverseSpinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Spin animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
    
    // Reverse spin animation
    Animated.loop(
      Animated.timing(reverseSpinValue, {
        toValue: 1,
        duration: 2500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
    
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 0.7,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();
    
    // Progress timer
    let timer: NodeJS.Timeout | undefined;
    if (analyzing) {
      timer = setInterval(() => {
        setProgress(prevProgress => {
          const newProgress = prevProgress + 1;
          if (newProgress >= 100) {
            if (timer) clearInterval(timer);
            setAnalyzing(false);
            return 100;
          }
          return newProgress;
        });
      }, 80);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [analyzing, spinValue, reverseSpinValue, pulseValue]);
  
  // Spin interpolations
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  const reverseSpin = reverseSpinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg']
  });
  
  const scale = pulseValue.interpolate({
    inputRange: [0.7, 1],
    outputRange: [0.9, 1]
  });
  
  return (
    <View style={styles.container}>
      <View style={styles.spinnerContainer}>
        {/* Outer spinning ring */}
        <Animated.View 
          style={[
            styles.outerRing, 
            { transform: [{ rotate: spin }] }
          ]} 
        />
        
        {/* Inner spinning ring - opposite direction */}
        <Animated.View 
          style={[
            styles.innerRing, 
            { transform: [{ rotate: reverseSpin }] }
          ]} 
        />
        
        {/* Center pulse */}
        <Animated.View 
          style={[
            styles.center,
            { transform: [{ scale }] }
          ]}
        >
          <Svg width={24} height={24} viewBox="0 0 20 20" fill="white">
            <Path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <Path 
              fillRule="evenodd" 
              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" 
              clipRule="evenodd" 
            />
          </Svg>
        </Animated.View>
      </View>
      
      {/* Progress text */}
      <Text style={styles.statusText}>
        {analyzing ? "Analyzing Image..." : "Analysis Complete!"}
      </Text>
      
      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar, 
            { width: `${progress}%` }
          ]} 
        />
      </View>
      
      {/* Progress percentage */}
      <Text style={styles.percentageText}>
        {progress}% {analyzing ? "processed" : "complete"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    padding: 10,
    width: '100%',
    alignSelf: 'center',
  },
  spinnerContainer: {
    width: 120,
    height: 120,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  outerRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 60,
    borderWidth: 4,
    borderTopColor: '#3B82F6', // blue-500
    borderRightColor: '#60A5FA', // blue-400
    borderBottomColor: '#93C5FD', // blue-300
    borderLeftColor: '#BFDBFE', // blue-200
  },
  innerRing: {
    position: 'absolute',
    width: '85%',
    height: '85%',
    borderRadius: 60,
    borderWidth: 4,
    borderTopColor: '#E9D5FF', // purple-200
    borderRightColor: '#D8B4FE', // purple-300
    borderBottomColor: '#C084FC', // purple-400
    borderLeftColor: '#A855F7', // purple-500
  },
  center: {
    position: 'absolute',
    width: '50%',
    height: '50%',
    borderRadius: 40,
    backgroundColor: '#818CF8', // indigo-400 to purple-500 gradient effect
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151', // gray-700
    marginBottom: 8,
  },
  progressBarContainer: {
    width: '100%',
    height: 16,
    backgroundColor: '#E5E7EB', // gray-200
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#818CF8', // indigo-500
  },
  percentageText: {
    fontSize: 14,
    color: '#6B7280', // gray-500
  },
});

export default LoadingSpinner;
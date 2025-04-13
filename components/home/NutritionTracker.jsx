import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Path, Text as SvgText } from 'react-native-svg';

function describeArc(x, y, radius, startAngle, endAngle) {
    const startRad = (startAngle - 90) * Math.PI / 180.0;
    const endRad = (endAngle - 90) * Math.PI / 180.0;
    const angleDiff = endAngle - startAngle;
    const positiveAngleDiff = angleDiff <= 0 ? angleDiff + 360 : angleDiff;
    const largeArcFlag = positiveAngleDiff <= 180 ? "0" : "1";
    const sweepFlag = "1";

    if (Math.abs(positiveAngleDiff) < 0.01 || Math.abs(positiveAngleDiff) >= 360) {
         return "";
    }

    const startX = x + radius * Math.cos(startRad);
    const startY = y + radius * Math.sin(startRad);
    const endX = x + radius * Math.cos(endRad);
    const endY = y + radius * Math.sin(endRad);

    return [
        "M", startX, startY,
        "A", radius, radius, 0, largeArcFlag, sweepFlag, endX, endY
    ].join(" ");
}

const TOTAL_ARC_SWEEP_ANGLE = 180;
const ARC_START_ANGLE = -90;

const LeftArcProgress = ({
    value,
    maxValue,
    radius = 80,
    strokeWidth = 8,
    activeColor = '#3498db',
    inactiveColor = '#e8e8e8',
    valueColor = '#2c3e50',
    suffixColor = '#7f8c8d',
    subtitleColor = '#555555',
}) => {
    const safeMaxValue = maxValue > 0 ? maxValue : 1;
    const percentage = Math.max(0, Math.min(1, value / safeMaxValue));
    const animatedProgress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animatedProgress, {
            toValue: percentage,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    }, [percentage]);

    const svgSize = radius * 2 + strokeWidth * 2;
    const center = svgSize / 2;
    const backgroundPath = describeArc(center, center, radius, ARC_START_ANGLE, ARC_START_ANGLE + TOTAL_ARC_SWEEP_ANGLE);
    const valueY = center - 20;
    const subtitleY = center;

    const [progressPath, setProgressPath] = React.useState('');

    useEffect(() => {
        const id = animatedProgress.addListener(({ value }) => {
            const angle = ARC_START_ANGLE + value * TOTAL_ARC_SWEEP_ANGLE;
            const path = describeArc(center, center, radius, ARC_START_ANGLE, angle);
            setProgressPath(path);
        });
        return () => animatedProgress.removeListener(id);
    }, [animatedProgress]);

    return (
        <View style={{ alignItems: 'center', marginBottom: -60, marginTop: 5 }}>
            <Svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
                <Path d={backgroundPath} stroke={inactiveColor} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
                {progressPath && (
                    <Path d={progressPath} stroke={activeColor} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
                )}
                <SvgText x={center} y={valueY} fill={valueColor} fontSize={28} fontWeight="600" textAnchor="end" alignmentBaseline="middle" dx="5">
                    {Math.round(value)}
                </SvgText>
                <SvgText x={center + 10} y={valueY} fill={suffixColor} fontSize={16} fontWeight="400" textAnchor="start" alignmentBaseline="middle">
                    {` / ${Math.round(safeMaxValue)}`}
                </SvgText>
                <SvgText x={center} y={subtitleY} fill={subtitleColor} fontSize={12} fontWeight="400" textAnchor="middle" alignmentBaseline="middle">
                    Kcals consumed
                </SvgText>
            </Svg>
        </View>
    );
};

const MacroBar = ({ label, color, currentValue, maxValue }) => {
    const safeMaxValue = maxValue > 0 ? maxValue : 1;
    const percentage = Math.max(0, Math.min(1, currentValue / safeMaxValue));
    const animatedWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animatedWidth, {
            toValue: percentage * 100,
            duration: 800,
            useNativeDriver: false,
        }).start();
    }, [percentage]);

    return (
        <View style={styles.macroBarContainer}>
            <View style={styles.macroTopRow}>
                <Text style={[styles.macroLabel, { color: color }]}>{label}</Text>
            </View>
            <View style={styles.macroProgressBarBackground}>
                <Animated.View style={[styles.macroProgressBarFill, { backgroundColor: color, width: animatedWidth.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]} />
            </View>
            <View style={styles.macroBottomRow}>
                <Text style={styles.macroCurrentValue}>{currentValue}g</Text>
                <Text style={styles.macroMaxValue}>{Math.round(safeMaxValue)}g</Text>
            </View>
        </View>
    );
};

const NutritionTracker = ({
    caloriesConsumed = 1100,
    calorieGoal = 1800,
    carbsConsumed = 135,
    carbGoal = 225,
    proteinConsumed = 75,
    proteinGoal = 120,
    fatConsumed = 42,
    fatGoal = 60,
}) => {
    const safeCalorieGoal = calorieGoal > 0 ? calorieGoal : 1;
    const safeCarbGoal = carbGoal > 0 ? carbGoal : 1;
    const safeProteinGoal = proteinGoal > 0 ? proteinGoal : 1;
    const safeFatGoal = fatGoal > 0 ? fatGoal : 1;

    return (
        <View style={styles.card}>
            <LeftArcProgress
                value={caloriesConsumed}
                maxValue={safeCalorieGoal}
                activeColor="#3498db"
            />
            <View style={styles.macrosRow}>
                <MacroBar label="Carbs" color="#3498db" currentValue={carbsConsumed} maxValue={safeCarbGoal} />
                <MacroBar label="Protein" color="#9b59b6" currentValue={proteinConsumed} maxValue={safeProteinGoal} />
                <MacroBar label="Fat" color="#f39c12" currentValue={fatConsumed} maxValue={safeFatGoal} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    macrosRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    macroBarContainer: {
        flex: 1,
        marginHorizontal: 4,
    },
    macroTopRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 4,
        height: 18,
    },
    macroLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    macroProgressBarBackground: {
        height: 6,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom: 4,
    },
    macroProgressBarFill: {
        height: '100%',
        borderRadius: 5,
    },
    macroBottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 1,
    },
    macroCurrentValue: {
        fontSize: 12,
        fontWeight: '600',
        color: '#444444',
    },
    macroMaxValue: {
        fontSize: 12,
        color: '#999999',
    },
});

export default NutritionTracker;
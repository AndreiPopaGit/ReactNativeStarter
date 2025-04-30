import React, { useEffect, useRef, useState } from 'react'; // Added useState import
import { View, Text, StyleSheet, Animated } from 'react-native'; // Make sure StyleSheet is imported if styles are defined elsewhere or passed as props
import Svg, { Path, Text as SvgText } from 'react-native-svg';

// ------- Helper Function for Arc Path -------
// (Keep this function as it's essential for LeftArcProgress)
function describeArc(x, y, radius, startAngle, endAngle) {
    const startRad = (startAngle - 90) * Math.PI / 180.0;
    const endRad = (endAngle - 90) * Math.PI / 180.0;

    // Ensure angles are valid numbers, default if not
    const validStartAngle = isNaN(startAngle) ? 0 : startAngle;
    const validEndAngle = isNaN(endAngle) ? 0 : endAngle;

    const angleDiff = validEndAngle - validStartAngle;
    const positiveAngleDiff = (angleDiff % 360 + 360) % 360;

     if (Math.abs(positiveAngleDiff) < 0.01 || Math.abs(positiveAngleDiff - 360) < 0.01 ) {
         return "";
    }

    const largeArcFlag = positiveAngleDiff <= 180 ? "0" : "1";
    const sweepFlag = "1";

    const startX = x + radius * Math.cos(startRad);
    const startY = y + radius * Math.sin(startRad);
    const endX = x + radius * Math.cos(endRad);
    const endY = y + radius * Math.sin(endRad);

    if (isNaN(startX) || isNaN(startY) || isNaN(endX) || isNaN(endY)) {
        console.error("NaN coordinate detected in describeArc", { x, y, radius, startAngle, endAngle, startRad, endRad });
        return "";
    }

    return [
        "M", startX, startY,
        "A", radius, radius, 0, largeArcFlag, sweepFlag, endX, endY
    ].join(" ");
}

const TOTAL_ARC_SWEEP_ANGLE = 180;
const ARC_START_ANGLE = -90;

// ------- LeftArcProgress Component -------
const LeftArcProgress = ({
    value, // Prop can still be potentially non-numeric
    maxValue,
    radius = 80, // Default value using JS destructuring
    strokeWidth = 8,
    activeColor = '#F472B6',
    inactiveColor = '#e8e8e8',
    valueColor = '#ffffff',
    suffixColor = '#ffffff',
    subtitleColor = '#ffffff',
}) => {
    // Ensure numeric values, default to 0
    const numericValue = Number(value) || 0;
    const numericMaxValue = Number(maxValue) || 0;

    const safeMaxValue = numericMaxValue > 0 ? numericMaxValue : 1; // Avoid division by zero
    const percentage = Math.max(0, Math.min(1, numericValue / safeMaxValue)); // Cap percentage

    const animatedProgress = useRef(new Animated.Value(percentage)).current; // Initialize with current percentage

    // Animate when percentage changes
    useEffect(() => {
        Animated.timing(animatedProgress, {
            toValue: percentage,
            duration: 800,
            useNativeDriver: false,
        }).start();
    }, [percentage, animatedProgress]);

    const svgSize = radius * 2 + strokeWidth * 2;
    const center = svgSize / 2;
    const backgroundPath = describeArc(center, center, radius, ARC_START_ANGLE, ARC_START_ANGLE + TOTAL_ARC_SWEEP_ANGLE);
    const valueY = center - 20;
    const subtitleY = center;

    const [progressPath, setProgressPath] = useState(''); // Use React.useState or just useState

    // Listener to update the path string based on animation
    useEffect(() => {
        const listenerId = animatedProgress.addListener(({ value: animatedPercentageValue }) => {
            const currentAngle = ARC_START_ANGLE + Math.min(1, Math.max(0, animatedPercentageValue)) * TOTAL_ARC_SWEEP_ANGLE;
            const clampedAngle = Math.max(ARC_START_ANGLE, Math.min(ARC_START_ANGLE + TOTAL_ARC_SWEEP_ANGLE, currentAngle));
            const path = describeArc(center, center, radius, ARC_START_ANGLE, clampedAngle);
            setProgressPath(path || '');
        });

        // Set initial path correctly
        const initialAngle = ARC_START_ANGLE + Math.min(1, Math.max(0, animatedProgress._value)) * TOTAL_ARC_SWEEP_ANGLE;
        const initialPath = describeArc(center, center, radius, ARC_START_ANGLE, initialAngle);
        setProgressPath(initialPath || '');

        return () => {
            animatedProgress.removeListener(listenerId);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [animatedProgress]);

    return (
        <View style={{ alignItems: 'center', marginBottom: -60, marginTop: 5 }}>
            <Svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
                <Path
                    d={backgroundPath}
                    stroke={inactiveColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    fill="none"
                />
                {progressPath ? (
                    <Path
                        d={progressPath}
                        stroke={activeColor}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        fill="none"
                    />
                ) : null}
                <SvgText
                    x={center}
                    y={valueY}
                    fill={valueColor}
                    fontSize={28}
                    fontWeight="600"
                    textAnchor="end"
                    alignmentBaseline="middle"
                    dx="5"
                >
                    {Math.round(numericValue)}
                </SvgText>
                <SvgText
                    x={center + 10}
                    y={valueY}
                    fill={suffixColor}
                    fontSize={16}
                    fontWeight="400"
                    textAnchor="start"
                    alignmentBaseline="middle"
                >
                    {` / ${Math.round(numericMaxValue)}`}
                </SvgText>
                <SvgText
                    x={center}
                    y={subtitleY}
                    fill={subtitleColor}
                    fontSize={12}
                    fontWeight="400"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                >
                    Kcals consumed
                </SvgText>
            </Svg>
        </View>
    );
};

// ------- MacroBar Component -------
const MacroBar = ({ label, color, currentValue, maxValue }) => {
    // Ensure numeric values, default to 0
    const numericCurrentValue = Number(currentValue) || 0;
    const numericMaxValue = Number(maxValue) || 0;

    const safeMaxValue = numericMaxValue > 0 ? numericMaxValue : 1;
    const percentage = Math.max(0, Math.min(1, numericCurrentValue / safeMaxValue));

    const animatedWidthPercent = useRef(new Animated.Value(percentage * 100)).current; // Initialize with current percentage

    // Animate when percentage changes
    useEffect(() => {
        Animated.timing(animatedWidthPercent, {
            toValue: percentage * 100,
            duration: 800,
            useNativeDriver: false,
        }).start();
    }, [percentage, animatedWidthPercent]);

    return (
        // Assumes styles.macroBarContainer etc. are defined/imported
        <View style={styles.macroBarContainer}>
            <View style={styles.macroTopRow}>
                <Text style={[styles.macroLabel, { color: color }]}>{label}</Text>
            </View>
            <View style={styles.macroProgressBarBackground}>
                <Animated.View
                    style={[
                        styles.macroProgressBarFill,
                        {
                            backgroundColor: color,
                            width: animatedWidthPercent.interpolate({
                                inputRange: [0, 100],
                                outputRange: ['0%', '100%']
                            })
                        }
                    ]}
                />
            </View>
            <View style={styles.macroBottomRow}>
                <Text style={styles.macroCurrentValue}>{numericCurrentValue.toFixed(1)}g</Text>
                <Text style={styles.macroMaxValue}>{Math.round(numericMaxValue)}g</Text>
            </View>
        </View>
    );
};


// ------- NutritionTracker Component -------
const NutritionTracker = ({
    caloriesConsumed,
    calorieGoal,
    carbsConsumed,
    carbGoal,
    proteinConsumed,
    proteinGoal,
    fatConsumed,
    fatGoal,
}) => {
    // Validate props, default to 0 if invalid input
    const validCaloriesConsumed = Number(caloriesConsumed) || 0;
    const validCalorieGoal = Number(calorieGoal) || 0;
    const validCarbsConsumed = Number(carbsConsumed) || 0;
    const validCarbGoal = Number(carbGoal) || 0;
    const validProteinConsumed = Number(proteinConsumed) || 0;
    const validProteinGoal = Number(proteinGoal) || 0;
    const validFatConsumed = Number(fatConsumed) || 0;
    const validFatGoal = Number(fatGoal) || 0;

    // Pass validated numbers down to child components
    // Assumes styles.card and styles.macrosRow are defined/imported
    return (
        <View style={styles.card}>
            <LeftArcProgress
                value={validCaloriesConsumed}
                maxValue={validCalorieGoal}
                activeColor="#F472B6"
            />
            <View style={styles.macrosRow}>
                <MacroBar label="Carbs" color="#F472B6" currentValue={validCarbsConsumed} maxValue={validCarbGoal} />
                <MacroBar label="Protein" color="#F472B6" currentValue={validProteinConsumed} maxValue={validProteinGoal} />
                <MacroBar label="Fat" color="#F472B6" currentValue={validFatConsumed} maxValue={validFatGoal} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#581C87',
        borderBottomEndRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 14,
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
        color: '#ffffff',
    },
    macroMaxValue: {
        fontSize: 12,
        color: '#F472B6',
    },
});

export default NutritionTracker;
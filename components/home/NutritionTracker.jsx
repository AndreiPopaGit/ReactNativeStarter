import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Text as SvgText } from 'react-native-svg';

// Helper function for SVG Arc
function describeArc(x, y, radius, startAngle, endAngle) {
    const startRad = (startAngle - 90) * Math.PI / 180.0;
    const endRad = (endAngle - 90) * Math.PI / 180.0;
    const angleDiff = endAngle - startAngle;
    // Ensure angleDiff handles wrapping around 360 if necessary
    const positiveAngleDiff = angleDiff <= 0 ? angleDiff + 360 : angleDiff;
    const largeArcFlag = positiveAngleDiff <= 180 ? "0" : "1";
    // Sweep flag should be 1 for clockwise if endAngle > startAngle (or wraps around)
    const sweepFlag = "1"; // Always clockwise for our setup

    if (Math.abs(positiveAngleDiff) < 0.01 || Math.abs(positiveAngleDiff) >= 360) {
         // Handle zero or full circle cases if necessary, for now, return empty for zero.
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

// --- Constants for Left Side Arc ---
const TOTAL_ARC_SWEEP_ANGLE = 180; // 180 degree sweep for left side
const ARC_START_ANGLE = -90;        // Start at top (12 o'clock)
const ARC_END_ANGLE = ARC_START_ANGLE + TOTAL_ARC_SWEEP_ANGLE; // Ends at bottom (6 o'clock)

// --- Left Arc Progress Component ---
const LeftArcProgress = ({
    value,
    maxValue,
    radius = 120,
    strokeWidth = 14,
    activeColor = '#3498db',
    inactiveColor = '#e8e8e8',
    valueColor = '#2c3e50',
    suffixColor = '#7f8c8d',
    subtitleColor = '#555555',
}) => {
    const safeMaxValue = maxValue > 0 ? maxValue : 1;
    const percentage = Math.max(0, Math.min(1, value / safeMaxValue));
    const progressAngle = percentage * TOTAL_ARC_SWEEP_ANGLE;
    const currentProgressEndAngle = ARC_START_ANGLE + progressAngle;

    // SVG container needs to fit the arc
    const svgSize = radius * 2 + strokeWidth * 2;
    const center = svgSize / 2;

    const backgroundPath = describeArc(center, center, radius, ARC_START_ANGLE, ARC_END_ANGLE);
    const progressPath = value > 0 ? describeArc(center, center, radius, ARC_START_ANGLE, currentProgressEndAngle) : "";

    // Text positioning for left-side arc (text centered in SVG)
    const valueY = center - 25; // Move value text up slightly
    const subtitleY = center ; // Position subtitle below

    return (
        <View style={{ alignItems: 'center', marginBottom: -90, marginTop: 10 }}>
            {/* Square SVG container */}
            <Svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
                {/* Background Arc */}
                <Path
                    d={backgroundPath}
                    stroke={inactiveColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    fill="none"
                />
                {/* Progress Arc */}
                {progressPath && (
                     <Path
                        d={progressPath}
                        stroke={activeColor}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        fill="none"
                    />
                )}
                
                {/* Main Value */}
                <SvgText
                    x={center}
                    y={valueY}
                    fill={valueColor}
                    fontSize={40}
                    fontWeight="600"
                    textAnchor="end"
                    alignmentBaseline="middle"
                    dx="5"
                >
                    {Math.round(value)}
                </SvgText>
                
                {/* Suffix */}
                <SvgText
                    x={center + 10}
                    y={valueY}
                    fill={suffixColor}
                    fontSize={20}
                    fontWeight="400"
                    textAnchor="start"
                    alignmentBaseline="middle"
                >
                    {` / ${Math.round(safeMaxValue)}`}
                </SvgText>
                
                {/* Subtitle Text */}
                <SvgText
                    x={center}
                    y={subtitleY}
                    fill={subtitleColor}
                    fontSize={14}
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

// --- Macronutrient Bar Component (Internal) ---
const MacroBar = ({ label, color, currentValue, maxValue }) => {
    const safeMaxValue = maxValue > 0 ? maxValue : 1;
    const progress = Math.max(0, Math.min(100, (currentValue / safeMaxValue) * 100));
    return (
        <View style={styles.macroBarContainer}>
            <View style={styles.macroTopRow}>
                <Text style={[styles.macroLabel, { color: color }]}>{label}</Text>
            </View>
            <View style={styles.macroProgressBarBackground}>
                <View style={[styles.macroProgressBarFill, { backgroundColor: color, width: `${progress}%` }]} />
            </View>
            <View style={styles.macroBottomRow}>
                <Text style={styles.macroCurrentValue}>{currentValue}g</Text>
                <Text style={styles.macroMaxValue}>{Math.round(safeMaxValue)}g</Text>
            </View>
        </View>
    );
};

// --- Main Nutrition Tracker Component ---
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
            <Text style={styles.macroTitle}>Macronutrients</Text>
            <View style={styles.macrosRow}>
                <MacroBar label="Carbs" color="#3498db" currentValue={carbsConsumed} maxValue={safeCarbGoal} />
                <MacroBar label="Protein" color="#9b59b6" currentValue={proteinConsumed} maxValue={safeProteinGoal} />
                <MacroBar label="Fat" color="#f39c12" currentValue={fatConsumed} maxValue={safeFatGoal} />
            </View>
        </View>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2.5,
        elevation: 3,
    },
    macroTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
        textAlign: 'center',
        marginTop: 0,
        marginBottom: 18,
        borderTopWidth: 1,
        borderTopColor: '#eeeeee',
        paddingTop: 18,
    },
    macrosRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    macroBarContainer: {
       flex: 1,
       marginHorizontal: 6,
    },
    macroTopRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 5,
        height: 20,
    },
    macroLabel: {
        fontSize: 15,
        fontWeight: '600',
    },
    macroProgressBarBackground: {
        height: 9,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom: 5,
    },
    macroProgressBarFill: {
        height: '100%',
        borderRadius: 5,
    },
    macroBottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 2,
    },
    macroCurrentValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#444444',
    },
    macroMaxValue: {
        fontSize: 13,
        color: '#999999',
    },
});

export default NutritionTracker;
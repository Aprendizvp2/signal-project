import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

interface Props {
    onPress: () => void;
    label?: string;
}

export const CustomBackButton = ({ onPress, label = '‹ Volver' }: Props) => (
    <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        hitSlop={12}
    >
        <Text style={styles.text}>{label}</Text>
    </Pressable>
);

const styles = StyleSheet.create({
    button: { alignSelf: 'flex-start', paddingVertical: 6, paddingRight: 12 },
    pressed: { opacity: 0.5 },
    text: { color: '#0057F0', fontSize: 16, fontWeight: '600' },
});
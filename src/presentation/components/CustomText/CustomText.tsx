import React from 'react';
import { Text, StyleSheet, TextProps } from 'react-native';

type Variant = 'title' | 'subtitle' | 'body' | 'caption' | 'error';

interface Props extends TextProps {
  variant?: Variant;
  children: React.ReactNode;
}

export const CustomText = ({ variant = 'body', style, children, ...rest }: Props) => (
  <Text style={[styles.base, styles[variant], style]} {...rest}>
    {children}
  </Text>
);

const styles = StyleSheet.create({
  base: { color: '#111' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 12 },
  subtitle: { fontSize: 16, fontWeight: '600' },
  body: { fontSize: 14 },
  caption: { fontSize: 11, color: '#999' },
  error: { color: '#a00', textAlign: 'center' },
});
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ArrowButtonProps } from '../../types/ArrowButtonProps';

export default function ArrowButton({ direction, onPress, side = 'right' }: ArrowButtonProps) {
  const positionStyle =
    Platform.OS === 'web'
      ? [styles.arrowButton, side === 'left' ? styles.leftWeb : styles.rightWeb]
      : [styles.arrowButton, side === 'left' ? styles.left : styles.right];
  return (
    <TouchableOpacity onPress={onPress} style={positionStyle}>
      <Text style={styles.arrowText}>{direction === 'left' ? '◀' : '▶'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  arrowButton: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    top: '50%',
    transform: [{ translateY: -18 }],
    zIndex: 100,
    backgroundColor: '#fff',
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    boxShadow: '0px 2px 8px rgba(0,0,0,0.12)',
  },
  left: {
    left: 0,
  },
  right: {
    right: 0,
  },
  leftWeb: {
    left: 0,
  },
  rightWeb: {
    right: 0,
  },
  arrowText: {
    fontSize: 22,
    color: '#007bff',
    fontWeight: 'bold',
  },
}); 
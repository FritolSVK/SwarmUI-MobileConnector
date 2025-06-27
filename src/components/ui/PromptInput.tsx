import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { PromptInputProps } from '../../types/PromptInputProps';

export default function PromptInput({ prompt, setPrompt, onGenerate, loading, generationStatus }: PromptInputProps) {
  const { theme } = useTheme();

  const getButtonTitle = () => {
    if (loading) {
      return 'Generating...';
    }
    return 'Generate';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.panel, borderColor: theme.border }]}>
      <TextInput
        style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
        value={prompt}
        onChangeText={setPrompt}
        placeholder="Enter your prompt"
        placeholderTextColor={theme.secondaryText}
        editable={!loading}
        multiline
        numberOfLines={2}
      />
      <View style={styles.buttonContainer}>
        {generationStatus && (
          <View style={styles.floatingStatus}>
            {generationStatus}
          </View>
        )}
        <TouchableOpacity
          style={[styles.generateButton, { backgroundColor: theme.accent, opacity: loading ? 0.6 : 1 }]}
          onPress={onGenerate}
          disabled={loading}
        >
          <Text style={[styles.generateButtonText, { color: theme.text }]}>{getButtonTitle()}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
    marginRight: 10,
  },
  buttonContainer: {
    position: 'relative',
  },
  floatingStatus: {
    position: 'absolute',
    bottom: 60,
    right: 0,
    backgroundColor: 'rgba(128, 128, 128, 0.9)',
    padding: 8,
    borderRadius: 6,
    minWidth: 120,
    zIndex: 1000,
  },
  generateButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 
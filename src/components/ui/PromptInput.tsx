import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import PromptInputStyles from '../../styles/PromptInputStyles';
import { PromptInputProps } from '../../types/PromptInputProps';

interface PromptInputWithDisabledProps extends PromptInputProps {
  disabled?: boolean;
}

export default function PromptInput({ prompt, setPrompt, onGenerate, loading, generationStatus, disabled }: PromptInputWithDisabledProps) {
  const { theme } = useTheme();

  const getButtonText = () => {
    if (!disabled && loading) return 'Generating...';
    return 'Generate';
  };

  return (
    <View style={[
      PromptInputStyles.container, 
      PromptInputStyles.themedContainer,
      { 
        backgroundColor: theme.panel, 
        borderColor: theme.border,
      }
    ]}>
      <TextInput
        style={[
          PromptInputStyles.input, 
          PromptInputStyles.themedInput,
          { 
            backgroundColor: theme.background, 
            color: theme.text, 
            borderColor: theme.border,
          }
        ]}
        value={prompt}
        onChangeText={setPrompt}
        placeholder="Enter your prompt here..."
        placeholderTextColor={theme.secondaryText}
        multiline
        editable={!disabled}
        returnKeyType="done"
        blurOnSubmit={true}
      />
      <View style={PromptInputStyles.buttonContainer}>
        <TouchableOpacity
          style={[
            PromptInputStyles.generateButton,
            PromptInputStyles.themedButton,
            { 
              backgroundColor: disabled ? theme.disabledAccent : theme.accent,
            }
          ]}
          onPress={onGenerate}
          disabled={disabled || loading}
        >
          <Text style={[
            PromptInputStyles.generateButtonText, 
            PromptInputStyles.themedButtonText,
            { 
              color: disabled ? theme.secondaryText : theme.text,
            }
          ]}>
            {getButtonText()}
          </Text>
        </TouchableOpacity>
      </View>
      {generationStatus && (
        <View style={[
          PromptInputStyles.floatingStatus, 
          PromptInputStyles.themedFloatingStatus,
          { 
            backgroundColor: theme.panel,
          }
        ]}>
          {generationStatus}
        </View>
      )}
    </View>
  );
} 
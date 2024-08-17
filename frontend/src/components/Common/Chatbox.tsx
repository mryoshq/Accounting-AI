import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaRegUserCircle, FaRobot, FaTrash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { UtilsService, ChatbotQuery } from '../../client'; // Adjust the import path as needed

interface Message {
  text: string;
  isUser: boolean;
}

interface ChatBoxProps {
  mode: 'planner' | 'chat';
}

const TypingIndicator: React.FC = () => (
  <HStack alignSelf="flex-start">
    <Icon as={FaRobot} boxSize={7} color="green.500" />
    <HStack spacing={1}>
      {[0, 1, 2].map((dot) => (
        <motion.div
          key={dot}
          animate={{ y: ['0%', '-50%', '0%'] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
            delay: dot * 0.1,
          }}
        >
          <Box w={2} h={2} bg="green.500" borderRadius="full" />
        </motion.div>
      ))}
    </HStack>
  </HStack>
);

const MessageContent: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  return (
    <VStack align="start" spacing={1}>
      {lines.map((line: string, index: number) => {
        if (line.match(/^\d+\./)) {
          // This is a numbered item
          return (
            <Text key={index} fontWeight="bold">
              {line}
            </Text>
          );
        } else if (line.trim().startsWith('-')) {
          // This is a bullet point
          return (
            <Text key={index} pl={4}>
              {line}
            </Text>
          );
        } else {
          // This is a regular line
          return <Text key={index}>{line}</Text>;
        }
      })}
    </VStack>
  );
};

export const ChatBox: React.FC<ChatBoxProps> = ({ mode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const userBgColor = useColorModeValue('blue.100', 'blue.700');
  const botBgColor = useColorModeValue('green.100', 'green.700');
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const chatbotQuery: ChatbotQuery = { query: input };

    const chatbotService = mode === 'planner' ? UtilsService.chatbot_planner : UtilsService.chatbot_chat;

    abortControllerRef.current = new AbortController();

    chatbotService({ requestBody: chatbotQuery })
      .then((response) => {
        let botResponse: string;
        if (typeof response === 'object' && response !== null && 'response' in response) {
          botResponse = response.response as string;
        } else if (typeof response === 'string') {
          botResponse = response;
        } else {
          botResponse = 'Unexpected response format';
        }
        const botMessage: Message = { text: botResponse, isUser: false };
        setMessages(prev => [...prev, botMessage]);
      })
      .catch((error) => {
        if (error.name === 'AbortError') {
          console.log('Request was aborted');
        } else {
          console.error('Error:', error);
          const errorMessage: Message = { text: 'Sorry, an error occurred.', isUser: false };
          setMessages(prev => [...prev, errorMessage]);
        }
      })
      .finally(() => {
        setIsLoading(false);
        abortControllerRef.current = null;
      });
  };

  const handleReset = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([]);
    setInput('');
    setIsLoading(false);
  };

  return (
    <Box 
      w="100%" 
      h="850px" 
      borderWidth="1px" 
      borderRadius="lg" 
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      <Box flex="1" overflowY="auto" p={4} bg={bgColor}>
        <VStack align="stretch" spacing={4} width="100%">
          {messages.map((message, index) => (
            <HStack key={index} justifyContent={message.isUser ? 'flex-end' : 'flex-start'} alignItems="flex-start" width="100%">
              {!message.isUser && (
                <Icon 
                  as={FaRobot} 
                  boxSize={7} 
                  color="green.500"
                  mt={3}
                />
              )}
              <Box 
                bg={message.isUser ? userBgColor : botBgColor} 
                p={4} 
                borderRadius="lg"
                maxW="70%"
              >
                <MessageContent text={message.text} />
              </Box>
              {message.isUser && (
                <Icon 
                  as={FaRegUserCircle} 
                  boxSize={7} 
                  color="blue.500"
                  mt={3}
                />
              )}
            </HStack>
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </VStack>
      </Box>
      <Box p={4} borderTopWidth="1px" bg={useColorModeValue('white', 'gray.800')}>
        <form onSubmit={handleSubmit}>
          <HStack>
            <Input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Type a message..."
              disabled={isLoading}
              size="lg"
            />
            <Button type="submit" colorScheme="blue" isLoading={isLoading} size="lg">
              Send
            </Button>
            <Button 
              onClick={handleReset} 
              variant="ghost"
              leftIcon={<Icon as={FaTrash} />}
              isDisabled={isLoading || messages.length === 0}
              size="lg"
            >
              Reset
            </Button>
          </HStack>
        </form>
      </Box>
    </Box>
  );
};
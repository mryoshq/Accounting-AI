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
import { FaUser, FaRobot } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { UtilsService, ChatbotQuery } from '../../client'; // Adjust the import path as needed

interface Message {
  text: string;
  isUser: boolean;
}

const TypingIndicator: React.FC = () => (
  <HStack alignSelf="flex-start">
    <Icon as={FaRobot} boxSize={6} color="green.500" />
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

export const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const userBgColor = useColorModeValue('blue.100', 'blue.700');
  const botBgColor = useColorModeValue('green.100', 'green.700');

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

    UtilsService.chatbot({ requestBody: chatbotQuery })
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
        console.error('Error:', error);
        const errorMessage: Message = { text: 'Sorry, an error occurred.', isUser: false };
        setMessages(prev => [...prev, errorMessage]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Box 
      w="100%" 
      maxW="500px" 
      h="500px" 
      borderWidth="1px" 
      borderRadius="lg" 
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      <Box flex="1" overflowY="auto" p={4} bg={bgColor}>
        <VStack align="stretch" spacing={4}>
          {messages.map((message, index) => (
            <HStack key={index} alignSelf={message.isUser ? 'flex-end' : 'flex-start'}>
              <Icon 
                as={message.isUser ? FaUser : FaRobot} 
                boxSize={6} 
                color={message.isUser ? 'blue.500' : 'green.500'}
              />
              <Box 
                bg={message.isUser ? userBgColor : botBgColor} 
                p={2} 
                borderRadius="lg"
                maxW="70%"
              >
                <Text>{message.text}</Text>
              </Box>
            </HStack>
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </VStack>
      </Box>
      <Box p={4} borderTopWidth="1px">
        <form onSubmit={handleSubmit}>
          <HStack>
            <Input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Type a message..."
              disabled={isLoading}
            />
            <Button type="submit" colorScheme="blue" isLoading={isLoading}>
              Send
            </Button>
          </HStack>
        </form>
      </Box>
    </Box>
  );
};
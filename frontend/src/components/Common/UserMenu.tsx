import { useState, useRef } from "react";
import {
  Box,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorMode,
  useColorModeValue,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  HStack,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";
import { FaBars, FaRegCommentDots, FaMinus } from "react-icons/fa";
import { FiLogOut, FiUser, FiMoon, FiSun } from "react-icons/fi";
import useAuth from "../../hooks/useAuth";
import { ChatBox, ChatBoxRef } from "../Common/Chatbox"; // Adjust the import path as needed

interface Message {
  text: string;
  isUser: boolean;
}

const UserMenu = () => {
  const { logout } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const iconColor = useColorModeValue("green.500", "white");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasMessages, setHasMessages] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const chatBoxRef = useRef<ChatBoxRef>(null);

  const handleLogout = async () => {
    logout();
  };

  const handleChatOpen = () => {
    setIsMinimized(false);
    onOpen();
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    onClose();
  };

  const handleClose = () => {
    setIsMinimized(false);
    setHasMessages(false);
    setMessages([]);
    if (chatBoxRef.current) {
      chatBoxRef.current.resetMessages();
    }
    onClose();
  };

  const handleChatStateChange = (newHasMessages: boolean) => {
    setHasMessages(newHasMessages);
  };

  const handleMessagesChange = (newMessages: Message[]) => {
    setMessages(newMessages);
    setHasMessages(newMessages.length > 0);
  };

  const chatIcon = isMinimized && hasMessages ? (
    <Box position="relative">
      <FaRegCommentDots />
      <Box
        position="absolute"
        top="-2px"
        right="-2px"
        bg="red.500"
        borderRadius="full"
        w="10px"
        h="10px"
      />
    </Box>
  ) : (
    <FaRegCommentDots />
  );

  return (
    <>
      {/* Desktop */}
      <Box display={{ base: "none", md: "flex" }} position="fixed" top={4} right={4} alignItems="center">
        <IconButton
          aria-label="Toggle Color Mode"
          icon={colorMode === "light" ? <FiMoon /> : <FiSun />}
          onClick={toggleColorMode}
          mr={2}
          variant="ghost"
          color={iconColor}
        />
        <IconButton
          aria-label="Chat bot"
          icon={chatIcon}
          mr={2}
          variant="ghost"
          color={iconColor}
          onClick={handleChatOpen}
        />
        
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="User Options"
            icon={<FaBars />}
            bg="transparent"
            _hover={{ bg: "transparent" }}
            _active={{ bg: "transparent" }}
            isRound
            color={iconColor}
           />
          <MenuList>
            <MenuItem icon={<FiUser fontSize="18px" />} as={Link} to="settings">
              My profile
            </MenuItem>
            <MenuItem
              icon={<FiLogOut fontSize="18px" />}
              onClick={handleLogout}
              color="ui.danger"
              fontWeight="bold"
            >
              Log out
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>

      {/* Mobile */}
      <Box display={{ base: "flex", md: "none" }} position="fixed" bottom={4} right={4} alignItems="center">
        <IconButton
          aria-label="Toggle Color Mode"
          icon={colorMode === "light" ? <FiMoon /> : <FiSun />}
          onClick={toggleColorMode}
          mr={2}
          variant="ghost"
          color={iconColor}
        />
        <IconButton
          aria-label="Chat bot"
          icon={chatIcon}
          mr={2}
          variant="ghost"
          color={iconColor}
          onClick={handleChatOpen}
        />
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="User Options"
            icon={<FaBars />}
            bg="transparent"
            _hover={{ bg: "transparent" }}
            _active={{ bg: "transparent" }}
            isRound
            color={iconColor}
          />
          <MenuList>
            <MenuItem icon={<FiUser fontSize="18px" />} as={Link} to="settings">
              My profile
            </MenuItem>
            <MenuItem
              icon={<FiLogOut fontSize="18px" />}
              onClick={handleLogout}
              color="ui.danger"
              fontWeight="bold"
            >
              Log out
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>

      {/* ChatBox Drawer */}
      <Drawer 
        isOpen={isOpen} 
        placement="right" 
        onClose={handleClose}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <HStack justifyContent="space-between">
              <Text>ChatBot</Text>
              <HStack>
                <Tooltip label={hasMessages ? "Minimize" : "Chat is empty"}>
                  <IconButton
                    aria-label="Minimize"
                    icon={<FaMinus />}
                    size="sm"
                    onClick={handleMinimize}
                    isDisabled={!hasMessages}
                  />
                </Tooltip>
                <DrawerCloseButton position="static" />
              </HStack>
            </HStack>
          </DrawerHeader>
          <DrawerBody p={0}>
            <ChatBox 
              ref={chatBoxRef}
              messages={messages}
              onMessagesChange={handleMessagesChange}
              onStateChange={handleChatStateChange}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default UserMenu;
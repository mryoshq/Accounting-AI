import { useState } from "react";
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
} from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";
import { FaBars, FaRegCommentDots } from "react-icons/fa";
import { FiLogOut, FiUser, FiMoon, FiSun } from "react-icons/fi";
import useAuth from "../../hooks/useAuth";
import { ChatBox } from "../Common/Chatbox"; // Adjust the import path as needed

const UserMenu = () => {
  const { logout } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const iconColor = useColorModeValue("green.500", "white");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [chatMode, setChatMode] = useState<'chat' | 'planner'>('chat');

  const handleLogout = async () => {
    logout();
  };

  const handleChatOpen = (mode: 'chat' | 'planner') => {
    setChatMode(mode);
    onOpen();
  };

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
          icon={<FaRegCommentDots />}
          mr={2}
          variant="ghost"
          color={iconColor}
          onClick={() => handleChatOpen('chat')}
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
          icon={<FaRegCommentDots />}
          mr={2}
          variant="ghost"
          color={iconColor}
          onClick={() => handleChatOpen('chat')}
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
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="lg">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Chat</DrawerHeader>
          <DrawerBody p={0}>
            <ChatBox mode={chatMode} onClose={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default UserMenu;
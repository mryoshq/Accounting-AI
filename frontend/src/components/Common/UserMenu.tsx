import React, { useState, useRef, ReactElement } from "react";
import {
  Box,
  IconButton,
  IconButtonProps,
  Menu,
  MenuItem,
  MenuList,
  MenuButton,
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
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Avatar,
  VStack,
  Divider,
} from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";
import { FaBars, FaRegCommentDots, FaMinus, FaPhoneSquare, FaTools, FaTasks, FaChartBar } from "react-icons/fa";
import { FiLogOut, FiUser, FiMoon, FiSun } from "react-icons/fi";
import useAuth from "../../hooks/useAuth";
import { ChatBox, ChatBoxRef } from "../Common/Chatbox";
import SupplierContacts from "../../routes/_layout/suppliercontacts";
import CustomerContacts from "../../routes/_layout/customercontacts";
import ReportingComponent from "../Tools/ReportingComponent"; 
import TasksComponent from "../Tools/TasksComponent"; 

const CustomIconButton = React.forwardRef<HTMLButtonElement, IconButtonProps & { icon: ReactElement }>((props, ref) => (
  <IconButton ref={ref} {...props} />
));

interface TooltipMenuProps {
  label: string;
  icon: ReactElement;
  children: React.ReactNode;
}

const TooltipMenu: React.FC<TooltipMenuProps> = ({ label, icon, children }) => {
  return (
    <Menu>
      <Tooltip label={label} hasArrow>
        <MenuButton
          as={CustomIconButton}
          aria-label={label}
          icon={icon}
          variant="ghost"
          color={useColorModeValue("green.500", "white")}
        />
      </Tooltip>
      <MenuList>{children}</MenuList>
    </Menu>
  );
};

const UserMenu: React.FC = () => {
  const { logout, user } = useAuth();
  const auth = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const iconColor = useColorModeValue("green.500", "white");
  const { isOpen: isChatOpen, onOpen: onChatOpen, onClose: onChatClose } = useDisclosure();
  const { isOpen: isContactsOpen, onOpen: onContactsOpen, onClose: onContactsClose } = useDisclosure();
  const { isOpen: isReportingOpen, onOpen: onReportingOpen, onClose: onReportingClose } = useDisclosure();
  const { isOpen: isTasksOpen, onOpen: onTasksOpen, onClose: onTasksClose } = useDisclosure();
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasMessages, setHasMessages] = useState(false);
  const chatBoxRef = useRef<ChatBoxRef>(null);

  const handleLogout = async () => {
    logout();
  };

  const handleChatOpen = () => {
    setIsMinimized(false);
    onChatOpen();
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    onChatClose();
  };

  const handleClose = () => {
    setIsMinimized(false);
    setHasMessages(false);
    if (chatBoxRef.current) {
      chatBoxRef.current.resetMessages();
    }
    onChatClose();
  };

  const handleChatStateChange = (newHasMessages: boolean) => {
    setHasMessages(newHasMessages);
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

  const ReportingWrapper = () => (
    <MenuItem icon={<FaChartBar fontSize="18px" />} onClick={onReportingOpen}>
      Reporting
    </MenuItem>
  );

  const TasksWrapper = () => (
    <MenuItem icon={<FaTasks fontSize="18px" />} onClick={onTasksOpen}>
      Tasks
    </MenuItem>
  );

  const UserMenuContent = () => (
    <VStack align="stretch" spacing={3} p={3}>
      <HStack>
        <Avatar
          size="lg"
          name={user?.full_name || user?.email}
          src={user?.profile_picture ? `data:image/jpeg;base64,${user.profile_picture}` : undefined}
        />
        <VStack align="start" spacing={0}>
          <Text fontWeight="bold">{user?.full_name || "User"}</Text>
          <Text fontSize="sm" color="gray.500">{user?.email}</Text>
        </VStack>
      </HStack>
      <Divider />
      <MenuItem icon={<FiUser fontSize="18px" />} as={Link} to="/settings">
  My Profile
</MenuItem>
      <TasksWrapper />
      <MenuItem
        icon={<FiLogOut fontSize="18px" />}
        onClick={handleLogout}
        color="ui.danger"
        fontWeight="bold"
      >
        Log out
      </MenuItem>
    </VStack>
  );

  return (
    <>
      {/* Desktop */}
      <Box display={{ base: "none", md: "flex" }} position="fixed" top={4} right={4} alignItems="center" zIndex={1000}>
        <Tooltip label={`Switch to ${colorMode === "light" ? "Dark" : "Light"} Mode`} hasArrow>
          <CustomIconButton
            aria-label="Toggle Color Mode"
            icon={colorMode === "light" ? <FiMoon /> : <FiSun />}
            onClick={toggleColorMode}
            mr={2}
            variant="ghost"
            color={iconColor}
          />
        </Tooltip>

        <Tooltip label="Contacts" hasArrow>
          <CustomIconButton
            aria-label="Stakeholders Contacts"
            icon={<FaPhoneSquare />}
            onClick={onContactsOpen}
            variant="ghost"
            color={iconColor}
            mr={2}
          />
        </Tooltip>

        <Tooltip label="ChatBot" hasArrow>
          <CustomIconButton
            aria-label="Chat bot"
            icon={chatIcon}
            mr={2}
            variant="ghost"
            color={iconColor}
            onClick={handleChatOpen}
          />
        </Tooltip>

        <TooltipMenu label="Tools" icon={<FaTools />}>
          <TasksWrapper />
          <ReportingWrapper />
        </TooltipMenu>

        <Menu>
          <Tooltip label="User Options" hasArrow>
            <MenuButton
              as={CustomIconButton}
              aria-label="User Options"
              icon={<FaBars />}
              variant="ghost"
              color={iconColor}
            />
          </Tooltip>
          <MenuList>
            <UserMenuContent />
          </MenuList>
        </Menu>
      </Box>

      {/* Mobile */}
      <Box display={{ base: "flex", md: "none" }} position="fixed" bottom={4} right={4} alignItems="center">
        <Tooltip label={`Switch to ${colorMode === "light" ? "Dark" : "Light"} Mode`} hasArrow>
          <CustomIconButton
            aria-label="Toggle Color Mode"
            icon={colorMode === "light" ? <FiMoon /> : <FiSun />}
            onClick={toggleColorMode}
            mr={2}
            variant="ghost"
            color={iconColor}
          />
        </Tooltip>
        <Tooltip label="Open Chat Bot" hasArrow>
          <CustomIconButton
            aria-label="Chat bot"
            icon={chatIcon}
            mr={2}
            variant="ghost"
            color={iconColor}
            onClick={handleChatOpen}
          />
        </Tooltip>
        <Tooltip label="View Stakeholder Contacts" hasArrow>
          <CustomIconButton
            aria-label="Stakeholders Contacts"
            icon={<FaPhoneSquare />}
            onClick={onContactsOpen}
            variant="ghost"
            color={iconColor}
            mr={2}
          />
        </Tooltip>
        <Menu>
          <Tooltip label="User Options" hasArrow>
            <MenuButton
              as={CustomIconButton}
              aria-label="User Options"
              icon={<FaBars />}
              variant="ghost"
              color={iconColor}
            />
          </Tooltip>
          <MenuList>
            <UserMenuContent />
          </MenuList>
        </Menu>
      </Box>

      {/* ChatBox Drawer */}
      <Drawer 
        isOpen={isChatOpen} 
        placement="right" 
        onClose={handleClose}
        size="xl"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <HStack justifyContent="space-between">
              <Text>ChatBot</Text>
              <HStack>
                <Tooltip label={hasMessages ? "Minimize" : "Chat is empty"}>
                  <CustomIconButton
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
              onStateChange={handleChatStateChange}
              isOpen={isChatOpen}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Contacts Drawer */}
      <Drawer
        isOpen={isContactsOpen}
        placement="left"
        onClose={onContactsClose}
        size="xl"
      >
        <DrawerOverlay />
        <DrawerContent maxWidth="70%" marginX="auto">
          <DrawerHeader>
            <HStack justifyContent="space-between">
              <Text>STAKEHOLDERS</Text>
              <DrawerCloseButton position="static" />
            </HStack>
          </DrawerHeader>
          <DrawerBody>
            <Tabs isFitted variant="line" colorScheme='blue'>
              <TabList mb="1em">
                <Tab>SUPPLIERS </Tab>
                <Tab>CUSTOMERS </Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <SupplierContacts />
                </TabPanel>
                <TabPanel>
                  <CustomerContacts />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Reporting Drawer */}
      <Drawer placement="bottom" onClose={onReportingClose} isOpen={isReportingOpen} size="xl">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth='1px'>Generate Report</DrawerHeader>
          <DrawerBody>
            <ReportingComponent auth={auth} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Tasks Drawer */}
      <Drawer placement="top" onClose={onTasksClose} isOpen={isTasksOpen} size="xl">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth='1px'>Tasks</DrawerHeader>
          <DrawerBody pt={0}>
            <TasksComponent />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default UserMenu;
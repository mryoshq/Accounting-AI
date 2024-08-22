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
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
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

const UserMenu = () => {
  const { logout } = useAuth();
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

  const ReportingWrapper = () => {
    return (
      <>
        <MenuItem icon={<FaChartBar fontSize="18px" />} onClick={onReportingOpen}>
          Reporting
        </MenuItem>
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
      </>
    );
  };

  const TasksWrapper = () => {
    return (
      <>
        <MenuItem icon={<FaTasks fontSize="18px" />} onClick={onTasksOpen}>
          Tasks
        </MenuItem>
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
          aria-label="Stakeholders Contacts"
          icon={<FaPhoneSquare />}
          onClick={onContactsOpen}
          variant="ghost"
          color={iconColor}
          mr={2}
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
            aria-label="Tools"
            icon={<FaTools />}
            bg="transparent"
            _hover={{ bg: "transparent" }}
            _active={{ bg: "transparent" }}
            isRound
            color={iconColor}
          />
          <MenuList>
            <TasksWrapper />
            <ReportingWrapper />
          </MenuList>
        </Menu>

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
        <IconButton
          aria-label="Stakeholders Contacts"
          icon={<FaPhoneSquare />}
          onClick={onContactsOpen}
          variant="ghost"
          color={iconColor}
          mr={2}
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
            <ReportingWrapper />
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
              onStateChange={handleChatStateChange}
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
    </>
  );
};

export default UserMenu;
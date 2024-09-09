import { useState } from "react";
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  IconButton,
  Image,
  Text,
  useColorModeValue,
  useDisclosure,
  Tooltip,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { FiLogOut, FiMenu, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Logo from "../../assets/images/logo.png";
import type { UserPublic } from "../../client";
import useAuth from "../../hooks/useAuth";
import SidebarItems from "./SidebarItems";

const Sidebar = () => {
  const queryClient = useQueryClient();
  const bgColor = useColorModeValue("ui.light", "ui.dark");
  const textColor = useColorModeValue("ui.dark", "ui.light");
  const secBgColor = useColorModeValue("ui.secondary", "ui.darkSlate");

  const containerContourColor = useColorModeValue("teal.500", "gray.500");
  const buttonContourColor = useColorModeValue("teal.500", "gray");


  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { logout } = useAuth();
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);


  const handleLogout = async () => {
    logout();
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };


  return (
    <>
      {/* Mobile */}
      <IconButton
        onClick={onOpen}
        display={{ base: "flex", md: "none" }}
        aria-label="Open Menu"
        position="absolute"
        fontSize="20px"
        m={4}
        icon={<FiMenu />}
      />
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent maxW="250px">
          <DrawerCloseButton />
          <DrawerBody py={8}>
            <Flex flexDir="column" justify="space-between">
              <Box>
                <Image src={Logo} alt="logo" p={6} />
                <SidebarItems onClose={onClose} isSidebarVisible={true} />
                <Flex
                  as="button"
                  onClick={handleLogout}
                  p={2}
                  color="ui.danger"
                  fontWeight="bold"
                  alignItems="center"
                >
                  <FiLogOut />
                  <Text ml={2}>Log out</Text>
                </Flex>
              </Box>
              {currentUser?.email && (
                <Text color={textColor} noOfLines={2} fontSize="sm" p={2}>
                  Logged in as: {currentUser.email}
                </Text>
              )}
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

    {/* Desktop */}
    <Box
        bg={bgColor}
        p={3}
        h="100vh"
        position="sticky"
        top="0"
        display={{ base: "none", md: "flex" }}
      >
        <Flex
          flexDir="column"
          justifyContent="space-between"
          bg={secBgColor}
          p={4}
          borderRadius={12}
          borderLeft={`1px solid`}
          borderY={`1px solid`}
          borderColor={containerContourColor}
          w={isSidebarVisible ? "250px" : "60px"}
          transition="width 0.3s"
          position="relative"
        >
          {isSidebarVisible && (
            <Flex justify="center">
              <Box mt={1}>
                <Image src={Logo} alt="Logo" w="180px" maxW="2xs" p={6} />
              </Box>
            </Flex>
          )}
          <Flex
            flex="1"
            justify="center"
            alignItems="center"
            flexDir="column"
          >
            <SidebarItems isSidebarVisible={isSidebarVisible} />
          </Flex>
          {isSidebarVisible && currentUser?.email && (
            <Text
              color={textColor}
              noOfLines={2}
              fontSize="sm"
              p={2}
              maxW="180px"
            >
              Logged in as: {currentUser.email}
            </Text>
          )}
          <Box
            position="absolute"
            top="50%"
            right="-20px"
            transform="translateY(-50%)"
          >
            <Box
              position="absolute"
              top="50%"
              right="0"
              transform="translateY(-50%)"
              width="20px"
              height="40px"
              borderRightRadius="20px"
              borderRight={`1px solid`}
              borderTop={`1px solid`}
              borderBottom={`1px solid`}
              borderColor={buttonContourColor}
            />
            <Tooltip label={isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"} placement="right">
              <IconButton
                aria-label="Toggle Sidebar"
                icon={isSidebarVisible ? <FiChevronLeft color="white"/> : <FiChevronRight color="teal.500" />}
                onClick={toggleSidebar}
                borderRadius="full"
                bg={isSidebarVisible ? "teal.500" : "transparent"}
                color={isSidebarVisible ? "white" : "teal.500"}
                _hover={{ bg: isSidebarVisible ? "teal.600" : "gray.100" }}
                boxShadow="xs"
                zIndex={1}
              />
            </Tooltip>
          </Box>
        </Flex>
      </Box>
    </>
  );
};

export default Sidebar;

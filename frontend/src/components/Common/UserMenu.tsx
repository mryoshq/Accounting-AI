import {
  Box,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";
import { FaBars } from "react-icons/fa";
import { FiLogOut, FiUser, FiMoon, FiSun } from "react-icons/fi";
import useAuth from "../../hooks/useAuth";

const UserMenu = () => {
  const { logout } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const iconColor = useColorModeValue("green.500", "white");

  const handleLogout = async () => {
    logout();
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
    </>
  );
};

export default UserMenu;

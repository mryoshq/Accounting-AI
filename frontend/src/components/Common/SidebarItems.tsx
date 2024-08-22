import {
  Box, Flex, Icon, Text, useColorModeValue, Accordion, AccordionItem, AccordionButton, AccordionPanel,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { FiBriefcase, FiHome, FiSettings, FiUsers, FiFileText, FiChevronDown, FiAnchor, FiCircle,
} from "react-icons/fi";
import type { UserPublic } from "../../client";

const items = [
  { icon: FiHome, title: "Dashboard", path: "/" },
  {
    icon: FiAnchor,
    title: "Main",
    children: [
      { title: "Projects", path: "/projects" },
      { title: "Parts", path: "/parts" },
    ],
  },
  {
    icon: FiUsers,
    title: "Stakeholders",
    children: [
      { title: "Suppliers", path: "/suppliers" },
      { title: "Customers", path: "/customers" },
    ],
  },
  
  /*{
    icon: FiUsers,
    title: "Contacts",
    children: [
      { title: "Suppliers", path: "/suppliercontacts" },
      { title: "Customers", path: "/customercontacts" },
    ],
  },*/
  {
    icon: FiFileText,
    title: "Invoices",
    children: [
      { title: "Payables", path: "/externalinvoices" },
      { title: "Receivables", path: "/internalinvoices" },
    ],
  },
  {
    icon: FiBriefcase,
    title: "Payments",
    children: [
      { title: "Incomes", path: "/paymentsfromcustomers" },
      { title: "Expenses", path: "/paymentstosuppliers" },
    ],
  },
  { icon: FiSettings, title: "User Settings", path: "/settings" },
];

interface SidebarItemsProps {
  onClose?: () => void;
  isSidebarVisible: boolean;
}

const SidebarItems = ({ onClose, isSidebarVisible }: SidebarItemsProps) => {
  const queryClient = useQueryClient();
  const textColor = useColorModeValue("ui.main", "ui.light");
  const bgActive = useColorModeValue("#E2E8F0", "#4A5568");
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);
  const finalItems = currentUser?.is_superuser
    ? [...items, { icon: FiUsers, title: "User Management", path: "/admin" }]
    : items;

  const { location } = useRouterState();

  const handleItemClick = () => {
    if (onClose) onClose();
  };

  const getDefaultIndex = () => {
    return finalItems.reduce((acc, item, index) => {
      if (item.children) {
        const match = item.children.find(
          (child) => child.path === location.pathname
        );
        if (match) {
          acc.push(index);
        }
      }
      return acc;
    }, [] as number[]);
  };

  return (
    <Box width="100%">
      <Accordion allowMultiple defaultIndex={getDefaultIndex()} style={{ borderWidth: 0 }}>
        {finalItems.map(({ icon, title, path, children }) =>
          children ? (
            <AccordionItem key={title} border="none" mr={isSidebarVisible ? 4 : 0} >
              <AccordionButton
                px={4}
                py={2}
                display="flex"
                alignItems="center"
                justifyContent={isSidebarVisible ? "flex-start" : "center"}

                _expanded={{
                  bg: "teal",
                  color: "white",
                  borderRadius: "12px",
                }}
                color={textColor}
                onClick={handleItemClick}
              >
                <Flex alignItems="center">
                  <Icon as={icon} mr={isSidebarVisible ? 2 : 0} />
                  {isSidebarVisible && (
                    <Text flex="1" textAlign="left">
                      {title}
                    </Text>
                  )}
                </Flex>
                {isSidebarVisible && <Icon as={FiChevronDown} ml="auto" />}
              </AccordionButton>
              <AccordionPanel pb={2} pl={isSidebarVisible ? 4 : 0}>
                {children.map(({ title, path }) => (
                  <Flex
                    as={Link}
                    to={path}
                    w="100%"
                    pb={1}
                    px = {2}  
                    key={title}
                    bg={isSidebarVisible ? (location.pathname === path ? bgActive : "inherit") : "transparent"}
                    color={isSidebarVisible ? (location.pathname === path ? textColor : textColor) : location.pathname === path ? "#E88D67" : textColor}
                    borderRadius={isSidebarVisible ? "12px" : 0}
                    onClick={handleItemClick}
                    alignItems="center"
                  >
                    <Icon as={FiCircle} mr={isSidebarVisible ? 4 : 0} />
                    {isSidebarVisible && <Text>{title}</Text>}
                  </Flex>
                ))}
              </AccordionPanel>
            </AccordionItem>
          ) : (
            <AccordionItem key={title} border="none" mr={isSidebarVisible ? 4 : 0}>
              <AccordionButton
                as={Link}
                to={path}
                px={4}
                py={2}
                display="flex"
                alignItems="center"
                justifyContent={isSidebarVisible ? "flex-start" : "center"}
                style={{
                  background: location.pathname === path ? bgActive : "inherit",
                  borderRadius: "12px",
                }}
                color={textColor}
                onClick={handleItemClick}
              >
                <Icon as={icon} mr={isSidebarVisible ? 2 : 0} />
                {isSidebarVisible && (
                  <Text flex="1" textAlign="left">
                    {title}
                  </Text>
                )}
              </AccordionButton>
            </AccordionItem>
          )
        )}
      </Accordion>
    </Box>
  );
};

export default SidebarItems;

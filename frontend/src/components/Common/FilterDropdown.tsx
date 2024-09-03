import { useEffect, useState } from "react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  IconButton,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiFilter } from "react-icons/fi";

interface FilterDropdownProps {
  fetchData: () => Promise<string[]>;
  selected: string;
  onSelect: (option: string) => void;
}

const LazyFilterDropdown = ({ fetchData, selected, onSelect }: FilterDropdownProps) => {
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchData()
      .then(data => {
        setOptions(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [fetchData]);

  const bgColor = useColorModeValue("gray.100", "gray.700");
  const hoverBgColor = useColorModeValue("gray.200", "gray.600");
  const activeBgColor = useColorModeValue("gray.300", "gray.500");

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        icon={<FiFilter />}
        size="xs"
        aria-label="Filter"
        ml={2}
        bg={bgColor}
        _hover={{ bg: hoverBgColor }}
        _active={{ bg: activeBgColor }}
      />
      <MenuList>
        {loading ? (
          <MenuItem>
            <Spinner size="sm" />
          </MenuItem>
        ) : (
          <>
            <MenuItem onClick={() => onSelect("")} fontWeight={selected === "" ? "bold" : "normal"}>
              No Filter
            </MenuItem>
            {options.map((option, index) => (
              <MenuItem 
                key={index} 
                onClick={() => onSelect(option)}
                fontWeight={selected === option ? "bold" : "normal"}
              >
                {option}
              </MenuItem>
            ))}
          </>
        )}
      </MenuList>
    </Menu>
  );
};

export default LazyFilterDropdown;
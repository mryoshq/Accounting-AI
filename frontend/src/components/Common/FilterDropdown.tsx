import { useEffect, useState } from "react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  IconButton,
  Spinner,
} from "@chakra-ui/react";
import { FiFilter } from "react-icons/fi";

interface FilterDropdownProps {
  fetchData: () => Promise<string[]>;
  selected: string;
  onSelect: (option: string) => void;
}

const LazyFilterDropdown = ({ fetchData, onSelect }: FilterDropdownProps) => {
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

  return (
    <Menu>
      <MenuButton as={IconButton} icon={<FiFilter />} size="xs" variant="ghost" aria-label="Filter" />
      <MenuList>
        {loading ? (
          <MenuItem>
            <Spinner size="sm" />
          </MenuItem>
        ) : (
          <>
            <MenuItem onClick={() => onSelect("")}>No Filter</MenuItem>
            {options.map((option, index) => (
              <MenuItem key={index} onClick={() => onSelect(option)}>
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

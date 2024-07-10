import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Select,
  Text,
  VStack,
  Flex,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { PartPublic, ProjectsService } from "../../client";

interface SplitModalProps {
  isOpen: boolean;
  onClose: () => void;
  part: PartPublic;
  onConfirm: (splitQuantity: number, newProjectId: number) => void;
  isMoving: boolean;
}

const SplitModal: React.FC<SplitModalProps> = ({ isOpen, onClose, part, onConfirm, isMoving }) => {
  const [splitQuantity, setSplitQuantity] = useState<number>(1);
  const [newProjectId, setNewProjectId] = useState<number | "">("");

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => ProjectsService.readProjects(),
  });

  useEffect(() => {
    if (isOpen) {
      setSplitQuantity(isMoving ? 1 : Math.floor((part.quantity || 1) / 2));
      setNewProjectId("");
    }
  }, [isOpen, isMoving, part.quantity]);

  const handleQuantityChange = (value: number) => {
    setSplitQuantity(Math.min(Math.max(1, value), (part.quantity || 1)));
  };

  const handleConfirm = () => {
    if (newProjectId === "") return;
    onConfirm(splitQuantity, Number(newProjectId));
    onClose();
  };

  const isFullMove = splitQuantity === part.quantity || isMoving;
  const modalTitle = isFullMove ? "Move Part" : "Split Part";
  const confirmButtonText = isFullMove ? "Move" : "Split";

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered motionPreset='scale'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{modalTitle}: {part.item_code}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Text>Total Quantity: {part.quantity}</Text>
            {!isMoving && (
              <FormControl>
                <FormLabel>Split Quantity</FormLabel>
                <Flex>
                  <NumberInput
                    maxW='100px'
                    mr='2rem'
                    value={splitQuantity}
                    onChange={(_, value) => handleQuantityChange(value)}
                    min={1}
                    max={(part.quantity || 1)}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Slider
                    flex='1'
                    focusThumbOnChange={false}
                    value={splitQuantity}
                    onChange={handleQuantityChange}
                    min={1}
                    max={(part.quantity || 1)}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb fontSize='sm' boxSize='32px' children={splitQuantity} />
                  </Slider>
                </Flex>
              </FormControl>
            )}
            <FormControl>
              <FormLabel>New Project</FormLabel>
              <Select
                value={newProjectId}
                onChange={(e) => setNewProjectId(Number(e.target.value))}
                placeholder="Select project"
              >
                {projects?.data
                  .filter((project: any) => project.id !== part.project_id)
                  .map((project: any) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))
                }
              </Select>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleConfirm}>
            {confirmButtonText}
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SplitModal;
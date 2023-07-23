import {
  ActionIcon,
  Group,
  Text,
  TextInput,
  TextInputProps,
  Tooltip,
  useMantineTheme
} from '@mantine/core';
import { IconAlertTriangle, IconFolderOpen } from '@tabler/icons-react';
import { IsPathValid, SelectOneDirectory } from '@wails/go/config/ApplicationSettings';
import { isEmpty } from 'ramda';
import { ForwardRefExoticComponent, forwardRef, useCallback, useState } from 'react';

type PathSelectInputProps = {
  value?: string;
  onChange?: (value: string) => void;
  w?: TextInputProps['w'];
  label: string;
  placeholder?: string;
  maw?: TextInputProps['maw'];
  miw?: TextInputProps['miw'];
};

export const PathSelectInput: ForwardRefExoticComponent<PathSelectInputProps> = forwardRef(
  (props, ref) => {
    const theme = useMantineTheme();
    const [value, setValue] = useState<string>(props.value ?? '');
    const [errorState, setErrorState] = useState<boolean>(false);
    const handleChange = useCallback(async value => {
      setValue(value);
      if (!isEmpty(value)) {
        setErrorState(await IsPathValid(value));
      } else {
        setErrorState(false);
      }
      props.onChange?.(value);
    }, []);
    const selectDirectory = useCallback(async () => {
      const selectedDirectory = await SelectOneDirectory();
      if (!isEmpty(selectedDirectory)) {
        await handleChange(selectedDirectory);
      }
    }, []);

    return (
      <TextInput
        readOnly
        label={props.label ?? ''}
        placeholder={props.placeholder}
        value={value}
        onChange={handleChange}
        error={
          errorState && (
            <Group spacing="xs">
              <IconAlertTriangle size="0.8rem" stroke={1} />
              <Text>指定的路径不存在或者无法访问！</Text>
            </Group>
          )
        }
        w={props.w}
        maw={props.maw}
        miw={props.miw}
        ref={ref}
        rightSection={
          <Tooltip label="选择路径">
            <ActionIcon onClick={selectDirectory}>
              <IconFolderOpen size="1rem" stroke={1} />
            </ActionIcon>
          </Tooltip>
        }
      />
    );
  }
);

import { useContext, useMemo, ChangeEvent } from 'react';

import { useService } from '@xstate/react';

import { FormXContext } from './FormX';

export type FormXFieldProps = {
  field: {
    value: string;
    name: string;
    onChange: (event: ChangeEvent<{ value: string }>) => void;
    onFocus: () => void;
    onBlur: () => void;
  };
  meta: { active: boolean; focused: boolean };
};

export default function useFormXField(name: string): FormXFieldProps {
  const { fields } = useContext(FormXContext);

  const currentField = useMemo(() => {
    const field = fields.find(field => field.name === name);
    if (!field) {
      throw new Error(
        `Unable to find the definition for field ${name}. Did you pass it to form initialValues ?`
      );
    }
    return field;
  }, [fields, name]);

  const [current, send] = useService(currentField.ref);

  return {
    field: {
      value: current.context.value,
      name: current.context.name,
      onChange: (event): void => {
        send({
          type: 'CHANGE',
          value: event.currentTarget.value,
        });
      },
      onFocus: (): void => {
        send('FOCUS');
      },
      onBlur: (): void => {
        send('BLUR');
      },
    },
    meta: {
      active: !current.matches('empty'),
      focused: current.matches('focus'),
    },
  };
}

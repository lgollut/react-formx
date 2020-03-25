import { useMachine } from '@xstate/react';
import { FormEvent } from 'react';

import form, {
  FormXFields,
  FormXFieldsValues,
  FormXEventValidation,
} from './machines/formX';

interface FormXProps {
  handleSubmit: (e: FormEvent) => void;
  fields: FormXFields;
}

interface FormXOptions {
  onSubmit: (values: FormXValues) => Promise<void>;
}

export interface FormXValues {
  [field: string]: string | boolean;
}

export default function useFormX(
  initialValues: FormXFieldsValues,
  { onSubmit }: FormXOptions
): FormXProps {
  const [current, send] = useMachine(
    form.withContext({ initialValues, fields: [] }).withConfig({
      services: {
        onSubmit(_, event): Promise<boolean> {
          return new Promise((resolve, reject) => {
            const formData: FormXValues = (event as FormXEventValidation).data.reduce(
              (result, { name, value }) => ({
                ...result,
                [name]: value,
              }),
              {}
            );
            onSubmit(formData)
              .then(() => resolve(true))
              .catch(e => reject(e));
          });
        },
      },
    })
  );

  return {
    handleSubmit: (e): void => {
      e.preventDefault();
      send('SUBMIT');
    },
    fields: current.context.fields,
  };
}

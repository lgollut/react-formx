import React, { createContext, ReactChildren } from 'react';

import useFormX, { FormXValues } from './useFormX';
import { FormXFields, FormXFieldsValues } from './machines/formX';

interface FormXProps {
  children: ReactChildren;
  onSubmit: (values: FormXValues) => Promise<void>;
  initialValues: FormXFieldsValues;
}

export const FormXContext = createContext<{ fields: FormXFields }>({
  fields: [],
});

export default function FormX({
  children,
  onSubmit,
  initialValues,
  ...props
}: FormXProps): React.ReactElement {
  const { handleSubmit, fields } = useFormX(initialValues, {
    onSubmit,
  });

  return (
    <FormXContext.Provider value={{ fields }}>
      <form {...props} onSubmit={handleSubmit}>
        {children}
      </form>
    </FormXContext.Provider>
  );
}

import { Machine, assign, spawn } from 'xstate';

import formXField, {
  FormXFieldInterpreter,
  FormXFieldContext,
} from './formXField';

export type FormXFields = Array<{
  name: string;
  ref: FormXFieldInterpreter;
}>;

export type FormXFieldsValues = {
  [name: string]: string;
};

type FormXContext = {
  initialValues: FormXFieldsValues;
  fields: FormXFields;
};

type FormXStateSchema = {
  states: {
    init: {};
    validating: {};
    submitting: {};
    error: {};
    success: {};
  };
};

type FormXEventSubmit = { type: 'SUBMIT' };
type FormXEventRetry = { type: 'RETRY' };
export type FormXEventValidation = {
  type: 'VALIDATE';
  data: FormXValidationResult;
};

type FormXEvent = FormXEventSubmit | FormXEventRetry | FormXEventValidation;

export type FormXValidationResult = Array<FormXFieldContext>;

export default Machine<FormXContext, FormXStateSchema, FormXEvent>(
  {
    id: 'formX',
    initial: 'init',
    context: {
      initialValues: {},
      fields: [],
    },
    states: {
      init: {
        onEntry: 'registerFields',
        on: {
          SUBMIT: 'validating',
        },
      },
      validating: {
        invoke: {
          src: 'onValidate',
          onError: 'error',
          onDone: 'submitting',
        },
      },
      submitting: {
        invoke: {
          src: 'onSubmit',
          onDone: 'success',
          onError: 'error',
        },
      },
      error: {
        on: {
          RETRY: 'validating',
        },
      },
      success: { type: 'final' },
    },
  },
  {
    actions: {
      registerFields: assign({
        fields: ({ initialValues }) => {
          return Object.entries(initialValues).map(([name, value]) => ({
            name,
            ref: spawn(formXField.withContext({ value, name, error: null })),
          }));
        },
      }),
    },
    services: {
      onValidate: ({ fields = [] }): Promise<FormXValidationResult> => {
        return new Promise(resolve => {
          resolve(fields.map(field => field.ref.state.context));
        });
      },
    },
  }
);

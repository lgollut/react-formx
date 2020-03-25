import { Machine, assign, sendUpdate, Interpreter } from 'xstate';

export type FormXFieldContext = {
  value: string;
  name: string;
  error: null | string;
};

type FormXFieldStateSchema = {
  states: {
    init: {};
    empty: {};
    filled: {};
    focus: {};
  };
};

type FormXFieldEventChange = { type: 'CHANGE'; value: string };
type FormXFieldEventFocus = { type: 'FOCUS' };
type FormXFieldEventBlur = { type: 'BLUR' };

type FormXFieldEvent =
  | FormXFieldEventChange
  | FormXFieldEventFocus
  | FormXFieldEventBlur;

export type FormXFieldInterpreter = Interpreter<
  FormXFieldContext,
  FormXFieldStateSchema,
  FormXFieldEvent
>;

export default Machine<
  FormXFieldContext,
  FormXFieldStateSchema,
  FormXFieldEvent
>(
  {
    id: 'formXField',
    initial: 'init',
    context: {
      value: '',
      name: '',
      error: null,
    },
    states: {
      init: {
        on: {
          '': [{ target: 'filled', cond: 'isFilled' }, { target: 'empty' }],
        },
      },
      empty: {
        on: {
          FOCUS: 'focus',
        },
      },
      filled: {
        on: {
          FOCUS: 'focus',
        },
      },
      focus: {
        on: {
          BLUR: [
            { target: 'filled', actions: sendUpdate(), cond: 'isFilled' },
            { target: 'empty', actions: sendUpdate() },
          ],
          CHANGE: { actions: 'change' },
        },
      },
    },
  },
  {
    guards: {
      isFilled: ({ value }): boolean => !!value,
    },
    actions: {
      change: assign({
        value: (_, event) => (event as FormXFieldEventChange).value,
      }),
    },
  }
);

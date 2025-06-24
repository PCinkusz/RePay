import { Payment } from './Payment';

export type RootStackParamList = {
  Payments: undefined;
  AddEdit: { mode: 'add' | 'edit'; payment?: Payment };
};

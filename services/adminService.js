import { httpsCallable } from 'firebase/functions';
import { functions } from './firebaseConfig';

const getAdminDashboardCall = httpsCallable(functions, 'getAdminDashboard');
const getAdminSettingsCall = httpsCallable(functions, 'getAdminSettings');
const saveAdminQuarterSettingsCall = httpsCallable(functions, 'saveAdminQuarterSettings');
const createAdminSubjectCall = httpsCallable(functions, 'createAdminSubject');
const setAdminSubjectActiveCall = httpsCallable(functions, 'setAdminSubjectActive');

export const getAdminDashboard = async () => {
  const response = await getAdminDashboardCall();
  return response.data;
};

export const getAdminSettings = async () => {
  const response = await getAdminSettingsCall();
  return response.data;
};

export const saveAdminQuarterSettings = async (settings) => {
  const response = await saveAdminQuarterSettingsCall(settings);
  return response.data;
};

export const createAdminSubject = async (subject) => {
  const response = await createAdminSubjectCall(subject);
  return response.data;
};

export const setAdminSubjectActive = async (subjectId, active) => {
  const response = await setAdminSubjectActiveCall({ subjectId, active });
  return response.data;
};

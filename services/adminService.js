import { httpsCallable } from 'firebase/functions';
import { functions } from './firebaseConfig';
 

const callAdmin = (name) => {
  const callable = httpsCallable(functions, name);
  return async (payload) => (await callable(payload)).data;
};
 
const getAdminDashboardCall = callAdmin('getAdminDashboard');
const getAdminSettingsCall = callAdmin('getAdminSettings');
const saveAdminQuarterSettingsCall = callAdmin('saveAdminQuarterSettings');
const createAdminSubjectCall = callAdmin('createAdminSubject');
const setAdminSubjectActiveCall = callAdmin('setAdminSubjectActive');
 
export const getAdminDashboard = () => getAdminDashboardCall();
export const getAdminSettings = () => getAdminSettingsCall();
export const saveAdminQuarterSettings = (settings) => saveAdminQuarterSettingsCall(settings);
export const createAdminSubject = (subject) => createAdminSubjectCall(subject);
export const setAdminSubjectActive = (subjectId, active) =>
  setAdminSubjectActiveCall({ subjectId, active });
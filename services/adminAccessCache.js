let verifiedAdminUid = null;

export const isAdminAccessVerified = (uid) =>
  Boolean(uid && verifiedAdminUid === uid);

export const markAdminAccessVerified = (uid) => {
  if (uid) verifiedAdminUid = uid;
};

export const clearAdminAccessVerification = () => {
  verifiedAdminUid = null;
};

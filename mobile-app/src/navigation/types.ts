export type AuthStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
};

export type AppTabParamList = {
  Dashboard: undefined;
  Builder: undefined;
  Leads: undefined;
  Students: undefined;
  Settings: undefined;
};

export type PlatformAdminTabParamList = {
  Tenants: undefined;
};

export type PlatformAdminStackParamList = {
  PlatformAdminTabs: undefined;
};

export type SetupStackParamList = {
  SetupLanding: undefined;
  ProfileSetup: undefined;
  BrandingSetup: undefined;
  BranchesSetup: undefined;
  SessionSetup: undefined;
  ReviewSetup: undefined;
};

export type PendingStackParamList = {
  PendingApproval: undefined;
};

export type StudentsStackParamList = {
  StudentsList: undefined;
  StudentDetail: { studentId: string };
  StudentCreate: undefined;
  StudentEdit: { studentId: string };
  GuardianManage: { studentId: string };
  SponsorManage: { studentId: string };
  StudentHistory: { studentId: string };
  StudentDocuments: { studentId: string };
};

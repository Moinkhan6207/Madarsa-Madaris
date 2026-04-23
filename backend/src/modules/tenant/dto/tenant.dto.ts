export interface CreateTenantDto {
  displayName: string;
  legalName?: string;
  slug: string;
  institutionType:
    | 'SMALL_LOCAL_MADARSA'
    | 'RESIDENTIAL_MADARSA'
    | 'HYBRID_DEENI_SCHOOL'
    | 'TRUST_RUN_IDARA'
    | 'MASJID_MADARSA_COMBINED'
    | 'OTHER';
  primaryEmail?: string;
  primaryPhone?: string;
  planCode?: string;
  adminUser: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
  };
}

export interface UpdateInstitutionProfileDto {
  shortName?: string;
  trustName?: string;
  registrationNumber?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  websiteUrl?: string;
  establishedYear?: number;
  principalName?: string;
  description?: string;
  divisionType?: 'MALE' | 'FEMALE' | 'BOTH';
  hasHostel?: boolean;
  hasTransport?: boolean;
  hasMasjidLinkedOps?: boolean;
  hasMultiBranch?: boolean;
}

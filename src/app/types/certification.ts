export interface CourseCertification {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  cost: number | null;
  validity_days: number | null;
  is_free_for_user: boolean;
}

export interface CertificationCatalog {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  cost: number | null;
  validity_days: number | null;
  is_free_for_user: boolean;
  course_title: string;
  course_cover_url: string | null;
  course_area: string | null;
  course_completed: boolean;
  user_certification_status: string | null;
}

export interface UserCertification {
  id: string;
  course_certification: CourseCertification;
  status: "requested" | "approved" | "issued" | "rejected";
  requested_at: string;
  approved_at: string | null;
  issued_at: string | null;
  expiration_date: string | null;
  certificate_code: string | null;
  certificate_url: string | null;
  course_title: string | null;
}

export type ComplaintType = "RECLAMO" | "QUEJA";
export type ComplaintDocumentType = "DNI" | "CE" | "PASAPORTE" | "OTRO";
export type ComplaintGoodType = "producto" | "servicio";

export interface CreateComplaintInput {
  type: ComplaintType;
  fullName: string;
  documentType: ComplaintDocumentType;
  documentNumber: string;
  address: string;
  phone?: string;
  email: string;
  isMinor: boolean;
  guardianName?: string;
  goodType: ComplaintGoodType;
  goodDescription: string;
  claimedAmount?: number;
  detail: string;
  request: string;
}

export interface ComplaintReceipt {
  id: string;
  correlativo: number;
  type: ComplaintType;
  createdAt: string;
}

/** Full admin view — mirrors the backend's Complaint entity. */
export interface AdminComplaint {
  id: string;
  correlativo: number;
  type: ComplaintType;
  fullName: string;
  documentType: string;
  documentNumber: string;
  address: string;
  phone: string | null;
  email: string;
  isMinor: boolean;
  guardianName: string | null;
  goodType: string;
  goodDescription: string;
  claimedAmount: number | null;
  detail: string;
  request: string;
  providerResponse: string | null;
  respondedAt: string | null;
  createdAt: string;
}

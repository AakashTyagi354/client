// interface DoctorInputProps {
//   _id: string;
//   firstName: string;
//   lastName: string;
//   languages: string[];
//   phone: string;
//   email: string;
//   address: string;
//   specialization: string;
//   experience: number;
//   feesPerCunsaltation: number;
//   status: string;
//   gender: string;
// }


interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface DoctorInputProps {
  id: number;                     // ✅ SQL ID
  userId: number;                 // ✅ from backend
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  website?: string;               // optional
  address: string;
  specialization: string;         // enum as string
  experience: number;
  feesPerConsultation: number;    // ✅ fixed spelling
  gender: "MALE" | "FEMALE";       // enum
  status: "APPROVED" | "PENDING" | "REJECTED";
}

interface DocumentInputProps {
  id: number;
  userId: string;
  url: string;
  type: string;
  name: string;
  size: number;
  createdAt: Dtae;
}
interface FormData {
  email: string;
  password: string;
}

interface MRPInputProps {
  price: number;
  quantity: number;
}

interface ProductInputProps {
  // backend may provide SQL `id` or Mongo `_id` depending on endpoint
  id?: number | any;
  // _id?: string;
  name: string;
  description: string;
  price: number;
  slug?: string;
  categoryId?: number | any ;
  quantity?: number | any; 
  photo?: any;
  imageURL?: string |  any; // UI-friendly image field used across components
  shipping?: boolean;
}

interface AppointmentInputProps {
  userId: string;
  doctorId: string;
  doctorInfo: string;
  userInfo: string;
  date: string;
  time: string;
  roomId: string;
}
 interface AppointmentResponse {
  id: number;
  userId: number;
  doctorId: number;
  slotId: number;
  status: "BOOKED" | "CANCELLED" | "COMPLETED";
  createdAt: string;
   slotStartTime: string | null;  
  slotEndTime: string | null; 
}

interface AppointmentUI {
  id: number;
  doctorId: number;
  date: string;
  time: string;
  status: string;
}
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

interface DoctorInputProps {
  id: number;                     // ✅ SQL ID
  userId: string;                 // ✅ from backend
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
  _id: string;
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
  _id: string;
  description;
  price: number;
  slug: string;
  category: any;
  quantity: number;
  photo: object;
  shipping: boolean;
  name: string;
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
}

interface AppointmentUI {
  id: number;
  doctorId: number;
  date: string;
  time: string;
  status: string;
}
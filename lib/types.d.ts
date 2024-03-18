interface DoctorInputProps {
  _id: string;
  firstName: string;
  lastName: string;
  languages: string[];
  phone: string;
  email: string;
  address: string;
  specialization: string;
  experience: number;
  feesPerCunsaltation: number;
  status: string;
  gender: string;
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

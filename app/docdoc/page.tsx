// "use client";

// import axios from "axios";
// import { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import {
//   selectDoctor,
//   selectToken as selectDocToken,
// } from "@/redux/doctorSlice";

// import Link from "next/link";

// export default function Page() {
//   const doctor = useSelector(selectDoctor);
//   const token = useSelector(selectDocToken);
//   const [users, setUsers] = useState<string[]>([]);

//   const getDoctorAppointments = async () => {
//     try {
//       const res = await axios.post(
//         "https://doc-app-7im8.onrender.com/api/v1/doctor/doctor-appointments",
//         {
//           doctorId: doctor?.id,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       setUsers(res.data.data);

//       console.log(res.data);
//     } catch (err) {
//       console.log("ERROR IN GETTING appointments", err);
//     }
//   };

//   useEffect(() => {
//     getDoctorAppointments();
//   }, []);
//   return (
//     <div>
//       <main className="flex">
//         <div className="min-w-[260px] flex flex-col gap-6 h-[700px] border-r my-12">
//           <div>
//             <p className="text-center">Users</p>
//             <div className="mt-8">
//               {users.map((item, idx) => (
//                 <Link href={`/docdoc/${item.userId}`} key={idx}>
//                   <p className="cursor-pointer border-b w-[80%] mx-auto pb-1 text-gray-500 text-sm">
//                     {item.userInfo}
//                   </p>
//                 </Link>
//               ))}
//             </div>
//           </div>
//         </div>
//         <div className="flex-grow"></div>
//       </main>
//     </div>
//   );
// }



export default function page() {
  return (
    <div>page</div>
  )
}

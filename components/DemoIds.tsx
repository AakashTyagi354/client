import WidthWrapper from "./WidthWrapper";

export default function DemoIds() {
  return (
    <div>
      <WidthWrapper className="w-full h-[300px] mt-16">
        <div className=" w-[70%] md:w-[70%] lg:w-[40%]  mx-auto   h-full gap-2 mt-4">
          <p className=" font-semibold text-xl">Demo Credentials</p>
          <div className="flex gap-2 mt-4 flex-col md:flex-row ">
            <p className="font-bold">User</p>
            <p className="text-gray-600">email: user1@hmail.com</p>
            <p className="text-gray-600">password:123456</p>
          </div>
          <div className="flex gap-2 flex-col md:flex-row">
            <p className="font-bold">Doctor</p>
            <p className="text-gray-600">email: testdoc@gmail.com</p>
            <p className="text-gray-600">password:123456</p>
          </div>
          <div className="flex gap-2 flex-col md:flex-row">
            <p className="font-bold">Admin</p>
            <p className="text-gray-600">email: admin@gmail.com</p>
            <p className="text-gray-600">password:123456</p>
          </div>
        </div>
      </WidthWrapper>
    </div>
  );
}

import { CiSearch } from "react-icons/ci";
import WidthWrapper from "./WidthWrapper";
import { Button } from "./ui/button";
import { MdShoppingCart } from "react-icons/md";

export default function MedicineNavbar() {
  return (
    <div className=" sticky top-14 z-10 border-b border-gray-100 bg-white shadow-sm h-16">
      <WidthWrapper className="h-full">
        <div className="flex items-center h-full justify-evenly">
          <div className="border p-2 flex gap-2 w-[50%] ">
            <CiSearch size={20} className="cursor-pointer" />
            <input
              type="text"
              placeholder="Search for medicines, health products and much more"
              className="bg-inherit outline-none focus:outline-none w-full text-sm"
            />
          </div>
          <div className="">
            <Button className="bg-[#15BEF0] rounded-none flex gap-3">
              <MdShoppingCart size={20} />
              View Cart
            </Button>
          </div>
        </div>
      </WidthWrapper>
    </div>
  );
}

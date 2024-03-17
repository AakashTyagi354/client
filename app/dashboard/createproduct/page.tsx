"use client";

import WidthWrapper from "@/components/WidthWrapper";
import axios from "axios";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { useSelector } from "react-redux";
import { selectToken } from "@/redux/userSlice";
import { toast } from "@/components/ui/use-toast";

export default function Page() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [photo, setPhoto] = useState("");

  const [position, setPosition] = useState("");
  const token = useSelector(selectToken);
  console.log(position);
  const getCategories = async () => {
    try {
      const res = await axios.get(
        "https://doc-app-7im8.onrender.com/api/v1/category/get-category"
      );

      setCategories(res.data.category);
    } catch (err) {
      console.log("Error creating category", err);
    }
  };
  useEffect(() => {
    getCategories();
  }, []);
  const handleCreateProduct = async () => {
    console.log("reached");
    try {
      const res = await axios.post(
        "https://doc-app-7im8.onrender.com/api/v1/product/create-product",
        {
          name,
          description,
          price,
          category: position,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(res.data);
    } catch (err) {
      console.log("Error creating product", err);
    }
  };

  //create product function
  const handleCreate = async () => {
    try {
      const productData = new FormData();
      productData.append("name", name);
      productData.append("description", description);
      productData.append("price", price);
      productData.append("quantity", quantity);
      productData.append("photo", photo);
      productData.append("category", position);
      console.log(productData);
      const { data } = await axios.post(
        "https://doc-app-7im8.onrender.com/api/v1/product/create-product",
        productData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success === true) {
        toast({
          description: data.message,
        });
      } else {
        toast({
          variant: "destructive",
          description: data.message,
        });
      }
      setName("");
      setDescription("");
      setPrice("");
      setPosition("");
      setQuantity("");
      setPhoto("");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      <WidthWrapper>
        <p className="text-xl text-gray-600 tracking-wider text-center mt-12">
          Create new product
        </p>
        <div className=" ">
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Categories <ArrowDown className="ml-4" size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuRadioGroup
                  value={position}
                  onValueChange={setPosition}
                >
                  {categories.map((ele: { name: string; _id: string }, idx) => (
                    <DropdownMenuRadioItem value={ele._id} key={idx}>
                      {ele.name}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="  text-gray-600 text-sm mt-4">
            {photo ? photo.name : "Upload Photo"}
          </p>
          <div className="mb-3">
            <Input
              type="file"
              name="photo"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files[0])}
              hidden
            />
          </div>
          {photo && (
            <div className="w-full flex items-center justify-center mt-4 rounded-md">
              <Image
                src={URL.createObjectURL(photo)}
                alt="product_photo"
                height={300}
                width={300}
                className="img img-responsive"
              />
            </div>
          )}
          <div className="mb-3">
            <Input
              type="text"
              value={name}
              placeholder="write a name"
              className="form-control"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <Textarea
              value={description}
              placeholder="write a description"
              className="form-control"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <Input
              type="number"
              value={price}
              placeholder="write a Price"
              className="form-control"
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <Input
              type="number"
              value={quantity}
              placeholder="write a quantity"
              className="form-control"
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <Button className="w-full mt-3" onClick={handleCreate}>
            Create Product
          </Button>
        </div>
      </WidthWrapper>
    </div>
  );
}

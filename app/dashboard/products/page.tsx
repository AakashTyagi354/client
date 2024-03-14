"use client";

import WidthWrapper from "@/components/WidthWrapper";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Page() {
  const [products, setProducts] = useState([]);
  const getProducts = async () => {
    try {
      const res = await axios.get(
        "http://localhost:7003/api/v1/product/get-product"
      );

      setProducts(res.data.products);
    } catch (err) {
      console.log("ERROR IN FETCHING PRODUCTS", err);
    }
  };
  useEffect(() => {
    getProducts();
  }, []);
  return (
    <div>
      <WidthWrapper>products page</WidthWrapper>
    </div>
  );
}

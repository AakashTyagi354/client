import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();
  return (
    <div>
      <p>Payment successful {params.paymentId}</p>
    </div>
  );
}

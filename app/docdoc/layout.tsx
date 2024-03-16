import Users from "@/components/Users";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main className="flex">
        <div className="min-w-[260px] flex flex-col gap-6 h-[700px] border-r my-12">
          <Users />
        </div>
        <div className="flex-grow">{children}</div>
      </main>
    </>
  );
}

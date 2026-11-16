import { notFound } from "next/navigation";
import { getSellerById, getSellerProducts } from "@/lib/mock-api";
import { SELLERS } from "@/data/sellers";
import { SellerProfile } from "@/components/seller/SellerProfile";
import { Breadcrumb } from "@/components/common/Breadcrumb";

export function generateStaticParams() {
  return Object.keys(SELLERS).map((id) => ({
    id,
  }));
}

interface SellerPageProps {
  params: Promise<{ id: string }>;
}

export default async function SellerPage({ params }: SellerPageProps) {
  const { id } = await params;
  const seller = getSellerById(id);

  if (!seller) {
    notFound();
  }

  const products = getSellerProducts(id);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Sellers", href: "/" },
    { label: seller.name },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <SellerProfile seller={seller} products={products} />
    </div>
  );
}

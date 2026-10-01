import type { Metadata } from "next";
import { DirectStudentPurchase } from "./DirectStudentPurchase";
import { LmsBackButton } from "../../components/LmsBackButton";

export const metadata: Metadata = {
  title: "Direct student course purchase",
  robots: { index: false, follow: false },
};

type PurchasePageProps = {
  searchParams?: Promise<{ courseSlug?: string; courseTitle?: string }>;
};

export default async function PurchasePage({ searchParams }: PurchasePageProps) {
  const params = await searchParams;
  return (
    <>
      <LmsBackButton />
      <DirectStudentPurchase
        courseSlug={params?.courseSlug || ""}
        courseTitle={params?.courseTitle || ""}
      />
    </>
  );
}
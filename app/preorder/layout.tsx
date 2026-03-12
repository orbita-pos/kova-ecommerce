import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pre-order",
  description:
    "Pre-order your KOVA headphones. Choose your model, customize your colorway, and get free worldwide shipping.",
};

export default function PreorderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

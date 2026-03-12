import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Models",
  description:
    "Compare KOVA Lite, KOVA, and KOVA Ultra headphones. Side-by-side specs, features, and pricing to find your perfect sound.",
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

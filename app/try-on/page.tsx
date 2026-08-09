import type { Metadata } from "next";
import TryOn from "../components/TryOn";

export const metadata: Metadata = {
  title: "Tattoo Try-On",
  description:
    "Preview tattoo designs on your own photo with ZKINK Tattoo Try-On. See how a tattoo may look on your body before booking your tattoo appointment.",
};

export default function TryOnPage() {
  return <TryOn />;
}
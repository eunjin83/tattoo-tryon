import type { Metadata } from "next";
import Booking from "../components/Booking";

export const metadata: Metadata = {
  title: "Book a Tattoo Appointment",
  description:
    "Book a tattoo appointment with ZKINK, a San Francisco tattoo artist specializing in Black & Grey realism, fine line, and custom tattoo designs.",
};

export default function BookingPage() {
  return <Booking />;
}
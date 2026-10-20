import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Logo() {
  return (
    <Link
      to="/"
      aria-label="VitalFlo home"
      className="flex items-center rounded-full bg-white px-3 py-1 shadow-md shadow-[#1a3a5c]/20"
    >
      <img
        src={logo}
        alt="VitalFlo"
        width="320"
        height="94"
        className="h-7 w-auto lg:h-8"
      />
    </Link>
  );
}

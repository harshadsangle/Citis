import { permanentRedirect } from "next/navigation";

export default function LegacyScienceLabRoute() {
  permanentRedirect("/products/science-lab");
}

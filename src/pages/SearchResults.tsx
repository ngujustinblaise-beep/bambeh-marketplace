import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function SearchResults() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const query = (params.get("q") || "").toLowerCase();

  useEffect(() => {
    if (!query) return;

    if (query.includes("house") || query.includes("apartment")) {
      navigate("/rentals");
      return;
    }

    if (query.includes("car") || query.includes("vehicle")) {
      navigate("/vehicles");
      return;
    }

    if (query.includes("job") || query.includes("work")) {
      navigate("/jobs");
      return;
    }

    navigate("/marketplace");
  }, [query, navigate]);

  return null;
}

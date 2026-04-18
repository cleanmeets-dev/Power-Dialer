import { useMemo } from "react";

export default function useScraperStats(results) {
  return useMemo(() => {
    return {
      totalResults: results.length,
      withPhone: results.filter((item) => item.phone).length,
      withWebsite: results.filter((item) => item.website).length,
      rated: results.filter((item) => item.rating).length,
    };
  }, [results]);
}

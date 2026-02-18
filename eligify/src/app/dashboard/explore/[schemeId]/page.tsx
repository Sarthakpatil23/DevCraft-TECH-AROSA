import SchemeIntelligencePage from "./scheme-client";

// Pre-generate all known scheme pages for static export
export function generateStaticParams() {
    return [
        { schemeId: "pm-kisan" },
        { schemeId: "national-scholarship" },
        { schemeId: "ayushman-bharat" },
        { schemeId: "startup-india" },
        { schemeId: "pm-awas" },
        { schemeId: "maha-dbt" },
        { schemeId: "mudra-loan" },
        { schemeId: "sukanya-samriddhi" },
        { schemeId: "pm-kaushal" },
        { schemeId: "farmer-credit" },
        { schemeId: "obc-scholarship" },
        { schemeId: "state-farmer" },
    ];
}

export default function Page() {
    return <SchemeIntelligencePage />;
}

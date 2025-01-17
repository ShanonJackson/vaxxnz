import * as React from "react";
import { LocationRouter } from "../../src/LocationRouter";
import { TodayLocationsSection } from "../../src/today-locations/TodayLocationsSection";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Navigation } from "../../src/components/layouts/Navigation/Navigation";

function Page() {
    return (
        <Navigation hideBanner={true}>
            <div className={"big-old-container"}>
                <LocationRouter />
                <TodayLocationsSection />
            </div>
        </Navigation>
    );
}

export const getServerSideProps: GetServerSideProps = async ({
    locale,
    res,
}) => {
    res.setHeader("Cache-Control", "s-maxage=100, stale-while-revalidate");
    return {
        props: {
            ...(await serverSideTranslations(locale || "en-NZ", ["common"])),
        },
    };
};

export default Page;

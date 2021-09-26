import * as React from "react";
import { Navigation } from "../../src/components/layouts/Navigation/Navigation";
import { cookie } from "../../src/md/LegalContent";
import ReactMarkdown from "react-markdown";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

function Page() {
    return (
        <Navigation hideBanner={true}>
            <div className={"big-old-container"}>
                <ReactMarkdown>{cookie}</ReactMarkdown>
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
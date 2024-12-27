import BaseLayout from "@ui/layout/BaseLayout";
import NftList from "@ui/nft/list";
import { NextPage } from "next";

const Create: NextPage = () => {
    return (
        <BaseLayout>
             <NftList />
        </BaseLayout>
    );
}

export default Create;
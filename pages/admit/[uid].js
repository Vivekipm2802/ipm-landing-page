import { NextSeo } from "next-seo";
import { supabaseServer } from "../../utils/supabaseClient";
import styles from "./AdmitCard.module.css";
import "tailwindcss/tailwind.css";
import { Button } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";
export default function Card({ pdata }) {
  const data = pdata?.data;
  const [loading, setLoading] = useState(false);
  const [download, setDownload] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
 const [testing,setTesting] = useState(true)
  const router = useRouter();

  

  useEffect(() => {
    if (router?.query?.download == 1) {
      setDownload(true);
    }
  }, [router]);

  async function getDownload(a) {
    setLoading(true);
    const data = await axios.post("https://generate.your-domain.com/printables", {
      url: a,
      width: "210mm",
      height: "297mm",
    });

    if (data?.data?.url) {
      window.open(`/api/getPDF?pdf=${data.data.url}`, "_blank");
      setLoading(false);
    }
  }
if(testing){
    return <div className={styles.page}>
    <NextSeo
      title={"IPMAT Admit Card | IPM Careers Premium IPMAT Coaching"}
      description={
        "Detailed Admit Card using Admit Card Tool by IPM Careers. Available at register.ipmcareer.com/ipmat-admit-card"
      }
      openGraph={{
        title: "IPMAT Admit Card | IPM Careers Premium IPMAT Coaching",
        description:
          "Detailed Admit Card using Admit Card Tool by IPM Careers. Available at register.ipmcareer.com/ipmat-admit-card",
        images: [
          {
            url: "/admitool.png",
            width: 1200,
            height: 630,
            alt: "IPM Careers Admit Card Tool",
          },
        ],
      }}
    />
    <iframe className="w-full h-full" src={pdata?.url+"#toolbar=0&navpanes=0"}></iframe>
    </div>
}
  return ( <div className={styles.page}>
      <NextSeo
        title={"IPMAT Admit Card | IPM Careers Premium IPMAT Coaching"}
        description={
          "Detailed Admit Card using Admit Card Tool by IPM Careers. Available at register.ipmcareer.com/ipmat-admit-card"
        }
        openGraph={{
          title: "IPMAT Admit Card | IPM Careers Premium IPMAT Coaching",
          description:
            "Detailed Admit Card using Admit Card Tool by IPM Careers. Available at register.ipmcareer.com/ipmat-admit-card",
          images: [
            {
              url: "/admitool.png",
              width: 1200,
              height: 630,
              alt: "IPM Careers Admit Card Tool",
            },
          ],
        }}
      />
      {download == true ? (
        <Button
          isLoading={loading}
          className="fixed right-3 bottom-3"
          size="lg"
          color="secondary"
          onPress={() => {
            getDownload(
              `https://register.ipmcareer.com${router.asPath.split("?")[0]}`
            );
          }}
        >
          Download
        </Button>
      ) : (
        ""
      )}
      <div className="w-full flex flex-row h-[70mm]">
        <div className="flex-0 h-full">
          <img
            src={data?.sData?.picture}
            className="aspect-square w-auto h-full object-cover rounded-full"
          />
        </div>
        <div className="flex-1 flex flex-col justify-start text-xl items-start p-4 ">
          <h2>
            <strong className="text-primary">Name :</strong> {data?.sData?.name}
          </h2>
          <h2>
            <strong className="text-primary">Date of Birth :</strong>{" "}
            {data?.sData?.dob}
          </h2>
          <h2>
            <strong className="text-primary">Application Number :</strong>{" "}
            {data?.sData?.appno}
          </h2>
          <h2>
            <strong className="text-primary">Category :</strong>{" "}
            {data?.sData?.category}
          </h2>
          <h2>
            <strong className="text-primary">PwD :</strong> {data?.sData?.isPWD}
          </h2>
          {data?.sData?.signature != undefined ? (
            <img src={data?.sData?.signature} />
          ) : (
            ""
          )}
        </div>
      </div>

      <div className="w-full border-1 rounded-xl p-4 my-[5mm] bg-white shadow-md">
        <h2 className="text-2xl font-bold">Exam Details:</h2>
        <h2>
          <strong className="text-primary">Exam Date :</strong>{" "}
          {data?.tData?.date}
        </h2>
        <h2>
          <strong className="text-primary">Reporting/Entry Time :</strong>{" "}
          {data?.tData?.entry}
        </h2>
        <h2>
          <strong className="text-primary">
            Gate Closing Time of Centre :
          </strong>{" "}
          {data?.tData?.closing}
        </h2>
        <h2>
          <strong className="text-primary">
            Exam Session Time (Time Period) :
          </strong>{" "}
          {data?.tData?.period}
        </h2>
        <h2>
          <strong className="text-primary">Centre Located in City :</strong>{" "}
          {data?.tData?.city}
        </h2>
        <h2>
          <strong className="text-primary">Centre Location :</strong>{" "}
          {data?.tData?.location}
        </h2>
       
        <h2>
          <strong className="text-primary">Centre Map Link :</strong>{" "}
          <a
            target="_blank"
            className="text-primary underline"
            href={pdata?.map_url}
          >
            {pdata?.map_url}
          </a>
        </h2>

<h2 className="flex flex-row items-center justify-start">
          <strong className="text-primary">
            Centre Distance from your Location :
          </strong>{" "}
          <Button className="bg-gradient-purple text-white ml-2" size="sm" as={Link} href={`/admit/location/${pdata?.appno}`}
          target="_blank"  >Click to Track Distance</Button>
        </h2>


      </div>

      <div className="w-full border-1 rounded-xl p-4 my-[2.5mm] bg-white shadow-md">
        <h2 className="text-2xl font-bold">Instructions:</h2>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const uid = context.query.uid || undefined;
  if (uid == undefined) {
    return { notFound: true };
  }

  const { data, error } = await supabaseServer
    .from("admit_cards")
    .select("*")
    .eq("uid", uid)
    .single();

  if (data) {
  }

  if (error) {
    console.log(error)
    return { notFound: true };
  }

  return {
    props: { pdata: data },
  };
}

import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import { useState, useEffect } from "react";
import styles from "./Cities.module.css";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Notifications from "../components/Notification";
import YouTube from "react-youtube";
import axios from "axios";
import Section from "../components/Section";
import qs from "qs";
const inter = Inter({ subsets: ["latin"] });
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import Switcher from "../components/Switcher";
import CustomSelect from "../components/CustomSelect";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";
import { years } from "../utils/years";
const ResponsiveIFrame = ({ src }) => {
  return (
    <div className={styles.responsive_iframe_container}>
      <iframe
        src={src}
        frameBorder={"0"}
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

export default function City() {
  const router = useRouter();
  const [isSubmitted, setSubmitted] = useState(false);
  const [scrolled, setScrolled] = useState();
  const [favicon, setFavicon] = useState("/favicon_ipm.svg");
  const [students, setStudents] = useState(5355);
  const [loader, setLoader] = useState(false);
  const [currentSub, setSub] = useState("Register Now");
  const [activePopup, setActivePopup] = useState(false);
  const [notificationText, setNotificationText] = useState();
  const [timeoutId, setTimeoutId] = useState(null);
  const [datahtml, setHtml] = useState();
  const [formData, setFormData] = useState();

  const cities = [
    {
      title: "Nagpur",
      slug: "nagpur",
      video: "https://www.youtube.com/embed/cuTKHzOIkfM",
      branches: [
        {
          title: "Khapri",
          address:
            "1st Address: Sector No.27, Plot No. 48, Behind Govt. Engineering College, Punar Wasan, New Khapri Shankarpur Road, Khapri, Nagpur",
          contact: "+91 797 242 9252",
          centreDirector: {
            name: "Mr. Atul Anand Koche",
            image:
              "https://www.ipmcareer.com/wp-content/uploads/2023/11/WhatsApp-Image-2023-11-04-at-14.34.57_327cca1f.jpg",
          },
        },
        {
          title: "Trimurti Nagar",
          address:
            "3rd floor Chandrabhaga appartments, Sujata Layout, Deendayal Nagar, London Street, Trimurti nagar, Nagpur, Maharashtra 440022",
          contact: "+91 958 860 8075",
          centreDirector: {
            name: "Mr. Atul Anand Koche",
            image:
              "https://www.ipmcareer.com/wp-content/uploads/2023/11/WhatsApp-Image-2023-11-04-at-14.34.57_327cca1f.jpg",
          },
        },
        {
          title: "Bezonbagh",
          address:
            "Croffleto Cafe, Ginger Mall, Jaripatka Cement Rd, beside Caliber Net Cafe, opposite Embellish Unisex Salon, Bezonbagh, Nagpur, Maharashtra 440014",
          contact: "+91 866 822 9448",
          centreDirector: {
            name: "Mr. Atul Anand Koche",
            image:
              "https://www.ipmcareer.com/wp-content/uploads/2023/11/WhatsApp-Image-2023-11-04-at-14.34.57_327cca1f.jpg",
          },
        },
      ],
      badges: [
        "One-on-One Mentorship Sessions by Experts",
        "Classroom Experience for Better Studies",
      ],
      slides: [
        {
          image: "/indore.png",
          alt: "",
        },
      ],
    },

    {
      title: "Kanpur",
      slug: "kanpur",
      video: "https://www.youtube.com/embed/cuTKHzOIkfM",
      branches: [
        {
          title: "Mall Road",
          address: "2nd floor, Regal Building 129 Mall Road - Kanpur, 208 004",
          contact: "+91 82994 70392",
          centreDirector: {
            name: "Ashutosh Mishra",
            image:
              "https://www.ipmcareer.com/wp-content/uploads/2016/11/Ashutosh-Sir-e1641723253112.jpg",
          },
        },
        {
          title: "Kakadeo",
          address: "117 / N67 Shastri Market Kakadeo - 208025",
          contact: "+91 83185 35139",
          centreDirector: {
            name: "Ashutosh Mishra",
            image:
              "https://www.ipmcareer.com/wp-content/uploads/2016/11/Ashutosh-Sir-e1641723253112.jpg",
          },
        },
      ],
      badges: [
        "One-on-One Mentorship Sessions by Experts",
        "Classroom Experience for Better Studies",
      ],
      slides: [
        {
          image: "/indore.png",
          alt: "",
        },
      ],
    },
    {
      title: "Lucknow",
      slug: "lucknow",
      video: "https://www.youtube.com/embed/cuTKHzOIkfM",
      branches: [
        {
          title: "Hazratganj Branch",
          address:
            "2nd FLoor, Dube Chambers, Sapru Marg, above Mr. Brown Bakery,Prem Nagar, Hazratganj,Lucknow - 2260014",
          contact: "+91 84237 33923",
          centreDirector: {
            name: "Ashutosh Mishra",
            image:
              "https://www.ipmcareer.com/wp-content/uploads/2016/11/Ashutosh-Sir-e1641723253112.jpg",
          },
        },
        {
          title: "Gomti Nagar Branch",
          address:
            "B4, 225, Vishal Khand, Gomti Nagar,Lucknow, Uttar Pradesh - 226010",
          contact: "+91 84237 33923",
          centreDirector: {
            name: "Ashutosh Mishra",
            image:
              "https://www.ipmcareer.com/wp-content/uploads/2016/11/Ashutosh-Sir-e1641723253112.jpg",
          },
        },
      ],
      badges: [
        "One-on-One Mentorship Sessions by Experts",
        "Classroom Experience for Better Studies",
      ],
      slides: [
        {
          image: "/indore.png",
          alt: "",
        },
      ],
    },
    {
      title: "Prayagraj",
      slug: "prayagraj",
      video: "https://www.youtube.com/embed/cuTKHzOIkfM",
      branches: [
        {
          title: "Prayagraj Branch",
          address:
            "1,Dr Lohia Road,Anant Kripa Balaji apartment next to Girls High School G.H.S. gate no.4, Civil Lines, Prayagraj, Uttar Pradesh",
          contact: "+918127866668",
          centreDirector: {
            name: "Ashutosh Mishra",
            image:
              "https://www.ipmcareer.com/wp-content/uploads/2016/11/Ashutosh-Sir-e1641723253112.jpg",
          },
        },
      ],
      badges: [
        "One-on-One Mentorship Sessions by Experts",
        "Classroom Experience for Better Studies",
      ],
      slides: [
        {
          image: "/indore.png",
          alt: "",
        },
      ],
    },
    {
      title: "Mumbai",
      slug: "mumbai",
      video: "https://www.youtube.com/embed/cuTKHzOIkfM",
      branches: [
        {
          title: "Mumbai Branch",
          address:
            "Caesars Court, 2nd Floor, 217, Swami Vivekananda Rd, above Paaneri, Andheri West, Mumbai, Maharashtra 400058",
          contact: "+91 73768 72379",
          centreDirector: {
            name: "Ashutosh Mishra",
            image:
              "https://www.ipmcareer.com/wp-content/uploads/2016/11/Ashutosh-Sir-e1641723253112.jpg",
            role: "Co-Founder",
          },
          centreDirector2: {
            name: "Rishabh Singh",
            image:
              "https://www.ipmcareer.com/wp-content/uploads/2022/01/WhatsApp-Image-2022-01-09-at-4.49.41-PM-e1641850793724.jpeg",
            role: "Centre Director",
          },
        },
      ],
      badges: [
        "One-on-One Mentorship Sessions by Experts",
        "Classroom Experience for Better Studies",
      ],
      slides: [
        {
          image: "/indore.png",
          alt: "",
        },
      ],
    },
    {
      title: "Delhi",
      slug: "delhi",
      video: "https://www.youtube.com/embed/cuTKHzOIkfM",
      branches: [
        {
          title: "Connaught Place Branch",
          address:
            "9-A, Phelps Building, 2nd Floor, A Block, Middle Circle, Connaught Place, New Delhi - 110001",
          contact: "+91 90769 00940",
          centreDirector: {
            name: "Mr. Deepak Khushawa",
            image:
              "https://www.ipmcareer.com/wp-content/uploads/2016/11/deepak-kushwaha.jpg",
          },
        },
      ],
      badges: [
        "One-on-One Mentorship Sessions by Experts",
        "Classroom Experience for Better Studies",
      ],
      slides: [
        {
          image: "/indore.png",
          alt: "",
        },
      ],
    },
    {
      title: "Pune",
      slug: "pune",
      video: "https://www.youtube.com/embed/cuTKHzOIkfM",
      branches: [
        {
          title: "Pune Branch",
          address:
            "Office no. 8, 1st floor, Sagar Arcade building, besides Wadeshwar Restaurant, near Goodluck Chowk, Fergusson College Rd, Deccan Gymkhana, Pune, Maharashtra 411004",
          contact: "+91 87998 42278",
          centreDirector: {
            name: "Mr. Deepak Khushawa",
            image:
              "https://www.ipmcareer.com/wp-content/uploads/2016/11/deepak-kushwaha.jpg",
          },
        },
      ],
      badges: [
        "One-on-One Mentorship Sessions by Experts",
        "Classroom Experience for Better Studies",
      ],
      slides: [
        {
          image: "/indore.png",
          alt: "",
        },
      ],
    },
  ];
  const [pageData, setPageData] = useState();
  useEffect(() => {
    if (router.query.city != undefined) {
      const r = cities.filter((i, d) => {
        if (router.query.city == i.slug) {
          return i;
        }
      });

      if (r) {
        setPageData(r[0]);
      } else {
      }
    }
  }, [router]);

  useEffect(() => {
    if (pageData && pageData.length > 0) {
    } else {
    }
  }, [pageData]);
  const testimonials = [
    {
      icon: "https://ipmcareer.com/wp-content/uploads/2023/01/resutls-1.png",
      heading: "Best IPMAT Results",
    },
    {
      icon: "https://ipmcareer.com/wp-content/uploads/2023/01/professsor-1.png",
      heading: "Best IITs - IIMs Faculties",
    },
    {
      icon: "https://ipmcareer.com/wp-content/uploads/2023/01/study-material-1.png",
      heading: "Excellent Study Material",
    },
    {
      icon: "https://ipmcareer.com/wp-content/uploads/2023/01/ai-booked-1.png",
      heading: "AI based Test Series",
    },
    {
      icon: "https://ipmcareer.com/wp-content/uploads/2023/01/one-on-one-counselling-1.png",
      heading: "One-on-One Mentorship from IIMs Graduates",
    },
    {
      icon: "https://ipmcareer.com/wp-content/uploads/2023/01/doubt-1.png",
      heading: "One-on-One Doubt Clearing Sessions",
    },
  ];

  const heading = [
    "Register Now",
    "Its Free",
    "Limited Seats",
    "Best Coaching",
  ];
  function cronberryTrigger(
    username,
    u_email,
    u_mobile,
    u_year,
    u_city,
    linke,
    type
  ) {
    console.log(arguments);

    var id = Date.now();
    var data = JSON.stringify({
      projectKey: "VW50aXRsZSBQcm9qZWN0MTY1MDAxMzUxMDU5MQ==",
      audienceId: id,
      name: username,
      email: u_email,
      mobile: u_mobile,
      ios_fcm_token: "",
      web_fcm_token: "",
      android_fcm_token: "",
      profile_path: "",
      active: "",
      audience_id: "",
      paramList: [
        {
          paramKey: "source",
          paramValue: "",
        },
        {
          paramKey: "city",
          paramValue: u_city,
        },
        {
          paramKey: "postcode",
          paramValue: "",
        },
        {
          paramKey: "total_amount",
          paramValue: "",
        },
        {
          paramKey: "abondon_cart",
          paramValue: true,
        },
        {
          paramKey: "preparing_for_which_year",
          paramValue: u_year + ", Opt For : " + type,
        },
        {
          paramKey: "subject",
          paramValue: "",
        },
        {
          paramKey: "formurl",
          paramValue: linke,
        },
        {
          paramKey: "formname",
          paramValue: `${pageData ? pageData.title : "undefined"} Landing Page`,
        },
      ],
    });
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        setLoader(false);
        setNotification("Submitted Successfully");
        setSubmitted(true);
      }
    });
    xhr.open(
      "POST",
      "https://register.cronberry.com/api/campaign/register-audience-data"
    );
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.send(data);
  }

  const mentors = [
    {
      image:
        "https://www.ipmcareer.com/wp-content/uploads/2023/01/Ashutosh-Sir-e1641723253112.webp",
      fullname: "Ashutosh Mishra",
      role: "Master IIM Ahmedabad",
      role2: "Bachelors Thapar University",
      bg: "https://www.ipmcareer.com/wp-content/uploads/2023/01/IIMA-LKP_0-1.webp",
    },
    {
      image:
        "https://www.ipmcareer.com/wp-content/uploads/2016/11/deepak-kushwaha-350x350.jpg",
      fullname: "Deepak Kushwaha",
      role: "Master IIM Lucknow",
      role2: "Bachelors NIT Srinagar",
      bg: "https://www.ipmcareer.com/wp-content/uploads/2023/01/img-slider-4-1-1.webp",
    },
    {
      image:
        "https://www.ipmcareer.com/wp-content/uploads/2022/06/IMG_1848-350x350.jpg",
      fullname: "Dr. Swati A. Mishra",
      role: "Director Operations Lucknow Centre",
      role2: "Former Professor IIM Lucknow",
      bg: "https://cdn.britannica.com/85/13085-050-C2E88389/Corpus-Christi-College-University-of-Cambridge-England.jpg",
    },
    {
      image: "https://ipmcareer.com/wp-content/uploads/2023/01/manish.jpeg",
      fullname: "Manish Dixit",
      role: "IIT BHU Alumnus",

      bg: "https://www.ipmcareer.com/wp-content/uploads/2023/01/iit_bhu_slider_03-1.webp",
    },
    {
      image:
        "https://www.ipmcareer.com/wp-content/uploads/2022/01/WhatsApp-Image-2022-01-09-at-4.49.41-PM-e1641850793724-350x350.jpeg",
      fullname: "Rishabh Singh",
      role: "IIFM Bhopal Alumnus",
      bg: "https://www.careerindia.com/img/2013/10/24-indianinstituteofforestmanagement.jpg",
    },
    {
      image:
        "https://www.ipmcareer.com/wp-content/uploads/2022/12/WhatsApp-Image-2022-12-15-at-7.11.51-PM-e1671269681720.jpeg",
      fullname: "Divyansh Mishra",
      role: "IIM Raipur",
      bg: "https://www.ipmcareer.com/wp-content/uploads/2023/01/jpg-1.webp",
    },
    {
      image: "https://www.cattutorials.com/raghav.jpg",
      fullname: "Raghav Shukla",
      role: "IIM Kozhikode",
      bg: "/iimk.webp",
    },
    {
      image:
        "https://www.ipmcareer.com/wp-content/uploads/2022/01/Rishita-e1672914918610-350x350.jpg",
      fullname: "Rishita Gupta",
      role: "Multiple IIMs Call Getter",
      bg: "https://backend.insideiim.com/wp-content/uploads/2017/04/IIM_Collage.jpg",
    },
  ];

  const slides = [
    {
      image: "/indore.png",
      alt: "IPM Careers Indore ",
    },
    {
      image: "/inaug.png",
      alt: "Inaguration Offer",
    },
    ,
    {
      image: "/mentorship.png",
      alt: "Mentorship sessions with Ashutosh Sir",
    },
  ];
  const faqs = [
    {
      question: "How will this IPMAT preparation help me?",
      answer:
        "Practicing IPMAT Mock Tests will help improve your time-management skills and build your confidence levels. So, it is advised to take up mock tests regularly and try to analyze your performance after completing each mock test.",
    },
    {
      question: "How many exams are covered under this preparation?",
      answer:
        "IPM BBA/BMS prep cover aptitude tests conducted by IIM Indore (IPMAT – Indore), IIM Rohtak (IPMAT – Rohtak), IIM Bodh Gaya and IIM Jammu (JIPMAT) for  their 5-year integrated programs. The test prep program also cover entrance tests conducted by DU (DU JAT), NMIMS (NPAT), Symbiosis (SET), Christ University (CUET), IP University (IPUCET) and St. Xavier’s College – Mumbai for their BMS program",
    },
    {
      question: "Can I avail one on one clearing doubt sessions?",
      answer:
        "Students should contact their IPM Careers center to book a one-on-one doubt clearing session with a mentor.",
    },
    {
      question: "How do I access live classes?",
      answer:
        "On successful completion of enrolment process, students receive a IPM Careers Zoom id & password to join IPM Careers live platform and to attend live, online classes.",
    },
    {
      question: "Is Fee Refundable?",
      answer: "Fee is neither Refundable nor transferable",
    },
    {
      question: "Is there any contact number to reach you?",
      answer: "For any queries contact @8299470392.",
    },
  ];
  const types = [
    {
      title: "Home Visit",
      value: "Home Visit",
    },
    {
      title: "Zoom Meet",
      value: "Zoom Meet",
    },
    {
      title: "Over Call",
      value: "Over Call",
    },
  ];
  const reviews = [
    {
      image:
        "https://www.ipmcareer.com/wp-content/uploads/2022/08/WhatsApp-Image-2022-08-11-at-11.41.49-AM.jpeg",
      fullname: "Jiya Kejriwal",
      college: "IIM Indore   ",
      title: "Expert Interview Panel",
      review:
        " Faculty at IPM Career is extremely dedicated and hardworking. They make it a point for every student to be equally interactive in the classroom sessions. Mock interviews by experts from industry helped a lot.",
    },
    {
      image:
        "https://www.ipmcareer.com/wp-content/uploads/2022/08/WhatsApp-Image-2022-07-30-at-8.26.20-PM.jpeg",
      fullname: "Juhi Mehra",
      college: "IIM Indore",
      title: "Supportive Faculty Team",
      review:
        " My experience as an IPM aspirant was truly memorable, The faculty team was extremely supportive.They always made sure that all my doubts were cleared. It is for them that I have reached where I am now.",
    },
    {
      image:
        "https://www.ipmcareer.com/wp-content/uploads/2023/01/WhatsApp-Image-2023-01-06-at-1.54.33-PM-e1673093647344.jpeg",
      fullname: "Akshita Maheshwari",
      college: "IIM Indore",
      title: "Game Changing Tips",
      review:
        "I learned a lot of tips & tricks at IPM Careers which were really game changing and it boosted my perspective of learning along. Those little things are the key factors which help students like me achieve the goals.",
    },
  ];

  function setNotification(de) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    setNotificationText(de);
    const id = setTimeout(() => {
      setNotificationText(), setTimeoutId(null), console.log("notcall");
    }, 2500);
    setTimeoutId(id);
  }
  useEffect(() => {
    var index = 0;

    const r = setInterval(() => {
      if (index < heading.length - 1) {
        index++;
        setSub(heading[index]);
      } else {
        index = 0;
        setSub(heading[0]);
      }
    }, 1000);

    setTimeout(() => {
      setActivePopup(true);
    }, 5000);
    setTimeout(() => {
      setFavicon("/favicon_active.svg");
    }, 1000);

    return () => {
      clearInterval(r);
    };
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      setStudents(students + 1);
    }, 8000); // 60000 milliseconds = 1 minute
    return () => clearInterval(interval);
  }, [students]);

  const opts = {
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 1,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      loop: 1,
    },
  };
  async function handleAPI(a, b, c) {
    console.log("api");
    await axios
      .post("/api/hello", {
        fullname: a,
        event: "Free Consultation",
        user_id: c,
        recipient: b,
      })
      .then((res) => {
        setLoader(false);
      })
      .catch((res) => {
        setLoader(false);
      });
  }

  const features = [
    <>
      Best & Promising<span className={styles.blue}>&nbsp;IPMAT Results</span>
    </>,
    <>
      Mentoring by<span className={styles.blue}>&nbsp;IIM Alumni</span>
    </>,
    <>
      Awarded #1<span className={styles.blue}> by ZEE News</span>
    </>,
    <>
      Gained Media Exposure for
      <span className={styles.blue}> Excellent Academic Performance</span>
    </>,
  ];
  const [mobile, setMobile] = useState("desktop");
  useEffect(() => {
    function setWidth() {
      if (window.innerWidth < 768) {
        setMobile("mobile");
      } else if (window.innerWidth < 968) {
        setMobile("tablet");
      } else {
        setMobile("desktop");
      }
    }
    window.addEventListener("resize", (e) => {
      setWidth();
    });

    window.addEventListener("load", () => {
      setWidth();
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 1080) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    });
  });

  async function triggerInterakt() {
    axios
      .post("/api/interakt", {
        userId: Date.now(),
        phoneNumber: formData.phone,
        countryCode: "+91",
        event: "Campaign Notification",
        name: formData.fullname,
        email: formData.email,

        tag: "Landing Page",
      })
      .then((res) => {
        console.log(res);
      })
      .catch((res) => {
        console.log(res);
      });
  }
  async function SubmitContact() {
    if (formData == undefined) {
      setNotification("All Fields are empty");
      return null;
    }
    if (!formData.fullname || formData.fullname.trim() === "") {
      setNotification("Fullname field is empty");
      return null;
    }

    // Check email
    if (!formData.email || formData.email.trim() === "") {
      setNotification("Email field is empty");
      return null;
    }

    // Validate the email format using a regular expression
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(formData.email)) {
      setNotification("Email is not valid");
      return null;
    }

    // Check phone
    if (!formData.phone || formData.phone.trim() === "") {
      setNotification("Phone field is empty");
      return null;
    }

    // Validate the phone number
    const phoneRegex = /^[0-9]{10}$/; // Change the regex pattern as needed
    if (!phoneRegex.test(formData.phone)) {
      setNotification("Phone number is not valid");
      return null;
    }

    // Check year
    if (!formData.year || formData.year.trim() === "") {
      setNotification("Year field is empty");
      return null;
    }

    // Validate the year
    const year = parseInt(formData.year);
    if (isNaN(year) || year < 1900 || year > 2099) {
      setNotification("Year is not valid");
      return null;
    }

    // Check city
    if (!formData.city || formData.city.trim() === "") {
      setNotification("City field is empty");
      return null;
    }
    setLoader(true);

    /* TestApi(); */
    triggerInterakt();
    /* await axios.post('/') */
    cronberryTrigger(
      formData.fullname,
      formData.email,
      formData.phone,
      formData.year,
      formData.city,
      "https://register.ipmcareer.com",
      formData?.type ? formData.type : ""
    );
    const { data, error } = await supabase
      .from("ipm_leads")
      .insert({
        name: formData.fullname,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        year: formData.year,

        source: `${pageData ? pageData.title : "undefined"} Landing Page`,
      })
      .select();
    if (data) {
      console.log("inserted");
    } else if (error) {
      console.log(error);
    }
  }

  async function TestApi() {
    const data = {
      client_id: 3158,
      security_code: "d1R9fF5mfiE=",
      course_id: 35736,
      category_id: 835941,
      action: "coursedetail",
      full_name: formData.fullname,
      city: formData.city,
      mobile_number: formData.phone,
      email: formData.email,
    };
    await axios
      .post("/api/tcy", data)
      .then((res) => {
        handleAPI(formData.fullname, formData.email, res.data);
      })
      .catch((res) => {
        handleAPI(formData.fullname, formData.email, res.data);
      });
  }

  async function studentlogin(d) {
    await axios
      .post(
        "https://www.tcyonline.com/api/erp_request.php",
        qs.stringify({
          client_id: 3158,
          security_code: "d1R9fF5mfiE=",

          action: "login",
          user_id: d,
        }),
        {
          headers: {
            "Content-Type": "application-x-www-form-urlencoded",
            "Access-Control-Allow-Origin": "*",
          },
        }
      )
      .then((res) => {})
      .catch((res) => {
        console.log(res);
      });
  }
  function validatePhone(phone) {
    const re = /^(\+\d{1,4})?(?!0+\s+,?$)\d{10}\s*,?$/;
    return re.test(phone);
  }
  function validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
  return (
    <>
      <Head>
        <title>IPM Careers | {currentSub}</title>
        <meta name="description" content="IPM Careers" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={favicon} />
      </Head>

      {pageData ? (
        <main className={styles.main}>
          <div className={styles.hd}>
            <img src="/ipm_logo.svg" />
          </div>
          {isSubmitted ? (
            <div className={styles.modal}>
              <div className={styles.modalinner}>
                <h2>Thank You !!</h2>
                <h3>
                  Choosing Us today is the best decision you could have made
                  yet.
                </h3>
                <p>We've received your details</p>
                <p>Our Executive will get back to you shortly.</p>

                <p>
                  For Quick Assitance you can call us on :{" "}
                  <a href="tel:+919616383524">+91 96163 83524</a>
                </p>
                <a
                  href="https://ipmcareer.com/courses"
                  className={styles.submit}
                >
                  Explore Our Courses
                </a>
                <a className={styles.submit} href="https://ipmcareer.com">
                  Visit Our Website
                </a>
              </div>
            </div>
          ) : (
            ""
          )}
          {notificationText && notificationText.length > 2 ? (
            <Notifications text={notificationText} />
          ) : (
            ""
          )}
          <Navbar scrolled={scrolled} />
          {loader ? (
            <div className={styles.loader}>
              <svg
                width="197px"
                height="197px"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid"
              >
                <circle
                  cx="50"
                  cy="50"
                  fill="none"
                  stroke="var(--brand-col2)"
                  stroke-width="3"
                  r="27"
                  stroke-dasharray="127.23450247038662 44.411500823462205"
                ></circle>
              </svg>
              <p>Sending your wish to IIM Gods</p>
            </div>
          ) : (
            ""
          )}
          <div className={styles.heroo}>
            <div className={styles.bgfill5}></div>
            <div className={styles.herohead}>
              <h1>
                Preparation for <br />
                <span className={styles.color2}>IPMAT 2024/25 </span>
                {pageData.title == "Mumbai" ? (
                  <>
                    & <span className={styles.color2}>NPAT</span>
                  </>
                ) : (
                  ""
                )}{" "}
                Now Offline
                <br />
                <span className={styles.color3}>
                  At IPM Careers {pageData.title}
                </span>
              </h1>
            </div>
            {pageData?.slug == "nagpur" ? (
              <h2 className={styles.npat}>IPMAT / NPAT / SET</h2>
            ) : (
              ""
            )}
            <div className={styles.branches}>
              {pageData &&
                pageData.branches &&
                pageData.branches.map((i, d) => {
                  return (
                    <div className={styles.branch}>
                      <h2>{i.title}</h2>
                      <p>Address:{i.address}</p>
                      <h2>
                        {i?.centreDirector?.role
                          ? i.centreDirector.role
                          : "Centre Director"}
                      </h2>
                      <div className={styles.centre}>
                        <img
                          src={i.centreDirector.image}
                          width={"24px"}
                          heigh={"24px"}
                        />{" "}
                        <p>{i.centreDirector.name}</p>
                      </div>

                      {i?.centreDirector2 ? (
                        <>
                          <h2>
                            {i?.centreDirector2?.role
                              ? i.centreDirector2.role
                              : "Centre Director"}
                          </h2>
                          <div className={styles.centre}>
                            <img
                              src={i.centreDirector2.image}
                              width={"24px"}
                              heigh={"24px"}
                            />{" "}
                            <p>{i.centreDirector2.name}</p>
                          </div>
                        </>
                      ) : (
                        ""
                      )}

                      <a href={`tel:${i.contact.split(" ").join("")}`}>
                        Contact : {i.contact.split(" ").join("")}
                      </a>
                    </div>
                  );
                })}

              {pageData?.title == "Mumbai" ? (
                <div className={styles.mumbai}>
                  Now get Counselling <br />
                  <span style={{ color: "var(--brand-col2)" }}>
                    done @ your doorstep
                  </span>
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
          {/* <div className={styles.hero}>
        <Swiper
     modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={10}
      slidesPerView={1}
      loop={true}
      autoplay={true}
      speed={1200}
      pagination={{ clickable: true }}
      centeredSlides={true}
      onSlideChange={() =>{}}
      onSwiper={(swiper) => console.log(swiper)}
      onInit={(swiper) => {
       
        swiper.navigation.update();
      }}
      navigation={{
        nextEl: '.next',
        prevEl: '.prev',
        clickable:true,
      }}
   
    >


     
      
      {pageData && pageData.slides && pageData.slides.map((item,index)=>{

return(<>

<SwiperSlide key={index}><img alt={item.alt} className={styles.slideimage} src={item.image}/></SwiperSlide>

</>)
})} 


    </Swiper>


        </div> */}

          <section className={styles.maincont} id="form">
            <div className={styles.grad1}></div>
            <div className={styles.grad2}></div>
            <div className={styles.c1}>
              <h2>IPM Careers {pageData.title} is waiting for you!!</h2>
              <p>
                You can now learn at India's Best IPMAT{" "}
                {pageData.title == "Mumbai" ? "& NPAT" : ""} Coaching in{" "}
                {pageData.title}. Hurry Up, Register Now !!
              </p>
              {pageData.badges &&
                pageData.badges.map((i, d) => {
                  return <div className={styles.trust}>{i}</div>;
                })}

              <Switcher features={features} />
              <ResponsiveIFrame src={pageData.video}></ResponsiveIFrame>
              {/* <div className={styles.hold}>
  <p>Students Enrolled <br/><span className={styles.numbers}>{students}</span></p>
  <p>Classes Completed<br/><span className={styles.numbers}>{students*2}</span></p>
  <p>Hours Taught<br/><span className={styles.numbers}>{students*33}</span></p>
</div> */}
              {/* <div>
centreDirector:[{
  name:'Ashutosh Mishra',
  image:'https://www.ipmcareer.com/wp-content/uploads/2016/11/Ashutosh-Sir-e1641723253112.jpg',
}],

  <div className={styles.progress}>
    <div className={styles.progress_inner} style={{width:formData ? Object.keys(formData).length*100/5 +"%" : '0%'}}><p>Form Progress : {formData ? Object.entries(formData).length*100/5 +"%" : '0%'}</p></div>
 {formData && Object.keys(formData).length*100/5 == 100 ?  <p style={{right:'0',left:'unset'}}>Done</p>:''}
  </div>
</div> */}
            </div>
            <div className={styles.c2}>
              <div className={styles.formcont}>
                <h1 className={styles.team_heading}>
                  Fill out the form to Register
                </h1>
                <input
                  name={"name"}
                  className={styles.input}
                  placeholder={"Enter your Full Name"}
                  type={"text"}
                  value={formData && formData.fullname}
                  onChange={(e) => {
                    setFormData((res) => ({
                      ...res,
                      fullname: e.target.value,
                    }));
                  }}
                />
                <input
                  name={"email"}
                  className={
                    styles.input +
                    " " +
                    (validateEmail(formData ? formData.email : "test@gm.co")
                      ? ""
                      : styles.fielderror)
                  }
                  placeholder={"Enter your Email Address"}
                  type={"text"}
                  value={formData && formData.email}
                  onChange={(e) => {
                    setFormData((res) => ({ ...res, email: e.target.value }));
                  }}
                />
                <input
                  name={"phone"}
                  className={
                    styles.input +
                    " " +
                    (validatePhone(formData ? formData.phone : "+918888888888")
                      ? ""
                      : styles.fielderror)
                  }
                  placeholder={"Enter your Phone Number"}
                  type={"text"}
                  value={formData && formData.phone}
                  onChange={(e) => {
                    setFormData((res) => ({ ...res, phone: e.target.value }));
                  }}
                />
                <input
                  name={"city"}
                  className={styles.input}
                  placeholder={"Enter your City"}
                  type={"text"}
                  value={formData && formData.city}
                  onChange={(e) => {
                    setFormData((res) => ({ ...res, city: e.target.value }));
                  }}
                />
                <CustomSelect
                  z={9}
                  full="true"
                  defaultText="When are you planning to take IPM?"
                  noPadding={true}
                  objects={years}
                  setSelect={(r) => {
                    setFormData((res) => ({ ...res, year: r }));
                  }}
                />
                {pageData?.title == "Mumbai" ? (
                  <CustomSelect
                    z={7}
                    full="true"
                    defaultText="How would you opt for counselling?"
                    noPadding={true}
                    objects={types}
                    setSelect={(r) => {
                      setFormData((res) => ({ ...res, type: r }));
                    }}
                  />
                ) : (
                  ""
                )}
                {formData &&
                formData.city &&
                formData.fullname &&
                formData.phone &&
                formData.email &&
                formData.year ? (
                  ""
                ) : (
                  <p className={styles.error}>Please fill all the fields</p>
                )}
                {/* <div onClick={TestApi} className={styles.submit}>TEST</div> */}
                <div onClick={SubmitContact} className={styles.submit}>
                  SUBMIT
                </div>
                {/* <div className={styles.encrypt}>
<svg
    xmlns="http://www.w3.org/2000/svg"
    id="Layer_1"
    data-name="Layer 1"
    viewBox="0 0 93.63 122.88"
    
  >
    <defs>
      <style>{".cls-2{fill-rule:evenodd;fill:#36464e}"}</style>
    </defs>
    <title>{"padlock"}</title>
    <path
      d="M6 47.51h81.64a6 6 0 0 1 6 6v63.38a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6V53.5a6 6 0 0 1 6-6Z"
      style={{
        fillRule: "evenodd",
        fill: "#fbd734",
      }}
    />
    <path
      className="cls-2"
      d="m41.89 89.26-6.47 16.95h22.79l-6-17.21a11.79 11.79 0 1 0-10.32.24ZM83.57 47.51H72.22v-9.42a27.32 27.32 0 0 0-7.54-19 24.4 24.4 0 0 0-35.73 0 27.32 27.32 0 0 0-7.54 19v9.42H10.06v-9.42a38.73 38.73 0 0 1 10.72-26.81 35.69 35.69 0 0 1 52.07 0 38.67 38.67 0 0 1 10.72 26.81v9.42Z"
    />
  </svg>
<p>Your Data is End-to-End Encrypted!</p>
</div> */}
              </div>
            </div>
          </section>

          <img
            className={styles.rtop}
            src="https://www.ipmcareer.com/wp-content/uploads/2020/06/39-Selections-Web.jpg"
          />
          <Section
            title={"Know : Your Mentors"}
            color="var(--brand-col2)"
            align="right"
          >
            <div className={styles.parent2}>
              {mentors &&
                mentors.map((i, d) => {
                  return (
                    <>
                      <div className={styles.card}>
                        <div
                          alt={i.role}
                          className={styles.bg}
                          style={{ backgroundImage: "url(" + i.bg + ")" }}
                        ></div>
                        <img alt={i.fullname} src={i.image} />
                        <h2>{i.fullname}</h2>
                        {i.role ? <p className={styles.para}>{i.role}</p> : ""}
                        {i.role2 ? (
                          <p className={styles.para}>{i.role2}</p>
                        ) : (
                          ""
                        )}
                      </div>
                      {d == 1 && pageData?.slug == "nagpur" ? (
                        <>
                          <div className={styles.card}>
                            <div
                              alt={i.role}
                              className={styles.bg}
                              style={{
                                backgroundImage: "url('/nagpur-univ.jpg')",
                              }}
                            ></div>
                            <img
                              alt={i.fullname}
                              src={
                                "https://www.ipmcareer.com/wp-content/uploads/2023/11/WhatsApp-Image-2023-11-04-at-14.34.57_327cca1f.jpg"
                              }
                            />
                            <h2>Mr. Atul Anand Koche</h2>
                            {i.role ? (
                              <p className={styles.para}>{"Director"}</p>
                            ) : (
                              ""
                            )}
                          </div>
                          <div className={styles.card}>
                            <div
                              alt={i.role}
                              className={styles.bg}
                              style={{
                                backgroundImage: "url('/nagpur-univ.jpg')",
                              }}
                            ></div>
                            <img
                              alt={i.fullname}
                              src={
                                "https://www.ipmcareer.com/wp-content/uploads/2023/11/WhatsApp-Image-2023-11-09-at-14.13.41_a8020b82.jpg"
                              }
                            />
                            <h2>Dr. Anand N. Shakya</h2>
                            {i.role ? (
                              <p className={styles.para}>
                                {"Senior Advision and Visiting Faculty"}
                              </p>
                            ) : (
                              ""
                            )}
                          </div>
                        </>
                      ) : (
                        ""
                      )}
                    </>
                  );
                })}
            </div>
          </Section>

          {activePopup ? (
            <a
              href={
                "https://wa.me/919616383524?text=Hi%20%2C%20Connected%20Here%20via%20Connect%20Button%20on%20Website"
              }
              className={styles.popup}
            >
              <img alt="IPM Careers WhatsApp" src={"/WhatsApp.svg"} />
              Connect on WhatsApp
            </a>
          ) : (
            ""
          )}

          <Section
            title={"Why choose: IPM Careers?"}
            color="var(--brand-col1)"
            align="left"
            visible="true"
          >
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={10}
              slidesPerView={
                mobile === "mobile" ? 1.3 : mobile === "tablet" ? 2.5 : 4.5
              }
              loop={true}
              autoplay={true}
              loopFillGroupWithBlank={false}
              pagination={{ clickable: true }}
              centeredSlides={
                mobile === "desktop" || mobile === "tablet" ? false : false
              }
              onSlideChange={() => {}}
              onSwiper={(swiper) => console.log(swiper)}
              onInit={(swiper) => {
                swiper.navigation.update();
              }}
              navigation={{
                nextEl: ".next",
                prevEl: ".prev",
                clickable: true,
              }}
            >
              {testimonials &&
                testimonials.map((i, index) => {
                  return (
                    <>
                      <SwiperSlide key={index}>
                        <div className={styles.testimonial_card}>
                          <img alt={i.heading} src={i.icon} />
                          <h2>{i.heading}</h2>
                          <div className={styles.grad1}></div>
                          <div className={styles.grad2}></div>
                        </div>
                      </SwiperSlide>
                    </>
                  );
                })}
            </Swiper>
          </Section>
          <Section
            title={":Testimonials"}
            color="var(--brand-col1)"
            align="left"
            visible="true"
          >
            <div className={styles.reviewholder}>
              {reviews &&
                reviews.map((i, d) => {
                  return (
                    <div className={styles.rcard}>
                      <div className={styles.shape}></div>
                      <div className={styles.shape2}></div>
                      <div className={styles.rcard_profile}>
                        <img alt={i.fullname} src={i.image} />
                        <div>
                          <h2>{i.fullname}</h2>
                          <p>{i.college}</p>
                        </div>
                      </div>
                      <div className={styles.rcontent}>
                        <p className={styles.rtitle}>{i.title}</p>
                        <p>{i.review}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </Section>
          <Section
            title={"Our Promising:Results"}
            color="var(--brand-col2)"
            align="left"
            visible="true"
          >
            <img
              alt="IPM Careers Rohtak Results"
              className={styles.results}
              src={
                "https://www.ipmcareer.com/wp-content/uploads/2020/06/39-Selections-Web.jpg"
              }
            />
          </Section>
          {/* <Section title={"Frequently:Asked Questions"} color="var(--brand-col2)" align="left" visible="true">
   <FAQ items={faqs}/>
   </Section> */}

          {/* <button onClick={()=>{handleAPI()}} >Test</button> */}

          <div dangerouslySetInnerHTML={{ __html: datahtml }}></div>
          <Footer />
        </main>
      ) : (
        ""
      )}
    </>
  );
}

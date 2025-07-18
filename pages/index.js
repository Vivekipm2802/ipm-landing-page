import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import { useState, useEffect } from "react";
import styles from "./Home.module.css";
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
import { supabase } from "../utils/supabaseClient";
import { years } from "../utils/years";
import { reviews } from "../utils/testimonials";
import { result } from "../utils/contants";

export default function Home() {
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
    linke
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
          paramValue: u_year,
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
          paramValue: "Main Landing Page",
        },
      ],
    });
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        if (typeof window !== "undefined") {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: "registration_submitted",
          });
        }

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
        "https://www.ipmcareer.com/wp-content/uploads/2023/01/Screen-Shot-2021-01-10-at-3.24.16-PM-283x350-1-1.png",
      fullname: "Taruna Khanna",
      role: "GCC UCLA Extension",
      bg: "https://www.ipmcareer.com/wp-content/uploads/2023/01/education-concept-student-studying-brainstorming-campus-concept-close-up-students-discussing-their-subject-books-textbooks-selective-focus-660x330-1.webp",
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
      image:
        "https://ipmcareer.com/all-india-mock/wp-content/uploads/2023/06/manish.jpeg",
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
      image:
        "https://www.ipmcareer.com/wp-content/uploads/2022/01/Rishita-e1672914918610-350x350.jpg",
      fullname: "Rishita Gupta",
      role: "Multiple IIMs Call Getter",
      bg: "https://backend.insideiim.com/wp-content/uploads/2017/04/IIM_Collage.jpg",
    },
  ];

  const slides = [
    {
      image: "/banners/slide-1.png",
      alt: "IPM Careers",
    },
    {
      image: "/banners/slide1.jpg",
      alt: "IPM Careers",
    },
    {
      image: "/banners/slide6.jpg",
      alt: "IPM Careers",
    },
    {
      image: "/banners/slide2.jpg",
      alt: "IPM Careers",
    },
    {
      image: "/banners/slide3.jpg",
      alt: "IPM Careers",
    },
    {
      image: "/banners/slide0.jpg",
      alt: "IPM Careers",
    },
    {
      image: "/banners/slide4.jpg",
      alt: "IPM Careers",
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

    TestApi();
    triggerInterakt();
    /* await axios.post('/') */
    cronberryTrigger(
      formData.fullname,
      formData.email,
      formData.phone,
      formData.year,
      formData.city,
      "https://register.ipmcareer.com"
    );
    const { error } = await supabase.from("ipm_leads").insert({
      name: formData.fullname,
      email: formData.email,
      phone: formData.phone,
      city: formData.city,
      year: formData.year,
      source: "IPM Register Page",
    });
    if (!error) {
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

      <main className={styles.main}>
        <div className={styles.fixedbar}>
          <p>For Enquiry : </p>
          <svg
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.75 2A2.25 2.25 0 0 1 18 4.25v15.5A2.25 2.25 0 0 1 15.75 22h-7.5A2.25 2.25 0 0 1 6 19.75V4.25A2.25 2.25 0 0 1 8.25 2h7.5Zm0 1.5h-7.5a.75.75 0 0 0-.75.75v15.5c0 .414.336.75.75.75h7.5a.75.75 0 0 0 .75-.75V4.25a.75.75 0 0 0-.75-.75Zm-2.501 14a.75.75 0 0 1 .002 1.5l-2.5.004a.75.75 0 0 1-.002-1.5l2.5-.004Z"
              fill="#fff"
            />
          </svg>
          <a href="tel:+919616383524">+919616383524</a>
        </div>

        {isSubmitted ? (
          <div className={styles.modal}>
            <div className={styles.modalinner}>
              <h2>Thank You !!</h2>
              <h3>
                Choosing Us today is the best decision you could have made yet.
              </h3>
              <p>We've received your details</p>
              <p>Our Executive will get back to you shortly.</p>

              <p>
                For Quick Assitance you can call us on :{" "}
                <a href="tel:+919616383524">+91 96163 83524</a>
              </p>
              <a href="https://ipmcareer.com/courses" className={styles.submit}>
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
        <div className={styles.hero}>
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={10}
            slidesPerView={1}
            loop={true}
            autoplay={true}
            speed={1200}
            pagination={{ clickable: true }}
            centeredSlides={true}
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
            {slides &&
              slides.map((item, index) => {
                return (
                  <>
                    <SwiperSlide key={index}>
                      <img
                        alt={item.alt}
                        className={styles.slideimage}
                        src={item.image}
                      />
                    </SwiperSlide>
                  </>
                );
              })}
          </Swiper>
        </div>

        <section className={styles.maincont} id="form">
          <div className={styles.grad1}></div>
          <div className={styles.grad2}></div>
          <div className={styles.c1}>
            <h2>India's Premium IPMAT Coaching</h2>
            <p>Join now to grab the opportunity to learn from our experts</p>
            <div className={styles.trust}>TRUSTED BY THOUSANDS OF STUDENTS</div>
            <Switcher features={features} />
            <div className={styles.hold}>
              <p>
                Students Enrolled <br />
                <span className={styles.numbers}>{students}</span>
              </p>
              <p>
                Classes Completed
                <br />
                <span className={styles.numbers}>{students * 2}</span>
              </p>
              <p>
                Hours Taught
                <br />
                <span className={styles.numbers}>{students * 33}</span>
              </p>
            </div>
            <div>
              <div className={styles.progress}>
                <div
                  className={styles.progress_inner}
                  style={{
                    width: formData
                      ? (Object.keys(formData).length * 100) / 5 + "%"
                      : "0%",
                  }}
                >
                  <p>
                    Form Progress :{" "}
                    {formData
                      ? (Object.entries(formData).length * 100) / 5 + "%"
                      : "0%"}
                  </p>
                </div>
                {formData && (Object.keys(formData).length * 100) / 5 == 100 ? (
                  <p style={{ right: "0", left: "unset" }}>Done</p>
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>
          <div className={styles.c2}>
            <div className={styles.formcont}>
              <h1 className={styles.team_heading}>
                Fill out the form to Schedule FREE 1-1 Consultation with an
                Expert
              </h1>
              <input
                name={"name"}
                className={styles.input}
                placeholder={"Enter your Full Name"}
                type={"text"}
                value={formData && formData.fullname}
                onChange={(e) => {
                  setFormData((res) => ({ ...res, fullname: e.target.value }));
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

        <Section
          title={"Words by: Our Students"}
          color="var(--brand-col1)"
          align="left"
        >
          <div className={styles.parent}>
            <div className={styles.col1}>
              <h2>Listen what our students have to say about us.</h2>
              <p>
                Our students are thrilled with the classes that we offer. They
                consistently express their satisfaction with the quality of the
                instruction, the engaging curriculum, and the supportive
                learning environment. They appreciate the individualized
                attention that they receive from our dedicated teachers, and
                they are making steady progress in their studies. Overall, our
                students are incredibly happy with the education that they are
                receiving, and it shows in their enthusiasm and dedication to
                their studies.
              </p>
              {/* <ul className={styles.words}>
	<li>Many of our students have commented on how much they enjoy the interactive nature of the classes, with a variety of activities and group work that keeps them engaged and motivated.</li>
	<li>The feedback that we receive from our students consistently highlights the supportive and inclusive culture of our school. They feel welcomed and valued as members of our community, and they appreciate the inclusive and respectful atmosphere that our teachers create.</li>
	<li>In addition to the positive comments about the classes themselves, our students also often express appreciation for the extra support that is available to them. Whether it&#39;s through tutoring, office hours, or other resources, our students know that they can get the help that they need to succeed.</li>
	<li>Overall, our students are extremely satisfied with the education that they are receiving, and we are continually working to improve and enhance the learning experience for all of our students.</li>
</ul> */}
            </div>
            <div className={styles.col2}>
              <div className={styles.yt}>
                <YouTube
                  className="embed-container"
                  title=""
                  videoId="GguKjh6un0U"
                  opts={opts}
                />
              </div>
            </div>
          </div>
        </Section>

        <Section
          title={"Know : Your Mentors"}
          color="var(--brand-col2)"
          align="right"
        >
          <div className={styles.parent2}>
            {mentors &&
              mentors.map((i, d) => {
                return (
                  <div className={styles.card}>
                    <div
                      alt={i.role}
                      className={styles.bg}
                      style={{ backgroundImage: "url(" + i.bg + ")" }}
                    ></div>
                    <img alt={i.fullname} src={i.image} />
                    <h2>{i.fullname}</h2>
                    {i.role ? <p className={styles.para}>{i.role}</p> : ""}
                    {i.role2 ? <p className={styles.para}>{i.role2}</p> : ""}
                  </div>
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
            src={result}
          />
        </Section>
        <Section
          title={"Frequently:Asked Questions"}
          color="var(--brand-col2)"
          align="left"
          visible="true"
        >
          <FAQ items={faqs} />
        </Section>
        <Section
          title={"Why you should join:a dedicated IPMAT Coaching?"}
          color="var(--brand-col2)"
          align="left"
          visible="true"
        >
          <>
            <p>
              <span style={{ fontSize: "11pt" }}>
                <span style={{ color: "#000000" }}>
                  That's a great decision if you're an IPMAT aspirant. Joining a
                  dedicated IPMAT coaching program can provide you with
                  structured preparation, expert guidance, and a competitive
                  edge in your preparation for the IPMAT (Integrated Program in
                  Management Aptitude Test). Here are some steps to help you get
                  started:
                </span>
              </span>
            </p>
            <p>
              <span style={{ fontSize: "11pt" }}>
                <span style={{ color: "#000000" }}>
                  <strong>Research Coaching Institutes:</strong> Look for
                  coaching institutes or online platforms that offer IPMAT
                  coaching. Some well-known coaching institutes in India offer
                  specialized courses for IPMAT. Do thorough research to find
                  the one that suits your needs and preferences.
                </span>
              </span>
            </p>
            <p>
              <span style={{ fontSize: "11pt" }}>
                <span style={{ color: "#000000" }}>
                  <strong>Check Reviews and Testimonials: </strong>Read reviews
                  and testimonials from previous students to get an idea of the
                  coaching institute's quality, teaching methods, and success
                  rates.
                </span>
              </span>
            </p>
            <p>
              <span style={{ fontSize: "11pt" }}>
                <span style={{ color: "#000000" }}>
                  <strong>Attend Demo Classes:</strong> Many coaching institutes
                  offer demo classes to help you gauge their teaching style and
                  faculty. Attend these classes to see if you are comfortable
                  with the teaching methods and the faculty.
                </span>
              </span>
            </p>
            <p>
              <span style={{ fontSize: "11pt" }}>
                <span style={{ color: "#000000" }}>
                  <strong>Assess the Faculty:</strong> It's important to have
                  experienced and qualified faculty who can guide you through
                  the IPMAT syllabus. Research the credentials of the faculty
                  members at the coaching institute.
                </span>
              </span>
            </p>
            <p>
              <span style={{ fontSize: "11pt" }}>
                <span style={{ color: "#000000" }}>
                  <strong>Course Curriculum:</strong> Check the course structure
                  and curriculum. Ensure that it covers all the topics and
                  sections of the IPMAT exam.
                </span>
              </span>
            </p>
            <p>
              <span style={{ fontSize: "11pt" }}>
                <span style={{ color: "#000000" }}>
                  <strong>Study Material:</strong> Ask about the study materials
                  provided by the coaching institute. Good study material is
                  crucial for your preparation.
                </span>
              </span>
            </p>
            <p>
              <span style={{ fontSize: "11pt" }}>
                <span style={{ color: "#000000" }}>
                  <strong>Mock Tests:</strong> Frequent mock tests and practice
                  papers are essential for IPMAT preparation. Check if the
                  coaching institute offers a sufficient number of mock tests.
                </span>
              </span>
            </p>
            <p>
              <span style={{ fontSize: "11pt" }}>
                <span style={{ color: "#000000" }}>
                  <strong>Personalized Attention:</strong> Smaller batch sizes
                  often mean more personalized attention. If you prefer
                  one-on-one interaction, consider a coaching center with
                  smaller classes.
                </span>
              </span>
            </p>
            <p>
              <span style={{ fontSize: "11pt" }}>
                <span style={{ color: "#000000" }}>
                  <strong>Location and Accessibility:</strong> Consider the
                  location of the coaching institute. It should be easily
                  accessible from your home or place of stay.
                </span>
              </span>
            </p>
            <p>
              <span style={{ fontSize: "11pt" }}>
                <span style={{ color: "#000000" }}>
                  <strong>Fees and Scholarships:</strong> Understand the fee
                  structure and check if there are any scholarship options
                  available.
                </span>
              </span>
            </p>
            <p>
              <span style={{ fontSize: "11pt" }}>
                <span style={{ color: "#000000" }}>
                  <strong>Online vs. Offline:</strong> Decide whether you want
                  to attend physical classes or prefer online coaching. Online
                  coaching can offer flexibility, but physical classes can
                  provide a more immersive learning experience.
                </span>
              </span>
            </p>
            <p>
              <span style={{ fontSize: "11pt" }}>
                <span style={{ color: "#000000" }}>
                  <strong>Time Management:</strong> Ensure that the coaching
                  class timings align with your daily schedule.
                </span>
              </span>
            </p>
            <p>
              <span style={{ fontSize: "11pt" }}>
                <span style={{ color: "#000000" }}>
                  <strong>Plan Your Study Schedule:</strong> Once you join the
                  coaching institute, make sure to create a study schedule that
                  combines both classroom learning and self-study. Consistency
                  is key.
                </span>
              </span>
            </p>
            <p>
              <span style={{ fontSize: "11pt" }}>
                <span style={{ color: "#000000" }}>
                  <strong>Stay Committed:</strong> Stay dedicated and committed
                  to your preparation. Your success depends on your effort and
                  consistency.
                </span>
              </span>
            </p>
            <p>
              <span style={{ fontSize: "11pt" }}>
                <span style={{ color: "#000000" }}>
                  <strong>Stay Informed:</strong> Keep up with IPMAT updates and
                  any changes in the exam pattern. The IPMAT exam may evolve, so
                  make sure your coaching program adapts accordingly.
                </span>
              </span>
            </p>
            <p>
              <span style={{ fontSize: "11pt" }}>
                <span style={{ color: "#000000" }}>
                  Remember that coaching can be a valuable resource, but success
                  ultimately depends on your efforts and dedication. Make the
                  most of your coaching program and ensure that you also engage
                  in self-study and practice to excel in the IPMAT exam. Good
                  luck with your preparation!
                </span>
              </span>
            </p>
            <p>&nbsp;</p>
          </>
        </Section>
        {/* <button onClick={()=>{handleAPI()}} >Test</button> */}

        <div dangerouslySetInnerHTML={{ __html: datahtml }}></div>
        <Footer />
      </main>
    </>
  );
}

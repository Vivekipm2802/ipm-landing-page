import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import { useState, useEffect } from "react";
import styles from "./NPAT.module.css";
import FAQ from "../../components/FAQ";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Notifications from "../../components/Notification";
import YouTube from "react-youtube";
import axios from "axios";
import Section from "../../components/Section";
import qs from "qs";
const inter = Inter({ subsets: ["latin"] });
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import Switcher from "../../components/Switcher";
import CustomSelect from "../../components/CustomSelect";
import { supabase } from "../../utils/supabaseClient";
import { years } from "../../utils/years";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import "tailwindcss/tailwind.css";
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
  const [accessToken, setAccessToken] = useState();
  const [instanceUrl, setInstanceUrl] = useState();

  const testimonials = [
    {
      icon: "https://ipmcareer.com/wp-content/uploads/2023/01/resutls-1.png",
      heading: "Best NPAT Results",
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
  async function cronberryTrigger(
    username,
    u_email,
    u_mobile,
    u_year,
    u_city,
    linke
  ) {
    console.log(arguments);

    return new Promise((resolve, reject) => {
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
            paramValue: "NPAT Mumbai Landing Page",
          },
        ],
      });
      var xhr = new XMLHttpRequest();
      xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
          resolve();
        }
      });
      xhr.onerror = reject;
      xhr.open(
        "POST",
        "https://register.cronberry.com/api/campaign/register-audience-data"
      );
      xhr.setRequestHeader("Content-Type", "application/json");

      xhr.send(data);
    });
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
      image:
        "https://ipmcareer.com/all-india-mock/wp-content/uploads/manish.jpeg",
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
      image: "/napt.jpg",
      alt: "IPM Careers NPAT Results ",
    },
    {
      image: "/napt.jpg",
      alt: "IPM Careers NPAT Results",
    },
  ];
  const faqs = [
    {
      question: "Who is eligible to register?",
      answer:
        "Individuals who have either successfully completed their 12th-grade examination or those who have appeared for it are eligible to register.",
    },
    {
      question: "What types of examinations are included in the categories?",
      answer:
        "There are three distinct categories: NPAT, NMIMS CET, and NMIMS LAT.",
    },
    {
      question: "How many attempts are allowed for each examination category?",
      answer:
        "Candidates are permitted one main attempt and up to two retakes for each examination category.",
    },
    {
      question: "Will I receive my exam results immediately?",
      answer:
        "Results will be posted after the examinations, and candidates can log in to check their scores.",
    },
    {
      question: "Which scores will NMIMS accept?",
      answer:
        "NMIMS will consider the best score obtained from all attempts in each category for merit list generation.",
    },
    {
      question: "Is the examination center-based or home-based?",
      answer:
        "The examination will be conducted at designated test centers only. NMIMS may review this in case of unforeseen circumstances.",
    },
    {
      question:
        "Is there a separate application form for NPAT, NMIMS CET, and NMIMS LAT?",
      answer:
        "There is a single application form where candidates can select multiple examinations.",
    },
  ];

  const reviews = [
    {
      image: "./pranav.png",
      fullname: "Pranav Bahadur",
      college: "NPAT 2023   ",
      title: "Exceptional NPAT Coaching by IPM Careers",
      review:
        " IPM Careers provided exceptional NPAT coaching with dedicated instructors and effective study materials. Thanks to their support, I aced the NPAT exam.",
    },
    {
      image: "/sanya.png",
      fullname: "Sanya",
      college: "NPAT 2023",
      title: "Decent NPAT Preparation with IPM Careers",
      review:
        "I found IPM Careers helpful for NPAT prep, class sizes are managed well for more personalized attention.",
    },
    {
      image:
        "https://www.ipmcareer.com/wp-content/uploads/2023/01/WhatsApp-Image-2023-01-06-at-1.54.33-PM-e1673093647344.jpeg",
      fullname: "Srestha",
      college: "NPAT 2023",
      title: "Impressive NPAT Coaching Experience at IPM Careers",
      review:
        "I had a very great experience during my NPAT Preparation , Teachers are so helpful",
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
      Best & Promising<span className={styles.blue}>&nbsp;NPAT Results</span>
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
    if (!formData.year) {
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
    await cronberryTrigger(
      formData.fullname,
      formData.email,
      formData.phone,
      formData.year,
      formData.city,
      "https://register.ipmcareer.com"
    );
    const { data, error } = await supabase
      .from("ipm_leads")
      .insert({
        name: formData.fullname,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        year: formData.year,
        source: "IPM Register Page",
      })
      .select();
    if (data) {
      console.log("inserted");
    } else if (error) {
      console.log(error);
    }
    await axios.post("/api/contactEmail", formData);
    await callSalesforceOAuth();
    await createSalesforceLead();
    setNotification("Submitted successfully!");
    setLoader(false);
    setSubmitted(true);
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

  async function callSalesforceOAuth() {
    const data = qs.stringify({
      grant_type: 'password',
      client_id: process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_ID,
      client_secret: process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_SECRET,
      username: process.env.NEXT_PUBLIC_SALESFORCE_USERNAME,
      password: process.env.NEXT_PUBLIC_SALESFORCE_PASSWORD
    });

    try {
      const response = await axios.post('https://login.salesforce.com/services/oauth2/token', data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      console.log(response.data);
      setAccessToken(response.data.access_token);
      setInstanceUrl(response.data.instance_url);
    } catch (error) {
      console.error('Error calling Salesforce OAuth:', error);
    }
  }

  async function createSalesforceLead() {
    if (!accessToken || !instanceUrl) {
      console.error('Access token or instance URL not available');
      return;
    }

    const nameParts = formData.fullname.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || firstName; // If only one name, use it as lastName

    const leadData = {
      FirstName: firstName,
      LastName: lastName,
      Email: formData.email,
      MobilePhone: formData.phone,
      State: '', // Not provided in formData
      City: formData.city,
      Program__c: 'Management',
      Program_Level__c: 'Postgraduate Programs',
      Course__c: 'MBA',
      LeadSource: 'API',
      utm_source__c: 'IPM',
      UTM_Campaign_Name__c: ''
    };

    try {
      const response = await axios.post(`${instanceUrl}/services/apexrest/LeadCreation`, leadData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      console.log('Lead creation response:', response.data);
    } catch (error) {
      console.error('Error creating Salesforce lead:', error.response ? error.response.data : error.message);
    }
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
            <h2>Premium NPAT Crash Course by IPM Careers</h2>
            <p>Join now to grab the opportunity to learn from our experts</p>
            <div className={styles.trust}>Starting from 15th March</div>
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
                Fill out the form to Register for NPAT Crash Course
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
                defaultText="When are you planning to take NPAT?"
                noPadding={true}
                objects={Array(5)
                  .fill()
                  .map((i, d) => {
                    const currentDate = new Date();
                    const currentYear = currentDate.getFullYear();
                    return {
                      title: currentYear + d,
                      value: currentYear + d,
                    };
                  })}
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
              <div
                onClick={() => {
                  SubmitContact();
                }}
                className={styles.submit}
              >
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
                  videoId="6ZsYsn-ykpk"
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

        <Section>
          <SyllabusSection
            syllabusData={quantitativeAptitudeData}
          ></SyllabusSection>

          <SyllabusSection syllabusData={verbalAbilityData}></SyllabusSection>
          <SyllabusSection syllabusData={lrData}></SyllabusSection>
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
              "https://www.ipmcareer.com/wp-content/uploads/2023/10/NPAT-Results.jpg"
            }
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

        {/* <button onClick={()=>{handleAPI()}} >Test</button> */}

        <div dangerouslySetInnerHTML={{ __html: datahtml }}></div>
        <Footer diff={true} />
      </main>
    </>
  );
}

const lrData = {
  title: "Logical Reasoning Syllabus 2025",
  description:
    "The logical reasoning section include sub-topics topics like decision-making, Venn diagrams, figure analogy, figure matching, and problem-solving. Practice mock tests to improve your time management skills and problem-solving skills.",
  topics: [
    {
      topic: "Critical Thinking",
      subTopic: [
        "Decision Making (Take into cognizance various rules/ conditions and take decisions based upon those rules/ conditions).",
        "Problem Solving (To analyze the given information and condense all the information in a suitable form and answer the questions asked).",
      ],
    },
    {
      topic: "Verbal-Logical Reasoning",
      subTopic: [
        "Derive conclusions from logical premises or assess the validity of arguments based on statements of facts.",
      ],
    },
    {
      topic: "Data Sufficiency",
      subTopic: [
        "Judge if the information given is sufficient to answer the question or if some additional information is required",
      ],
    },
    {
      topic: "Numerical Reasoning",
      subTopic: [
        "Venn Diagram (Identify the class-sub-class relationship among given group items and illustrate it diagrammatically) Mathematical Equalities.",
      ],
    },
    {
      topic: "Data Interpretation",
      subTopic: [
        "Be able to use the information given in graphs and charts to answer questions.",
      ],
    },
    {
      topic: "Spatial Reasoning",
      subTopic: [
        "Figure Analogy (Choosing the figure from the alternatives that match with the relationship specified by a given figural pair) Figure Matching/ Classification (Notice the common quality in figures to be able to match figures or find the odd one out) Figure Series (To discover a pattern in the formation of figures in a sequence to be able to complete the series/ identify the missing figures).",
      ],
    },
  ],
};

export function SyllabusSection({ syllabusData }) {
  return (
    <div className="max-w-6xl !pt-12 mt-4 border-t-1 mx-auto p-0 md:p-4 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-center text-primary">
          {syllabusData.title}
        </h1>
        <p className="text-muted-foreground text-sm text-center max-w-3xl mx-auto">
          {syllabusData.description}
        </p>
      </div>

      <Table aria-label="Syllabus topics" className="min-w-full">
        <TableHeader>
          <TableColumn>TOPIC</TableColumn>
          <TableColumn>SUB-TOPICS</TableColumn>
        </TableHeader>
        <TableBody>
          {syllabusData.topics.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{item.topic}</TableCell>
              <TableCell>
                <ul className="list-disc list-inside">
                  {item.subTopic.map((subTopic, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground">
                      {subTopic}
                    </li>
                  ))}
                </ul>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

const quantitativeAptitudeData = {
  title: "Quantitative Aptitude Syllabus 2025",
  description:
    "In the quantitative section, you need to focus more on topics like number series, set theory, percentage, functions, linear & quadratic equations, profit & loss, time & work, height and distance, compound interest, fractions, surds, and decimals.",
  topics: [
    {
      topic: "Number System",
      subTopic: ["Fractions, Surds, and Decimals, Number Series."],
    },
    {
      topic: "Arithmetic",
      subTopic: [
        "Percentages, Profit & Loss, Discount, Compound Interest & Annuities, Ratio & Proportions, Time, Work & Distance, 2D & 3D Figures- Areas & Volumes.",
      ],
    },
    {
      topic: "Algebra",
      subTopic: [
        "Basic Algebraic Identities, Equations- Linear & Quadratic Sequence, and Series (AP, GP).",
      ],
    },
    {
      topic: "Sets and Functions",
      subTopic: [
        "Sets, Operation on Sets and their Applications using Venn Diagrams, functions.",
      ],
    },
    {
      topic: "Elementary Statistics & Probability",
      subTopic: ["Mean, Mode and Median, Measures and Dispersion."],
    },
    {
      topic: "Trigonometry",
      subTopic: ["Trigonometric Ratios, identities, heights, and distances."],
    },
  ],
};

const verbalAbilityData = {
  title: "Verbal Ability Syllabus 2025",
  description:
    "In the verbal ability section, the questions are based on tenses, prepositions, grammar, determiners, connectives, grasping ideas, identifying relationships, interpreting ideas, moods, characteristics of characters, tone of a passage, inferring, getting the central theme, and evaluating.",
  topics: [
    {
      topic: "Error Recognition",
      subTopic: ["Identifying grammatical structure and usage"],
    },
    {
      topic: "Applied Grammar",
      subTopic: [
        "Using prepositions, determiners, connectives, and tenses adequately.",
      ],
    },
    {
      topic: "Vocabulary",
      subTopic: ["Understanding the meaning of underlined words in sentences"],
    },
    {
      topic: "Contextual Usage",
      subTopic: ["Using appropriate words in the given context"],
    },
    {
      topic: "Sequencing of Ideas",
      subTopic: [
        "Putting ideas into logical sequence by putting jumbled sentences in the correct order.",
      ],
    },
    {
      topic:
        "Reading Comprehension (3 in Passages of 400-500 words with 5 Questions per Passage)",
      subTopic: [
        "Locating Information, grasping ideas, identifying relationships, interpreting ideas, moods, characteristics of characters, tone of the passage, inferring, getting the central theme, evaluating",
      ],
    },
  ],
};

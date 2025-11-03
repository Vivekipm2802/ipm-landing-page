"use client";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import styles from "./Home.module.css";
import Switcher from "../components/Switcher";
import CustomSelect from "../components/CustomSelect";
import { years } from "../utils/years";
import Notifications from "../components/Notification";
import axios from "axios";
import { supabase } from "../utils/supabaseClient";

// Simple utility to conditionally join class names (similar to clsx/cn)
function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

// Custom Accordion Components
const CustomAccordionItem = ({ value, children, className }) => {
  return <div className={cn("border-b", className)}>{children}</div>;
};

const CustomAccordionTrigger = ({ children, onClick, isOpen, className }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline",
        className
      )}
      aria-expanded={isOpen}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </button>
  );
};

const CustomAccordionContent = ({ children, isOpen, className }) => {
  const [height, setHeight] = useState(isOpen ? undefined : 0);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div
      ref={contentRef}
      style={{ height: height, overflow: "hidden" }}
      className={cn(
        "transition-all duration-300 ease-in-out",
        isOpen ? "animate-accordion-down" : "animate-accordion-up",
        className
      )}
    >
      <div className="pb-4 pt-0">{children}</div>
    </div>
  );
};

export default function IPM() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openFAQ, setOpenFAQ] = useState(null);

  // Form section dependencies
  const [formData, setFormData] = useState();
  const [students, setStudents] = useState(5355);

  // Notification state and handler (copied from index.js)
  const [notificationText, setNotificationText] = useState();
  const [timeoutId, setTimeoutId] = useState(null);
  const [loader, setLoader] = useState(false);

  const [isSubmitted, setSubmitted] = useState(false);

  function setNotification(de) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setNotificationText(de);
    const id = setTimeout(() => {
      setNotificationText();
      setTimeoutId(null);
    }, 2500);
    setTimeoutId(id);
  }

  // Features array (copied from index.js)
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

  // Validation functions (copied from index.js)
  function validatePhone(phone) {
    const re = /^(\+\d{1,4})?(?!0+\s+,?$)\d{10}\s*,?$/;
    return re.test(phone);
  }
  function validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  // SubmitContact handler (adapted from index.js)
  async function SubmitContact() {
    if (formData == undefined) {
      setNotification("All Fields are empty");
      return null;
    }
    if (!formData.fullname || formData.fullname.trim() === "") {
      setNotification("Fullname field is empty");
      return null;
    }
    if (!formData.email || formData.email.trim() === "") {
      setNotification("Email field is empty");
      return null;
    }
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(formData.email)) {
      setNotification("Email is not valid");
      return null;
    }
    if (!formData.phone || formData.phone.trim() === "") {
      setNotification("Phone field is empty");
      return null;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setNotification("Phone number is not valid");
      return null;
    }
    if (!formData.year || formData.year.trim() === "") {
      setNotification("Year field is empty");
      return null;
    }
    const year = parseInt(formData.year);
    if (isNaN(year) || year < 1900 || year > 2099) {
      setNotification("Year is not valid");
      return null;
    }
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
    await axios.post("/api/contactEmail", formData);
    setNotification("Submitted successfully!");
    if (!error) {
      console.log("inserted");
    } else if (error) {
      console.log(error);
    }
  }

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

  const totalSlides = 2;
  const images = [
    "/web_flyer-20251103-085238.png",
    "https://res.cloudinary.com/duyo9pzxy/image/upload/v1752922547/INDORE-BANNER_2_hupw3s.jpg",
  ];
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  const handleFAQClick = (value) => {
    setOpenFAQ(openFAQ === value ? null : value);
  };

  return (
    <div className="font-sans overflow-x-hidden">
      {notificationText && notificationText.length > 2 ? (
        <Notifications text={notificationText} />
      ) : (
        ""
      )}

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

      {/* Header with contact info */}
      <div className="bg-[#833589] text-white p-3 flex items-center justify-end">
        <div className="container mx-auto px-4 max-w-7xl flex justify-end">
          <div className="flex items-center">
            <span>For Enquiry: </span>
            <a href="tel:+919616383524" className="flex items-center ml-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              +919616383524
            </a>
          </div>
        </div>
      </div>
      {/* Image Slider */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: "auto" }}
      >
        <div
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {images.map((src, index) => (
            <div key={index} className="min-w-full relative">
              <Image
                src={src || "/placeholder.svg"}
                alt={`Slide ${index + 1}`}
                width={1200}
                height={600}
                className="w-full h-auto object-contain"
                style={{ backgroundColor: "#f5f5f5" }}
                priority={index === 0}
              />
            </div>
          ))}
        </div>
        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-[#833589]/70 hover:bg-[#833589] rounded-full p-3 z-10"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-[#833589]/70 hover:bg-[#833589] rounded-full p-3 z-10"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>
        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
          {[...Array(totalSlides)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? "bg-[#F3B51A] scale-110"
                  : "bg-white/70 hover:bg-white"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* --- Inserted Form Section --- */}
      <section className={styles.maincont} id="form">
        <div className={styles.grad1}></div>
        <div className={styles.grad2}></div>
        <div className={styles.c1}>
          <h2>India's Premium IIMB-UG Course by IPM Careers</h2>
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
              Fill out the form to Schedule FREE 1-1 Consultation with an Expert
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

      {/* Course Overview Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-[#833589]">
            Course <span className="text-[#F3B51A]">Overview</span>
          </h2>
          <div className="max-w-4xl mx-auto bg-gray-50 p-8 rounded-xl shadow-lg">
            <p className="text-gray-700 leading-relaxed mb-6">
              The Indian Institute of Management Bangalore (IIMB), one of
              India’s premier institutions for management and interdisciplinary
              education, is set to launch its first-ever full-time undergraduate
              degree programmes—a major milestone in its academic journey. These
              pioneering four-year BSc (Honours) degrees in Economics and Data
              Science will be offered under the newly established School of
              Multidisciplinary Studies at IIMB’s upcoming Jigani campus. The
              programme is designed to shape responsible, future-ready
              individuals equipped to lead in fields where data, policy,
              business, and analytical thinking intersect.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Launching in the 2026–27 academic year, this new undergraduate
              offering blends the academic depth of IIM Bangalore with the
              flexibility of the National Education Policy (NEP). Students will
              choose a major in either Economics or Data Science, with optional
              minors in Business, enabling them to build a well-rounded
              foundation. The curriculum also encourages interdisciplinary
              thinking through electives like Environmental Economics,
              Algorithmic Game Theory, Supply Chain Optimization, Big Data
              Computing, and more. With opportunities for international
              exchange, two internship terms, and modules on ethics, philosophy,
              and communication, the programme offers a holistic learning
              experience. Students also have the option to exit after 3 years
              with a degree, or continue for the full four-year Honours with
              Research. This bold academic step reflects IIM Bangalore’s vision
              to offer high-quality undergraduate education beyond traditional
              professional paths like engineering and medicine, helping shape a
              new generation of analytical thinkers, researchers, and business
              leaders.
            </p>
          </div>
        </div>
      </section>
      {/* Online Courses Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#833589]">
            Our Online <span className="text-[#F3B51A]">Courses</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-8 max-w-4xl mx-auto">
            {/* IPMAT 2025 Course */}
            <div className="bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 max-w-sm w-full">
              <div className="relative h-auto aspect-square overflow-hidden">
                <Image
                  src="/web_20251103-085229.png"
                  alt="IPMAT 2025 Online Course"
                  width={1080}
                  height={1080}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-[#833589] mb-4">
                  IIM B UG
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-[#833589] mr-2">»</span>
                    <span>250+ hours of live interactive sessions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#833589] mr-2">»</span>
                    <span>
                      Access to all recorded sessions anytime, anywhere
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#833589] mr-2">»</span>
                    <span>Dedicated IPMAT Books and Modules</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#833589] mr-2">»</span>
                    <span>10+ Hash Mocks and 100+ Concept wise tests</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#833589] mr-2">»</span>
                    <span>
                      Regular one-on-one or group doubt-clearing sessions
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#833589] mr-2">»</span>
                    <span>Detailed Analysis to track your Progress</span>
                  </li>
                </ul>
                <div className="mt-6 text-right">
                  <a
                    href="https://pages.razorpay.com/imbprep"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-[#833589] text-white text-xl font-bold py-2 px-6 rounded-full shadow-md hover:bg-[#6e2c73] transition duration-300"
                  >
                   <s>₹20,000</s>  ₹15,000
                  </a>
                </div>
              </div>
            </div>
            {/* IPMAT 2026 Course */}
            {/* <div className="bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 max-w-sm w-full">
              <div className="relative h-auto aspect-square overflow-hidden">
                <Image
                  src="https://res.cloudinary.com/duyo9pzxy/image/upload/v1747124808/WhatsApp_Image_2025-05-13_at_13.54.06_vlta8g.jpg"
                  alt="IPMAT 2026 Online Course"
                  width={1080}
                  height={1080}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-[#833589] mb-4">PI Prepration Kit</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-[#833589] mr-2">»</span>
                    <span>Mentorship by alumni from IIMs, IITs & top global universities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#833589] mr-2">»</span>
                    <span>Real-time mock interviews</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#833589] mr-2">»</span>
                    <span>Profile grooming & answer structuring</span>
                  </li>
                </ul>
                <div className="mt-6 text-right">
                  <span className="inline-block bg-[#833589] text-white text-xl font-bold py-2 px-6 rounded-full shadow-md">
                    ₹70,000
                  </span>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </section>
      {/* Words by our students */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-[#833589]">
            Words By Our <span className="text-[#F3B51A]">Students</span>
          </h2>
          <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Our students are our biggest advocates. Hear directly from them
            about their experience with IPM Careers and how our coaching helped
            them achieve their dreams.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 relative">
              <div className="absolute -top-5 left-8 text-6xl text-[#833589]/10">
                "
              </div>
              <p className="text-gray-600 mb-6 relative z-10">
                "IPM Careers helped me crack IPMAT with their structured
                approach and dedicated mentorship. The faculty is extremely
                knowledgeable and always available to clear doubts. I couldn't
                have made it to IIM Indore without their guidance."
              </p>
              <div className="flex items-center">
                <div className="w-14 h-14 bg-[#833589] rounded-full flex items-center justify-center text-white font-bold text-xl">
                  RS
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-lg">Parth Goyal</h4>
                  <p className="text-sm text-gray-500">
                    IIM Indore, Batch of 2024
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 relative">
              <div className="absolute -top-5 left-8 text-6xl text-[#833589]/10">
                "
              </div>
              <p className="text-gray-600 mb-6 relative z-10">
                "The mock tests and interview preparation at IPM Careers were
                spot on. They simulate the actual exam environment which helped
                me manage my time better during the actual exam. Their
                personalized feedback after each mock was invaluable."
              </p>
              <div className="flex items-center">
                <div className="w-14 h-14 bg-[#833589] rounded-full flex items-center justify-center text-white font-bold text-xl">
                  AP
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-lg">Ananya Bansal</h4>
                  <p className="text-sm text-gray-500">
                    IIM Indore, Batch of 2024
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 relative">
              <div className="absolute -top-5 left-8 text-6xl text-[#833589]/10">
                "
              </div>
              <p className="text-gray-600 mb-6 relative z-10">
                "What sets IPM Careers apart is their focus on conceptual
                clarity rather than rote learning. The faculty ensures that you
                understand the fundamentals which helps not just in clearing the
                entrance but also in excelling in the program."
              </p>
              <div className="flex items-center">
                <div className="w-14 h-14 bg-[#833589] rounded-full flex items-center justify-center text-white font-bold text-xl">
                  VK
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-lg">Om Thakre</h4>
                  <p className="text-sm text-gray-500">
                    IIM Indore, Batch of 2024
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="flex flex-col min-h-[100dvh]">
        <main className="flex-1">
          {/* YouTube Video Section */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4 max-w-7xl">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-[#833589]">
                Watch Our{" "}
                <span className="text-[#F3B51A]">Success Stories</span>
              </h2>
              <p className="text-gray-600 text-center max-w-3xl mx-auto mb-10">
                Our students share their journey from preparation to success.
                Listen to their experiences, challenges, and how IPM Careers
                helped them achieve their dreams of getting into prestigious
                IIMs. These testimonials reflect our commitment to excellence
                and personalized coaching.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
                <div className="aspect-video w-full shadow-xl rounded-xl overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/ZcSa6dUvsFU"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg shadow-md border-l-4 border-[#833589]">
                    <h3 className="text-xl font-bold text-[#833589] mb-2">
                      Real Success Stories
                    </h3>
                    <p className="text-gray-600">
                      Watch our students share their authentic experiences and
                      how they cracked the IPMAT with our guidance. These are
                      not just testimonials but roadmaps for your own success.
                    </p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg shadow-md border-l-4 border-[#F3B51A]">
                    <h3 className="text-xl font-bold text-[#833589] mb-2">
                      Proven Strategies
                    </h3>
                    <p className="text-gray-600">
                      Learn about the strategies and techniques that helped our
                      students excel in their IPMAT preparation and secure
                      admissions in top IIMs.
                    </p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg shadow-md border-l-4 border-[#833589]">
                    <h3 className="text-xl font-bold text-[#833589] mb-2">
                      Inspiration & Motivation
                    </h3>
                    <p className="text-gray-600">
                      Get inspired by the journey of our successful students and
                      find the motivation to pursue your own path to success
                      with determination and guidance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* Blog Post Section - Replaced with new content */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4 max-w-7xl">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-[#833589]">
                IIMB Launches UG Programme:{" "}
                <span className="text-[#F3B51A]">
                  4-Year Courses in Economics and Data Science:
                </span>{" "}
                Check All Details
              </h2>
              <div className="prose prose-lg prose-gray max-w-7xl mx-auto dark:prose-invert leading-relaxed space-y-4">
                <p>
                  In an exciting development, the Indian Institute of Management
                  Bangalore (IIMB) is set to launch its very first undergraduate
                  program, kicking off in the academic year 2026–27. Renowned
                  for its excellence in postgraduate management education, IIMB
                  is now stepping into the undergraduate arena, offering 4-year
                  B.Sc. (Hons) degrees in Economics and Data Science. This
                  initiative isn’t just about expanding course offerings; it’s
                  about transforming the landscape of undergraduate education in
                  India.
                </p>

                <h3 className="text-2xl font-bold text-[#833589]">
                  Overview of the Undergraduate Programmes
                </h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    B.Sc. (Hons) in Data Science (with minors in Economics &
                    Business)
                  </li>
                  <li>
                    B.Sc. (Hons) in Economics (with minors in Data Science &
                    Business)
                  </li>
                </ul>
                <p>
                  These programs are crafted to provide a rich, multi-layered
                  academic experience that blends core subject knowledge with a
                  broad interdisciplinary approach. Whether you’re drawn to
                  numbers, human behavior, policy, or technology, these courses
                  will give you a well-rounded foundation.
                </p>

                <h3 className="text-2xl font-bold text-[#833589]">
                  Key Features of the Programmes
                </h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>A strong multi-disciplinary foundation</li>
                  <li>
                    Development of critical thinking and problem-solving skills
                  </li>
                  <li>Diverse, multi-dimensional perspectives</li>
                  <li>Core disciplinary expertise</li>
                  <li>Real-world applications across various domains</li>
                </ul>
                <p>
                  Students won’t just “study” subjects—they’ll immerse
                  themselves in them.
                </p>

                <h3 className="text-2xl font-bold text-[#833589]">
                  Curriculum & Subjects
                </h3>
                <h4 className="text-xl font-semibold text-[#833589]">
                  Economics Programme:
                </h4>
                <p>
                  The Economics stream will delve deeper than just theory. It
                  will explore areas such as:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Public Policy</li>
                  <li>Auction Theory</li>
                  <li>Development Economics</li>
                  <li>Environmental and Health Economics</li>
                  <li>Algorithmic Game Theory</li>
                </ul>
                <p>
                  You’ll discover how economic models function in real-world
                  policies and markets.
                </p>

                <h4 className="text-xl font-semibold text-[#833589]">
                  Data Science Programme:
                </h4>
                <p>
                  The Data Science stream will cover cutting-edge topics like:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Quantitative Risk Management</li>
                  <li>Supply Chain Optimization</li>
                  <li>Big Data Computing</li>
                  <li>Combinatoric Optimization</li>
                </ul>
                <p>
                  You won’t merely analyze numbers; you’ll learn to tackle
                  business, social, and policy challenges using data.
                </p>

                <h3 className="text-2xl font-bold text-[#833589]">
                  Admission Process
                </h3>
                <h4 className="text-xl font-semibold text-[#833589]">
                  Eligibility Criteria:
                </h4>
                <p>To apply, you need to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Have studied Mathematics in Class 11 & 12</li>
                  <li>Have scored at least 60% overall</li>
                </ul>

                <h4 className="text-xl font-semibold text-[#833589]">
                  Entrance Test + Interview:
                </h4>
                <p>The selection process consists of:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    A National Aptitude Test that evaluates:
                    <ul className="list-circle list-inside ml-4">
                      <li>Logical reasoning skills</li>
                      <li>General knowledge</li>
                      <li>English language proficiency</li>
                    </ul>
                  </li>
                  <li>
                    A Personal Interview for candidates who make the shortlist
                  </li>
                </ul>
                <p>
                  The aim is to choose students who can think critically, rather
                  than just those who can score high marks.
                </p>

                <h3 className="text-2xl font-bold text-[#833589]">
                  Application Timeline
                </h3>
                <p>
                  Applications for the first batch will kick off in September
                  2025. So, if you’re currently in Class 11 or 12, be sure to
                  circle that date on your calendar!
                </p>

                <h3 className="text-2xl font-bold text-[#833589]">
                  NEP Alignment and Exit Options
                </h3>
                <p>
                  The programs are in line with the National Education Policy
                  (NEP) and are designed as:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>4-year B.Sc. (Hons) degrees</li>
                  <li>
                    An exit option after 3 years with a suitable qualification
                  </li>
                </ul>
                <p>
                  This flexibility caters to both those who want to dive deep
                  into learning and those looking to jump into the workforce
                  early.
                </p>

                <h3 className="text-2xl font-bold text-[#833589]">
                  Class Size & Expansion Plan
                </h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Initial intake: 40 students per course</li>
                  <li>Target growth: Up to 640 students per program</li>
                </ul>
                <p>
                  This gradual growth strategy ensures that each student
                  receives personal attention, maintains academic rigor, and
                  achieves quality outcomes.
                </p>

                <h3 className="text-2xl font-bold text-[#833589]">
                  Campus and Facilities
                </h3>
                <p>
                  The undergraduate courses will take place at IIMB’s new
                  campus, conveniently located near Bannerghatta National Park.
                  This site is celebrated for:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>A lush, tranquil natural environment</li>
                  <li>Eco-friendly infrastructure</li>
                  <li>Modern academic and residential facilities</li>
                </ul>
                <p>
                  Just picture studying in a setting where nature and knowledge
                  come together.
                </p>

                <h3 className="text-2xl font-bold text-[#833589]">
                  Programme Fee and Scholarships
                </h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Annual Fee: ₹8.5 lakh</li>
                  <li>
                    Scholarships and fee concessions will be offered (details to
                    follow)
                  </li>
                </ul>
                <p>
                  IIMB is committed to fostering diversity and inclusivity
                  within its classrooms.
                </p>

                <h3 className="text-2xl font-bold text-[#833589]">
                  Programme Governance
                </h3>
                <p>
                  These undergraduate programs will be overseen by a new School
                  of Multidisciplinary Studies, ensuring:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Independent governance of the curriculum</li>
                  <li>Integration of various disciplines</li>
                  <li>Academic innovation that holds global significance</li>
                </ul>

                <h3 className="text-2xl font-bold text-[#833589]">
                  Why UG Now?
                </h3>
                <p>
                  Though proposed in 2017, IIMB is launching it now because:
                </p>
                <p className="italic">
                  “There is a shortage of high-quality undergraduate programmes
                  outside engineering and medicine,” said Director Rishikesha T.
                  Krishnan.
                </p>
                <p>
                  The NEP and changing educational landscape made this the
                  perfect time to launch.
                </p>

                <h3 className="text-2xl font-bold text-[#833589]">
                  Comparison With Other IIM Programmes
                </h3>
                <p>
                  When we compare IIMB’s offerings to those of IIM Indore or IIM
                  Rohtak, which feature 5-year Integrated Programmes in
                  Management (IPM) that blend undergraduate and MBA studies,
                  IIMB stands out with its unique 4-year undergraduate degree.
                </p>
                <p>What does this mean for students?</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>More flexibility in their academic journey</li>
                  <li>
                    No obligation to continue with a postgraduate degree at IIM
                  </li>
                  <li>
                    A deeper focus on undergraduate-level knowledge and skills
                  </li>
                </ul>

                <h3 className="text-2xl font-bold text-[#833589]">
                  Vision and Future Outlook
                </h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Natural Sciences</li>
                  <li>Sustainability Studies</li>
                </ul>
                <p>
                  This shows a commitment to a long-term vision of becoming a
                  leader in comprehensive undergraduate education.
                </p>

                <h3 className="text-2xl font-bold text-[#833589]">
                  What Makes This Programme Unique
                </h3>
                <p>
                  IIMB’s undergraduate courses merge the rigorous standards of
                  an IIM education with the inquisitive spirit and adaptability
                  of liberal arts learning.
                </p>
                <p>In essence, it’s designed to nurture:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Smart decision-makers</li>
                  <li>Analytical thinkers</li>
                  <li>
                    Versatile professionals who are ready to tackle future
                    challenges
                  </li>
                </ul>

                <h3 className="text-2xl font-bold text-[#833589]">FAQs</h3>
                <div className="w-full">
                  <CustomAccordionItem value="item-1">
                    <CustomAccordionTrigger
                      onClick={() => handleFAQClick("item-1")}
                      isOpen={openFAQ === "item-1"}
                      className="text-left font-semibold text-lg text-gray-800 hover:no-underline"
                    >
                      Is the UG programme at IIMB integrated with an MBA like
                      other IIMs?
                    </CustomAccordionTrigger>
                    <CustomAccordionContent
                      isOpen={openFAQ === "item-1"}
                      className="text-gray-700 text-lg"
                    >
                      No, it’s a standalone 4-year B.Sc. (Hons) programme,
                      separate from a 5-year integrated MBA.
                    </CustomAccordionContent>
                  </CustomAccordionItem>
                  <CustomAccordionItem value="item-2">
                    <CustomAccordionTrigger
                      onClick={() => handleFAQClick("item-2")}
                      isOpen={openFAQ === "item-2"}
                      className="text-left font-semibold text-lg text-gray-800 hover:no-underline"
                    >
                      Can I leave the programme after three years?
                    </CustomAccordionTrigger>
                    <CustomAccordionContent
                      isOpen={openFAQ === "item-2"}
                      className="text-gray-700 text-lg"
                    >
                      Yes, according to the National Education Policy (NEP), you
                      can choose to exit early after completing three years.
                    </CustomAccordionContent>
                  </CustomAccordionItem>
                  <CustomAccordionItem value="item-3">
                    <CustomAccordionTrigger
                      onClick={() => handleFAQClick("item-3")}
                      isOpen={openFAQ === "item-3"}
                      className="text-left font-semibold text-lg text-gray-800 hover:no-underline"
                    >
                      Are there any scholarships available?
                    </CustomAccordionTrigger>
                    <CustomAccordionContent
                      isOpen={openFAQ === "item-3"}
                      className="text-gray-700 text-lg"
                    >
                      Fee concessions and scholarships will be offered based on
                      financial need and eligibility.
                    </CustomAccordionContent>
                  </CustomAccordionItem>
                  <CustomAccordionItem value="item-4">
                    <CustomAccordionTrigger
                      onClick={() => handleFAQClick("item-4")}
                      isOpen={openFAQ === "item-4"}
                      className="text-left font-semibold text-lg text-gray-800 hover:no-underline"
                    >
                      When do applications open?
                    </CustomAccordionTrigger>
                    <CustomAccordionContent
                      isOpen={openFAQ === "item-4"}
                      className="text-gray-700 text-lg"
                    >
                      Admissions for the inaugural batch will begin in September
                      2025.
                    </CustomAccordionContent>
                  </CustomAccordionItem>
                  <CustomAccordionItem value="item-5">
                    <CustomAccordionTrigger
                      onClick={() => handleFAQClick("item-5")}
                      isOpen={openFAQ === "item-5"}
                      className="text-left font-semibold text-lg text-gray-800 hover:no-underline"
                    >
                      Where will the UG classes take place?
                    </CustomAccordionTrigger>
                    <CustomAccordionContent
                      isOpen={openFAQ === "item-5"}
                      className="text-gray-700 text-lg"
                    >
                      Classes will be held at IIMB’s new campus located near
                      Bannerghatta National Park in Bengaluru.
                    </CustomAccordionContent>
                  </CustomAccordionItem>
                </div>
              </div>
            </div>
          </section>
          {/* Why Choose IPM Careers */}
          <section className="py-16 bg-gradient-to-b from-white to-gray-50">
            <div className="container mx-auto px-4 max-w-7xl">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-[#833589]">
                Why Choose <span className="text-[#F3B51A]">IPM Careers</span>
              </h2>
              <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12">
                We offer a comprehensive approach to IPMAT preparation that
                focuses on conceptual clarity, regular practice, and
                personalized attention to help you achieve your dream of
                studying at IIMs.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-b-4 border-[#833589]">
                  <div className="w-16 h-16 bg-[#833589] rounded-full flex items-center justify-center text-white mb-6 mx-auto">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-center mb-4 text-[#833589]">
                    Expert Faculty
                  </h3>
                  <p className="text-gray-600 text-center">
                    Learn from IIM alumni and industry experts who understand
                    the exam pattern and requirements thoroughly.
                  </p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-b-4 border-[#F3B51A]">
                  <div className="w-16 h-16 bg-[#833589] rounded-full flex items-center justify-center text-white mb-6 mx-auto">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-center mb-4 text-[#833589]">
                    Comprehensive Study Material
                  </h3>
                  <p className="text-gray-600 text-center">
                    Access to well-researched study materials, practice
                    questions, and mock tests designed to match the actual exam.
                  </p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-b-4 border-[#833589]">
                  <div className="w-16 h-16 bg-[#833589] rounded-full flex items-center justify-center text-white mb-6 mx-auto">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-center mb-4 text-[#833589]">
                    Personalized Attention
                  </h3>
                  <p className="text-gray-600 text-center">
                    Small batch sizes ensure individual attention and
                    personalized feedback to help you improve continuously.
                  </p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-b-4 border-[#F3B51A]">
                  <div className="w-16 h-16 bg-[#833589] rounded-full flex items-center justify-center text-white mb-6 mx-auto">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-center mb-4 text-[#833589]">
                    Regular Mock Tests
                  </h3>
                  <p className="text-gray-600 text-center">
                    Regular mock tests and analysis sessions to track your
                    progress and identify areas for improvement.
                  </p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-b-4 border-[#833589]">
                  <div className="w-16 h-16 bg-[#833589] rounded-full flex items-center justify-center text-white mb-6 mx-auto">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-center mb-4 text-[#833589]">
                    Interview Preparation
                  </h3>
                  <p className="text-gray-600 text-center">
                    Comprehensive interview preparation with mock interviews and
                    feedback from experienced mentors.
                  </p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-b-4 border-[#F3B51A]">
                  <div className="w-16 h-16 bg-[#833589] rounded-full flex items-center justify-center text-white mb-6 mx-auto">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-center mb-4 text-[#833589]">
                    Proven Track Record
                  </h3>
                  <p className="text-gray-600 text-center">
                    Consistent results with students securing admissions in top
                    IIMs and other prestigious management institutes.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
      {/* Our Promising Results */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#833589]">
            Our Promising <span className="text-[#F3B51A]">Results</span>
          </h2>
          <div className="mb-12">
            <div className="relative w-full h-[300px] md:h-[500px] rounded-xl overflow-hidden shadow-2xl">
              <Image
                src="https://res.cloudinary.com/duyo9pzxy/image/upload/v1752922547/INDORE-BANNER_2_hupw3s.jpg"
                alt=""
                fill
                style={{ objectFit: "cover", objectPosition: "center" }}
                className="hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#833589]/80 to-transparent flex items-end">
                <div className="p-4 md:p-8 text-white">
                  <h3 className="text-xl md:text-3xl font-bold mb-2">
                    AIR 1 & 7 – Plus 31 More Success Stories in IIM Indore
                  </h3>
                  <p className="text-sm md:text-xl">
                    Trusted by toppers — 33 IPMAT 2025 converts from IPM
                    Careers, including AIR 1 & AIR 7.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl shadow-lg border-t-4 border-[#833589] hover:shadow-xl transition-shadow duration-300">
              <div className="text-5xl font-bold text-[#F3B51A] mb-4">100+</div>
              <h3 className="text-2xl font-bold text-[#833589] mb-2">
                Selections in Top IIMs
              </h3>
              <p className="text-gray-600">
                With over 100 selections across all IIMs, our students have
                consistently performed exceptionally well in the IPMAT exams.
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-xl shadow-lg border-t-4 border-[#F3B51A] hover:shadow-xl transition-shadow duration-300">
              <div className="text-5xl font-bold text-[#833589] mb-4">80%</div>
              <h3 className="text-2xl font-bold text-[#833589] mb-2">
                Success Rate
              </h3>
              <p className="text-gray-600">
                We pride ourselves on maintaining the highest success rate in
                the industry, with over 80% of our students securing admissions
                in top management institutes.
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-xl shadow-lg border-t-4 border-[#833589] hover:shadow-xl transition-shadow duration-300">
              <div className="text-5xl font-bold text-[#F3B51A] mb-4">5+</div>
              <h3 className="text-2xl font-bold text-[#833589] mb-2">
                Years of Excellence
              </h3>
              <p className="text-gray-600">
                With over 5 years of experience in IPMAT coaching, we have
                established ourselves as the premier institute for IPM
                aspirants.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* India's Premium IPMAT Coaching */}
      <section className="py-16 bg-[#833589] text-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              India's Premium IPMAT Coaching
            </h2>
            <p className="text-xl mb-8">
              Join now to grab the opportunity to learn from our experts
            </p>
            <button className="bg-[#F3B51A] hover:bg-[#e5a918] text-[#833589] font-bold py-4 px-10 rounded-md text-lg transition duration-300 shadow-lg transform hover:scale-105">
              TRUSTED BY THOUSANDS OF STUDENTS
            </button>
            <div className="mt-10 flex items-center justify-center">
              <a
                href="https://wa.me/919616383524"
                className="flex items-center bg-white text-[#833589] py-3 px-6 rounded-md hover:bg-gray-100 transition duration-300 font-medium"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-3"
                  fill="#25D366"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Connect on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-[#833589] text-white py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0 text-center md:text-left">
              <h3 className="text-2xl font-bold">IPM Careers</h3>
              <p className="text-sm mt-1">RUN BY IIM ALUMNI</p>
              <p className="mt-4 max-w-md text-white/80">
                India's leading coaching institute for IPMAT and other
                management entrance exams. Helping students achieve their dreams
                since 2018.
              </p>
            </div>
            <div className="text-center md:text-right">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8 mb-6">
                <div>
                  <h4 className="font-semibold mb-3 text-[#F3B51A]">
                    Quick Links
                  </h4>
                  <ul className="space-y-2">
                    <li>
                      <a
                        href="#"
                        className="hover:text-[#F3B51A] transition-colors"
                      >
                        Home
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="hover:text-[#F3B51A] transition-colors"
                      >
                        About Us
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="hover:text-[#F3B51A] transition-colors"
                      >
                        Courses
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="hover:text-[#F3B51A] transition-colors"
                      >
                        Results
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-[#F3B51A]">
                    Contact Us
                  </h4>
                  <ul className="space-y-2">
                    <li>
                      <a
                        href="tel:+919616383524"
                        className="hover:text-[#F3B51A] transition-colors"
                      >
                        +91 9616383524
                      </a>
                    </li>
                    <li>
                      <a
                        href="mailto:info@ipmcareers.com"
                        className="hover:text-[#F3B51A] transition-colors"
                      >
                        info@ipmcareers.com
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-white/20 pt-6">
                <p>
                  © {new Date().getFullYear()} IPM Careers. All Rights Reserved.
                </p>
                <div className="mt-2 flex justify-center md:justify-end space-x-4">
                  <a
                    href="#"
                    className="hover:text-[#F3B51A] transition-colors"
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="#"
                    className="hover:text-[#F3B51A] transition-colors"
                  >
                    Terms of Service
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

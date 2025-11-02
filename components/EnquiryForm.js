import React, { useState } from "react";
import CustomSelect from "./CustomSelect";
import styles from "../pages/Home.module.css";
import axios from "axios";
import { supabase } from "../utils/supabaseClient";

const EnquiryForm = ({
  formData,
  setFormData,
  years,
  setLoader,
  TestApi,
  triggerInterakt,
  cronberryTrigger
}) => {
  const [touched, setTouched] = useState({ email: false, phone: false });
  const [notification, setNotification] = useState("");

  const validateEmail = (email) =>
    /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);

  const validatePhone = (phone) => /^[0-9]{10}$/.test(phone);

  const handleSubmit = async () => {
    // If all fields empty
    if (
      !formData?.fullname?.trim() &&
      !formData?.email?.trim() &&
      !formData?.phone?.trim() &&
      !formData?.city?.trim() &&
      !formData?.year?.trim()
    ) {
      setNotification("Please fill all the fields");
      return;
    }

    if (!formData?.fullname?.trim()) return setNotification("Fullname field is empty");
    if (!formData?.email?.trim()) return setNotification("Email field is empty");
    if (!validateEmail(formData.email)) return setNotification("Email is not valid");
    if (!formData?.phone?.trim()) return setNotification("Phone field is empty");
    if (!validatePhone(formData.phone)) return setNotification("Phone number is not valid");
    if (!formData?.year?.trim()) return setNotification("Year field is empty");
    if (!formData?.city?.trim()) return setNotification("City field is empty");

    setNotification("");
    setLoader?.(true);

    try {
      TestApi();
      triggerInterakt();
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

      if (error) console.log(error);

      await axios.post("/api/contactEmail", formData);
      setNotification("Submitted successfully!");
    } catch (err) {
      console.error(err);
      setNotification("Something went wrong. Try again.");
    } finally {
      setLoader?.(false);
    }
  };

  // ✅ When user edits, clear error
  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setNotification("");
  };

  return (
    <div>
      <div className={styles.formcont}>
        <h1 className={styles.team_heading}>
          Fill out the form to Schedule FREE 1-1 Consultation with an Expert
        </h1>
        <input

          className={styles.input}
          placeholder="Enter your Full Name"
          type="text"
          value={formData?.fullname || ""}
          onChange={(e) => handleInputChange("fullname", e.target.value)}
        />
        <input
          className={`${styles.input} ${touched.email && !validateEmail(formData?.email || "") ? styles.fielderror : ""}`}
          placeholder="Enter your Email Address"
          type="text"
          value={formData?.email || ""}
          onChange={(e) => handleInputChange("email", e.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
        />
        <input
          className={`${styles.input} ${touched.phone && !validatePhone(formData?.phone || "") ? styles.fielderror : ""}`}
          placeholder="Enter your Phone Number"
          type="text"
          value={formData?.phone || ""}
          onChange={(e) => handleInputChange("phone", e.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
        />
        <input
          className={styles.input}
          placeholder="Enter your City"
          type="text"
          value={formData?.city || ""}
          onChange={(e) => handleInputChange("city", e.target.value)}
        />
        <CustomSelect
          full
          defaultText="When are you planning to take IPM?"
          noPadding={true}
          objects={years}
          setSelect={(value) => handleInputChange("year", value)}
        />
        {notification && <p className={styles.error}>{notification}</p>}
        <div onClick={handleSubmit} className={styles.submit}>
          SUBMIT
        </div>
      </div>
    </div>
  );
};

export default EnquiryForm;